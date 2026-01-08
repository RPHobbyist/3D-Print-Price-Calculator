import { useState, useCallback, useMemo, memo } from "react";
import { Calculator } from "lucide-react";
import { toast } from "sonner";
import { QuoteData, ResinFormData } from "@/types/quote";
import { useCalculatorData } from "@/hooks/useCalculatorData";
import { calculateResinQuote, validateResinForm } from "@/lib/quoteCalculations";
import { QuoteCalculator } from "./calculator/QuoteCalculator";
import { FormFieldRow, TextField, SelectField } from "./calculator/FormField";
import { ConsumablesSelector } from "./calculator/ConsumablesSelector";
import { SpoolSelector } from "./calculator/SpoolSelector";
import ResinFileUpload from "./ResinFileUpload";
import { ResinFileData } from "@/lib/resinFileParser";
import { useCurrency } from "@/components/CurrencyProvider";
import { ClientSelector } from "@/components/ClientSelector";

interface ResinCalculatorProps {
  onCalculate: (data: QuoteData) => void;
}

const initialFormData: ResinFormData = {
  projectName: "",
  printColour: "",
  materialId: "",
  machineId: "",
  printTime: "",
  resinVolume: "",
  washingTime: "",
  curingTime: "",
  isopropylCost: "",
  laborHours: "",
  overheadPercentage: "",
  markupPercentage: "20",
  quantity: "1",
  selectedConsumableIds: [],
};

const ResinCalculatorTable = memo(({ onCalculate }: ResinCalculatorProps) => {
  const { materials, machines, constants, loading, getConstantValue } = useCalculatorData({ printType: "Resin" });
  const [formData, setFormData] = useState<ResinFormData>(initialFormData);
  const [selectedSpoolId, setSelectedSpoolId] = useState<string>("");
  const { currency } = useCurrency();

  const updateField = useCallback(<K extends keyof ResinFormData>(field: K, value: ResinFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleResinFileData = useCallback((data: ResinFileData) => {
    let matchedMachineId = '';

    if (data.printerModel) {
      const printerModelLower = data.printerModel.toLowerCase();
      const matchedMachine = machines.find(m =>
        m.name.toLowerCase().includes(printerModelLower) ||
        printerModelLower.includes(m.name.toLowerCase())
      );
      if (matchedMachine) {
        matchedMachineId = matchedMachine.id;
        toast.info(`Auto-selected machine: ${matchedMachine.name}`);
      }
    }

    setFormData(prev => ({
      ...prev,
      projectName: data.fileName ? data.fileName.substring(0, data.fileName.lastIndexOf('.')) || data.fileName : prev.projectName,
      printTime: data.printTimeHours > 0 ? data.printTimeHours.toString() : prev.printTime,
      resinVolume: data.resinVolumeMl > 0 ? data.resinVolumeMl.toString() : prev.resinVolume,
      machineId: matchedMachineId || prev.machineId,
    }));
  }, [machines]);

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
    const validationError = validateResinForm(formData);
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

    // Include selectedSpoolId in formData for inventory tracking
    const formDataWithSpool = {
      ...formData,
      selectedSpoolId: selectedSpoolId || undefined,
    };

    const quoteData = calculateResinQuote({
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
          <p className="font-medium text-foreground">Auto-fill from Resin File</p>
          <p className="text-sm text-muted-foreground">Upload .cxdlpv4 to extract parameters</p>
        </div>
      </div>
      <ResinFileUpload onDataExtracted={handleResinFileData} />
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
          onSelect={(customer) => {
            setFormData(prev => ({
              ...prev,
              customerId: customer?.id || "",
              clientName: customer?.name || ""
            }));
          }}
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
          requiredWeight={(parseFloat(formData.resinVolume) || 0) * (parseInt(formData.quantity) || 1)}
          itemType="bottle"
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
          placeholder="4.5"
        />
      </FormFieldRow>

      <FormFieldRow label="Resin Volume (ml)" required highlight>
        <TextField
          type="number"
          step="0.1"
          value={formData.resinVolume}
          onChange={(v) => updateField("resinVolume", v)}
          placeholder="150"
        />
      </FormFieldRow>

      <FormFieldRow label="Washing Time (minutes)">
        <TextField
          type="number"
          value={formData.washingTime}
          onChange={(v) => updateField("washingTime", v)}
          placeholder="10"
        />
      </FormFieldRow>

      <FormFieldRow label="Curing Time (minutes)">
        <TextField
          type="number"
          value={formData.curingTime}
          onChange={(v) => updateField("curingTime", v)}
          placeholder="15"
        />
      </FormFieldRow>

      <FormFieldRow label={`IPA/Cleaning Cost (${currency.symbol})`}>
        <TextField
          type="number"
          step="0.01"
          value={formData.isopropylCost}
          onChange={(v) => updateField("isopropylCost", v)}
          placeholder="50"
        />
      </FormFieldRow>

      <FormFieldRow label="Labor Hours">
        <TextField
          type="number"
          step="0.1"
          value={formData.laborHours}
          onChange={(v) => updateField("laborHours", v)}
          placeholder="1.0"
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

ResinCalculatorTable.displayName = "ResinCalculatorTable";

export default ResinCalculatorTable;
