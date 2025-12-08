import { useState, useCallback, useMemo, memo } from "react";
import { Calculator } from "lucide-react";
import { toast } from "sonner";
import { QuoteData, ResinFormData } from "@/types/quote";
import { useCalculatorData } from "@/hooks/useCalculatorData";
import { calculateResinQuote, validateResinForm } from "@/lib/quoteCalculations";
import { QuoteCalculator } from "./calculator/QuoteCalculator";
import { FormFieldRow, TextField, SelectField } from "./calculator/FormField";
import ResinFileUpload from "./ResinFileUpload";
import { ResinFileData } from "@/lib/resinFileParser";

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
  selectedConstantId: "",
};

const ResinCalculatorTable = memo(({ onCalculate }: ResinCalculatorProps) => {
  const { materials, machines, constants, loading, getConstantValue } = useCalculatorData({ printType: "Resin" });
  const [formData, setFormData] = useState<ResinFormData>(initialFormData);

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
      printTime: data.printTimeHours > 0 ? data.printTimeHours.toString() : prev.printTime,
      resinVolume: data.resinVolumeMl > 0 ? data.resinVolumeMl.toString() : prev.resinVolume,
      machineId: matchedMachineId || prev.machineId,
    }));
  }, [machines]);

  const handleConstantSelect = useCallback((constantId: string) => {
    const constant = constants.find(c => c.id === constantId);
    if (constant) {
      updateField("selectedConstantId", constantId);
      toast.info(`Selected: ${constant.name} = ${constant.value} ${constant.unit}`);
    }
  }, [constants, updateField]);

  const calculateQuote = useCallback(() => {
    const validationError = validateResinForm(formData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const selectedMaterial = materials.find(m => m.id === formData.materialId);
    const selectedMachine = machines.find(m => m.id === formData.machineId);
    const selectedConstant = constants.find(c => c.id === formData.selectedConstantId);

    if (!selectedMaterial || !selectedMachine) {
      toast.error("Invalid material or machine selection");
      return;
    }

    const quoteData = calculateResinQuote({
      formData,
      material: selectedMaterial,
      machine: selectedMachine,
      electricityRate: getConstantValue("electricity"),
      laborRate: getConstantValue("labor"),
      constantName: selectedConstant?.name,
      constantValue: selectedConstant?.value,
    });

    onCalculate(quoteData);
    toast.success("Quote calculated successfully!");
  }, [formData, materials, machines, constants, getConstantValue, onCalculate]);

  const materialOptions = useMemo(() =>
    materials.map(m => ({
      id: m.id,
      label: m.name,
      sublabel: `₹${m.cost_per_unit}/${m.unit}`,
    })), [materials]);

  const machineOptions = useMemo(() =>
    machines.map(m => ({
      id: m.id,
      label: m.name,
      sublabel: `₹${m.hourly_cost}/hr`,
    })), [machines]);

  const constantOptions = useMemo(() =>
    constants.map(c => ({
      id: c.id,
      label: `${c.name}: ${c.value} ${c.unit}`,
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

      <FormFieldRow label="Constant Value">
        <SelectField
          value={formData.selectedConstantId}
          onChange={handleConstantSelect}
          placeholder="Select a constant (optional)"
          options={constantOptions}
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

      <FormFieldRow label="IPA/Cleaning Cost (₹)">
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
    </QuoteCalculator>
  );
});

ResinCalculatorTable.displayName = "ResinCalculatorTable";

export default ResinCalculatorTable;
