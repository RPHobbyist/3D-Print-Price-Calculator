import { useState, useCallback, useMemo, memo } from "react";
import { Calculator } from "lucide-react";
import { toast } from "sonner";
import { QuoteData, FDMFormData } from "@/types/quote";
import { useCalculatorData } from "@/hooks/useCalculatorData";
import { calculateFDMQuote, validateFDMForm } from "@/lib/quoteCalculations";
import { QuoteCalculator } from "./calculator/QuoteCalculator";
import { FormFieldRow, TextField, SelectField } from "./calculator/FormField";
import { ConsumablesSelector } from "./calculator/ConsumablesSelector";
import GcodeUpload from "./GcodeUpload";
import { GcodeData } from "@/lib/gcodeParser";
import { useCurrency } from "@/components/CurrencyProvider";
import { ClientSelector } from "@/components/ClientSelector";
import { Customer } from "@/types/quote";

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
  selectedConsumableIds: [],
  filePath: "", // Store uploaded file path
  customerId: "",
  clientName: "",
};

const FDMCalculatorTable = memo(({ onCalculate }: FDMCalculatorProps) => {
  const { materials, machines, constants, loading, getConstantValue } = useCalculatorData({ printType: "FDM" });
  const [formData, setFormData] = useState<FDMFormData>(initialFormData);
  const { currency } = useCurrency();

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

      console.log('Normalized G-code model:', normalizedModel);

      // find best match
      const matchedMachine = machines.find(m => {
        const normalizedMachineName = normalize(m.name);
        // Check for containment in either direction
        return normalizedMachineName.includes(normalizedModel) ||
          normalizedModel.includes(normalizedMachineName);
      });

      if (matchedMachine) {
        matchedMachineId = matchedMachine.id;
        toast.info(`Auto-selected machine: ${matchedMachine.name}`);
      } else {
        console.log('No machine match found. Available:', machines.map(m => m.name));
      }
    }

    // Match material from filament_settings_id
    if (data.filamentSettingsId) {
      const normalizedMaterial = normalize(data.filamentSettingsId);
      console.log('Normalized G-code material:', normalizedMaterial);

      const matchedMaterial = materials.find(m => {
        const normalizedName = normalize(m.name);
        return normalizedName.includes(normalizedMaterial) ||
          normalizedMaterial.includes(normalizedName);
      });

      if (matchedMaterial) {
        matchedMaterialId = matchedMaterial.id;
        toast.info(`Auto-selected material: ${matchedMaterial.name}`);
      } else {
        console.log('No material match found. Available:', materials.map(m => m.name));
      }
    }

    console.log('📁 FDMCalculatorTable - Received file path:', data.filePath);
    setFormData(prev => ({
      ...prev,
      projectName: data.fileName ? data.fileName.substring(0, data.fileName.lastIndexOf('.')) || data.fileName : prev.projectName,
      printTime: data.printTimeHours > 0 ? data.printTimeHours.toString() : prev.printTime,
      filamentWeight: data.filamentWeightGrams > 0 ? data.filamentWeightGrams.toString() : prev.filamentWeight,
      machineId: matchedMachineId || prev.machineId,
      materialId: matchedMaterialId || prev.materialId,
      printColour: data.filamentColour || prev.printColour,
      filePath: data.filePath || prev.filePath, // Store the file path
    }));
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

    const quoteData = calculateFDMQuote({
      formData,
      material: selectedMaterial,
      machine: selectedMachine,
      electricityRate: getConstantValue("electricity"),
      laborRate: getConstantValue("labor"),
      consumables: selectedConsumables,
      customerId: formData.customerId,
      clientName: formData.clientName,
    });

    console.log('📁 FDMCalculatorTable - Quote created with filePath:', quoteData.filePath);
    onCalculate(quoteData);
    toast.success("Quote calculated successfully!");
  }, [formData, materials, machines, constants, getConstantValue, onCalculate]);

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

      <FormFieldRow label="Print Colour">
        <TextField
          value={formData.printColour}
          onChange={(v) => updateField("printColour", v)}
          placeholder="e.g., Red, Blue, Black"
        />
      </FormFieldRow>

      <FormFieldRow label="Material" required>
        <SelectField
          value={formData.materialId}
          onChange={(v) => updateField("materialId", v)}
          placeholder="Select material"
          options={materialOptions}
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

      <FormFieldRow label="Print Time (hours)" required highlight>
        <TextField
          type="number"
          step="0.1"
          value={formData.printTime}
          onChange={(v) => updateField("printTime", v)}
          placeholder="8.5"
        />
      </FormFieldRow>

      <FormFieldRow label="Filament Weight (grams)" required highlight>
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

      <FormFieldRow label="Quantity" highlight>
        <TextField
          type="number"
          step="1"
          value={formData.quantity}
          onChange={(v) => updateField("quantity", v)}
          placeholder="1"
        />
      </FormFieldRow>
    </QuoteCalculator>
  );
});

FDMCalculatorTable.displayName = "FDMCalculatorTable";

export default FDMCalculatorTable;
