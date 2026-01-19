import { useState, useCallback, useMemo, memo, useEffect } from "react";
import { Calculator } from "lucide-react";
import { toast } from "sonner";
import { QuoteData, FDMFormData } from "@/types/quote";
import { useCalculatorData } from "@/hooks/useCalculatorData";
import { calculateFDMQuote, validateFDMForm } from "@/lib/quoteCalculations";
import { QuoteCalculator } from "./QuoteCalculator";
import { FormFieldRow, TextField, SelectField } from "./FormField";
import { ConsumablesSelector } from "./ConsumablesSelector";
import { SpoolSelector } from "./SpoolSelector";
import GcodeUpload from "./GcodeUpload";
import { GcodeData } from "@/lib/parsers/gcodeParser";
import { useCurrency } from "@/hooks/useCurrency";
import { ClientSelector } from "@/components/shared/ClientSelector";
import { Customer, Employee } from "@/types/quote";
import { SurfaceAreaUpload } from "./SurfaceAreaUpload";
import { getEmployees } from "@/lib/core/sessionStorage";

interface FDMCalculatorProps {
  onCalculate: (data: QuoteData) => void;
}

const initialFormData: FDMFormData = {
  projectName: "",
  printColour: "",
  materialId: "",
  machineId: "",
  printTime: "",
  filamentWeight: "",
  laborHours: "",
  overheadPercentage: "",
  markupPercentage: "20",
  quantity: "1",
  priority: "Medium",
  dueDate: "",
  selectedConsumableIds: [],
  filePath: "", // Store uploaded file path
  customerId: "",

  clientName: "",
  assignedEmployeeId: "",
  paintingTime: "",
  paintingLayers: "",
  paintCostPerMl: "",
  paintUsagePerCm2: "",
  surfaceAreaCm2: "",
};

const FDMCalculatorTable = memo(({ onCalculate }: FDMCalculatorProps) => {
  const { materials, machines, constants, loading, getConstantValue } = useCalculatorData({ printType: "FDM" });
  const [formData, setFormData] = useState<FDMFormData>(initialFormData);
  const [selectedSpoolId, setSelectedSpoolId] = useState<string>("");
  const { currency } = useCurrency();
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Load employees on mount
  useEffect(() => {
    setEmployees(getEmployees());
  }, []);

  const [isPaintingEnabled, setIsPaintingEnabled] = useState(false);

  // Sync isPaintingEnabled with initial data if needed (e.g. when editing a quote)
  useEffect(() => {
    if (formData.paintingLayers && parseInt(formData.paintingLayers) > 0 && !isPaintingEnabled) {
      setIsPaintingEnabled(true);
    }
  }, [formData.paintingLayers]);

  const updateField = useCallback(<K extends keyof FDMFormData>(field: K, value: FDMFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleClientSelect = useCallback((customer: Customer | null) => {
    setFormData(prev => ({
      ...prev,
      customerId: customer?.id || "",
      clientName: customer?.name || ""
    }));
  }, []);

  const handleGcodeData = useCallback((data: GcodeData) => {
    let matchedMachineId = '';
    let matchedMaterialId = '';

    // Normalize function: lowercase and remove non-alphanumeric chars
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (data.printerModel) {
      const normalizedModel = normalize(data.printerModel);



      // Find exact match only - the normalized G-code model must match the normalized machine name
      const matchedMachine = machines.find(m => {
        const normalizedMachineName = normalize(m.name);

        // Exact normalized match
        if (normalizedMachineName === normalizedModel) {
          return true;
        }

        // Check if one fully contains the other AND they have same key identifiers
        // e.g., "bambulaba1mini" should match "bambulaba1mini" but NOT "bambulaba1"
        if (normalizedMachineName.includes(normalizedModel) || normalizedModel.includes(normalizedMachineName)) {
          // Additional check: both must have the same suffix (mini, pro, plus, etc.) if any exists
          const modelHasMini = normalizedModel.includes('mini');
          const machineHasMini = normalizedMachineName.includes('mini');
          const modelHasPro = normalizedModel.includes('pro');
          const machineHasPro = normalizedMachineName.includes('pro');
          const modelHasPlus = normalizedModel.includes('plus');
          const machineHasPlus = normalizedMachineName.includes('plus');

          // Only match if modifiers are the same
          return modelHasMini === machineHasMini &&
            modelHasPro === machineHasPro &&
            modelHasPlus === machineHasPlus;
        }

        return false;
      });

      if (matchedMachine) {
        matchedMachineId = matchedMachine.id;
        toast.info(`Auto-selected machine: ${matchedMachine.name}`);
      } else {
        // No machine match found
      }

      // Match material from filament_settings_id
      if (data.filamentSettingsId) {
        const normalizedMaterial = normalize(data.filamentSettingsId);

        const matchedMaterial = materials.find(m => {
          const normalizedName = normalize(m.name);
          return normalizedName.includes(normalizedMaterial) ||
            normalizedMaterial.includes(normalizedName);
        });

        if (matchedMaterial) {
          matchedMaterialId = matchedMaterial.id;
          toast.info(`Auto-selected material: ${matchedMaterial.name}`);
        } else {
          // No material match found
        }
      }

      setFormData(prev => ({
        ...prev,
        projectName: data.fileName ? data.fileName.substring(0, data.fileName.lastIndexOf('.')) || data.fileName : prev.projectName,
        printTime: data.printTimeHours > 0 ? data.printTimeHours.toString() : prev.printTime,
        filamentWeight: data.filamentWeightGrams > 0 ? data.filamentWeightGrams.toString() : prev.filamentWeight,
        machineId: matchedMachineId || prev.machineId,
        materialId: matchedMaterialId || prev.materialId,
        printColour: data.filamentColour || prev.printColour,
        filePath: data.filePath || prev.filePath, // Store the file path
        surfaceAreaCm2: data.surfaceAreaMm2 ? (data.surfaceAreaMm2 / 100).toString() : undefined,
      }));
    }
  }, [machines, materials]);

  const handleConsumablesChange = useCallback((selectedIds: string[]) => {
    updateField("selectedConsumableIds", selectedIds);
    if (selectedIds.length > 0) {
      const totalValue = constants
        .filter(c => selectedIds.includes(c.id))
        .reduce((sum, c) => sum + c.value, 0);
      toast.info(`Selected ${selectedIds.length} consumables (Total: ${currency.symbol}${totalValue.toFixed(2)})`);
    }
  }, [constants, updateField, currency]);

  const calculateQuote = useCallback(() => {
    const validationError = validateFDMForm(formData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const selectedMaterial = materials.find(m => m.id === formData.materialId);
    const selectedMachine = machines.find(m => m.id === formData.machineId);
    const selectedConsumables = constants
      .filter(c => formData.selectedConsumableIds.includes(c.id))
      .map(c => ({ name: c.name, value: c.value }));

    if (!selectedMaterial || !selectedMachine) {
      toast.error("Invalid material or machine selection");
      return;
    }

    // Validate mandatory constants
    const electricityRate = getConstantValue("electricity");
    const laborRate = getConstantValue("labor");

    if (!electricityRate || electricityRate <= 0) {
      toast.error("Electricity Rate is required. Please set it in Settings → Consumables.");
      return;
    }

    if (!laborRate || laborRate <= 0) {
      toast.error("Labor Rate is required. Please set it in Settings → Consumables.");
      return;
    }

    // Include selectedSpoolId in formData for inventory tracking
    const formDataWithSpool = {
      ...formData,
      selectedSpoolId: selectedSpoolId || undefined,
    };

    const quoteData = calculateFDMQuote({
      formData: formDataWithSpool,
      material: selectedMaterial,
      machine: selectedMachine,
      electricityRate: getConstantValue("electricity"),
      laborRate: getConstantValue("labor"),
      consumables: selectedConsumables,
      customerId: formData.customerId,
      clientName: formData.clientName,
    });

    onCalculate(quoteData);
    toast.success("Quote calculated successfully!");
  }, [formData, selectedSpoolId, materials, machines, constants, getConstantValue, onCalculate]);

  const materialOptions = useMemo(() =>
    materials.map(m => ({
      id: m.id,
      label: m.name,
      sublabel: `${currency.symbol}${m.cost_per_unit}/${m.unit}`,
    })), [materials, currency]);

  const machineOptions = useMemo(() =>
    machines.map(m => ({
      id: m.id,
      label: m.name,
      sublabel: `${currency.symbol}${m.hourly_cost}/hr`,
    })), [machines, currency]);

  const consumableItems = useMemo(() =>
    constants.map(c => ({
      id: c.id,
      name: c.name,
      value: c.value,
      unit: c.unit,
    })), [constants]);

  const uploadSection = (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-border">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Calculator className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">Auto-fill from G-code</p>
          <p className="text-sm text-muted-foreground">Upload to extract print time & material</p>
        </div>
      </div>
      <GcodeUpload onDataExtracted={handleGcodeData} />
    </div>
  );

  return (
    <QuoteCalculator loading={loading} onCalculate={calculateQuote} uploadSection={uploadSection}>
      <FormFieldRow label="Project Name" required>
        <TextField
          value={formData.projectName}
          onChange={(v) => updateField("projectName", v)}
          placeholder="Enter project name"
        />
      </FormFieldRow>

      <FormFieldRow label="Client">
        <ClientSelector
          value={formData.customerId}
          onSelect={handleClientSelect}
        />
      </FormFieldRow>

      <FormFieldRow label="Material" required>
        <SelectField
          value={formData.materialId}
          onChange={(v) => {
            updateField("materialId", v);
            // Reset spool selection when material changes
            setSelectedSpoolId("");
            updateField("printColour", "");
          }}
          placeholder="Select material"
          options={materialOptions}
        />
      </FormFieldRow>

      <FormFieldRow label="Color" required>
        <SpoolSelector
          materialId={formData.materialId}
          value={selectedSpoolId}
          onChange={(spoolId, color) => {
            setSelectedSpoolId(spoolId);
            updateField("printColour", color);
          }}
          requiredWeight={parseFloat(formData.filamentWeight) * (parseInt(formData.quantity) || 1) || 0}
        />
      </FormFieldRow>

      <FormFieldRow label="Machine" required>
        <SelectField
          value={formData.machineId}
          onChange={(v) => updateField("machineId", v)}
          placeholder="Select machine"
          options={machineOptions}
        />
      </FormFieldRow>

      <FormFieldRow label="Consumables">
        <ConsumablesSelector
          items={consumableItems}
          selectedIds={formData.selectedConsumableIds}
          onChange={handleConsumablesChange}
        />
      </FormFieldRow>

      <FormFieldRow label="Print Time (hours)" required>
        <TextField
          type="number"
          step="0.1"
          value={formData.printTime}
          onChange={(v) => updateField("printTime", v)}
          placeholder="8.5"
        />
      </FormFieldRow>

      <FormFieldRow label="Filament Weight (grams)" required>
        <TextField
          type="number"
          step="0.1"
          value={formData.filamentWeight}
          onChange={(v) => updateField("filamentWeight", v)}
          placeholder="250"
        />
      </FormFieldRow>

      <FormFieldRow label="Labor Hours">
        <TextField
          type="number"
          step="0.1"
          value={formData.laborHours}
          onChange={(v) => updateField("laborHours", v)}
          placeholder="0.5"
        />
      </FormFieldRow>

      <FormFieldRow label="Overhead (%)">
        <TextField
          type="number"
          step="0.1"
          value={formData.overheadPercentage}
          onChange={(v) => updateField("overheadPercentage", v)}
          placeholder="15"
        />
      </FormFieldRow>

      <FormFieldRow label="Profit Markup (%)">
        <TextField
          type="number"
          step="0.1"
          value={formData.markupPercentage}
          onChange={(v) => updateField("markupPercentage", v)}
          placeholder="20"
        />
      </FormFieldRow>

      <FormFieldRow label="Quantity">
        <TextField
          type="number"
          step="1"
          value={formData.quantity}
          onChange={(v) => updateField("quantity", v)}
          placeholder="1"
        />
      </FormFieldRow>

      <FormFieldRow label="Order Priority">
        <SelectField
          value={formData.priority || "Medium"}
          onChange={(v) => updateField("priority", v)}
          placeholder="Select priority"
          options={[
            { id: "Low", label: "Low" },
            { id: "Medium", label: "Medium" },
            { id: "High", label: "High" },
          ]}
        />
      </FormFieldRow>

      <FormFieldRow label="Due Date">
        <input
          type="date"
          value={formData.dueDate || ""}
          onChange={(e) => updateField("dueDate", e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </FormFieldRow>

      <FormFieldRow label="Assigned Employee">
        <SelectField
          value={formData.assignedEmployeeId || "none"}
          onChange={(v) => updateField("assignedEmployeeId", v === "none" ? "" : v)}
          options={[
            { id: "none", label: "-- Select Employee --" },
            ...employees.map(e => ({ id: e.id, label: `${e.name} (${e.jobPosition})` }))
          ]}
          placeholder="Select employee"
        />
      </FormFieldRow>

      <div className="pt-4 px-2 sm:px-4 border-t border-border">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Post Processing</h3>
          <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold border border-blue-500/20">BETA</span>
        </div>

        <FormFieldRow label="Include Painting">
          <div className="flex items-center h-10">
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-input bg-background"
              checked={isPaintingEnabled}
              onChange={(e) => {
                setIsPaintingEnabled(e.target.checked);
                if (e.target.checked) {
                  updateField("paintingLayers", "1");
                  updateField("paintingTime", "0.5");
                } else {
                  updateField("paintingLayers", "");
                  updateField("paintingTime", "");
                }
              }}
            />
            <span className="ml-2 text-sm text-foreground">Enable</span>
          </div>
        </FormFieldRow>

        {isPaintingEnabled && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <FormFieldRow label="Surface Area (cm²)">
              <div className="flex gap-2 w-full">
                <TextField
                  type="number"
                  value={formData.surfaceAreaCm2}
                  onChange={(v) => updateField("surfaceAreaCm2", v)}
                  placeholder="Enter area manually"
                  endAdornment={
                    <SurfaceAreaUpload
                      className="border-none hover:bg-transparent px-2"
                      onSurfaceAreaDetected={(area) => updateField("surfaceAreaCm2", (area / 100).toString())}
                    />
                  }
                />
                {formData.surfaceAreaCm2 && (
                  <div className="text-xs text-muted-foreground self-center whitespace-nowrap">
                    (Auto-detected from 3MF)
                  </div>
                )}
              </div>
            </FormFieldRow>



            <FormFieldRow label="Coating Layers">
              <TextField
                type="number"
                step="1"
                value={formData.paintingLayers}
                onChange={(v) => updateField("paintingLayers", v)}
                placeholder="2"
              />
            </FormFieldRow>

            <FormFieldRow label={`Paint Cost (${currency.symbol}/ml)`}>
              <TextField
                type="number"
                step="0.01"
                value={formData.paintCostPerMl}
                onChange={(v) => updateField("paintCostPerMl", v)}
                placeholder="0.05"
              />
            </FormFieldRow>

            <FormFieldRow
              label="Paint Usage (ml/cm²)"
              hint={`How to calculate:\n(Initial Paint - Remaining Paint) / Surface Area\n\nExample:\nStarted with 50ml, left with 45ml = 5ml used.\n5ml / 500cm² = 0.01 ml/cm²`}
            >
              <TextField
                type="number"
                step="0.001"
                value={formData.paintUsagePerCm2 || ""}
                onChange={(v) => updateField("paintUsagePerCm2", v)}
                placeholder="0.01"
              />
            </FormFieldRow>

            <FormFieldRow label="Painting Labor (hrs)">
              <TextField
                type="number"
                step="0.1"
                value={formData.paintingTime}
                onChange={(v) => updateField("paintingTime", v)}
                placeholder="0.5"
              />
            </FormFieldRow>
          </div>
        )}
      </div>

    </QuoteCalculator>
  );
});

FDMCalculatorTable.displayName = "FDMCalculatorTable";

export default FDMCalculatorTable;
