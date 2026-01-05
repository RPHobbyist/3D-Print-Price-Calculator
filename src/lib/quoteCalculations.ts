import { QuoteData, Material, Machine, CostConstant, FDMFormData, ResinFormData } from "@/types/quote";

interface CalculationParams {
  material: Material;
  machine: Machine;
  electricityRate: number;
  laborRate: number;
}

interface ConsumableInfo {
  name: string;
  value: number;
}

interface FDMCalculationInput extends CalculationParams {
  formData: FDMFormData;
  consumables?: ConsumableInfo[];
}

interface ResinCalculationInput extends CalculationParams {
  formData: ResinFormData;
  consumables?: ConsumableInfo[];
}

export const calculateFDMQuote = ({
  formData,
  material,
  machine,
  electricityRate,
  laborRate,
  consumables = [],
}: FDMCalculationInput): QuoteData => {
  const printTimeHours = parseFloat(formData.printTime);
  const filamentWeightKg = parseFloat(formData.filamentWeight) / 1000;
  const laborHours = formData.laborHours ? parseFloat(formData.laborHours) : 0;
  const overheadPercentage = formData.overheadPercentage ? parseFloat(formData.overheadPercentage) : 0;
  const markupPercentage = parseFloat(formData.markupPercentage);
  const quantity = formData.quantity ? Math.max(1, parseInt(formData.quantity)) : 1;

  const materialCost = filamentWeightKg * material.cost_per_unit;
  const machineTimeCost = printTimeHours * machine.hourly_cost;
  const powerConsumptionKw = machine.power_consumption_watts ? machine.power_consumption_watts / 1000 : 0;
  const electricityCost = printTimeHours * powerConsumptionKw * electricityRate;
  const laborCost = laborHours * laborRate;
  const consumablesTotal = consumables.reduce((sum, c) => sum + c.value, 0);

  const subtotalBeforeOverhead = materialCost + machineTimeCost + electricityCost + laborCost + consumablesTotal;
  const overheadCost = (subtotalBeforeOverhead * overheadPercentage) / 100;
  const subtotal = subtotalBeforeOverhead + overheadCost;

  const markup = (subtotal * markupPercentage) / 100;
  const unitPrice = subtotal + markup;

  // Calculate total price based on quantity
  const totalPrice = unitPrice * quantity;

  return {
    materialCost: materialCost * quantity,
    machineTimeCost: machineTimeCost * quantity,
    electricityCost: electricityCost * quantity,
    laborCost: laborCost * quantity,
    overheadCost: overheadCost * quantity,
    subtotal: subtotal * quantity,
    markup: markup * quantity,
    unitPrice,
    quantity,
    totalPrice,
    printType: "FDM",
    projectName: formData.projectName,
    printColour: formData.printColour,
    filePath: formData.filePath, // Include file path for printing
    parameters: {
      ...formData,
      materialName: material.name,
      machineName: machine.name,
      consumables,
      consumablesTotal,
    },
  };
};

export const calculateResinQuote = ({
  formData,
  material,
  machine,
  electricityRate,
  laborRate,
  consumables = [],
}: ResinCalculationInput): QuoteData => {
  const printTimeHours = parseFloat(formData.printTime);
  const resinVolumeLiters = parseFloat(formData.resinVolume) / 1000;
  const washingTimeHours = formData.washingTime ? parseFloat(formData.washingTime) / 60 : 0;
  const curingTimeHours = formData.curingTime ? parseFloat(formData.curingTime) / 60 : 0;
  const isopropylCost = formData.isopropylCost ? parseFloat(formData.isopropylCost) : 0;
  const laborHours = formData.laborHours ? parseFloat(formData.laborHours) : 0;
  const overheadPercentage = formData.overheadPercentage ? parseFloat(formData.overheadPercentage) : 0;
  const markupPercentage = parseFloat(formData.markupPercentage);
  const quantity = formData.quantity ? Math.max(1, parseInt(formData.quantity)) : 1;

  const materialCost = resinVolumeLiters * material.cost_per_unit + isopropylCost;
  const totalProcessTime = printTimeHours + washingTimeHours + curingTimeHours;
  const machineTimeCost = totalProcessTime * machine.hourly_cost;
  const powerConsumptionKw = machine.power_consumption_watts ? machine.power_consumption_watts / 1000 : 0;
  const electricityCost = totalProcessTime * powerConsumptionKw * electricityRate;
  const laborCost = laborHours * laborRate;
  const consumablesTotal = consumables.reduce((sum, c) => sum + c.value, 0);

  const subtotalBeforeOverhead = materialCost + machineTimeCost + electricityCost + laborCost + consumablesTotal;
  const overheadCost = (subtotalBeforeOverhead * overheadPercentage) / 100;
  const subtotal = subtotalBeforeOverhead + overheadCost;

  const markup = (subtotal * markupPercentage) / 100;
  const unitPrice = subtotal + markup;

  // Calculate total price based on quantity
  const totalPrice = unitPrice * quantity;

  return {
    materialCost: materialCost * quantity,
    machineTimeCost: machineTimeCost * quantity,
    electricityCost: electricityCost * quantity,
    laborCost: laborCost * quantity,
    overheadCost: overheadCost * quantity,
    subtotal: subtotal * quantity,
    markup: markup * quantity,
    unitPrice,
    quantity,
    totalPrice,
    printType: "Resin",
    projectName: formData.projectName,
    printColour: formData.printColour,
    parameters: {
      ...formData,
      materialName: material.name,
      machineName: machine.name,
      consumables,
      consumablesTotal,
    },
  };
};

export const validateFDMForm = (formData: FDMFormData): string | null => {
  if (!formData.projectName.trim()) return "Project name is required";
  if (!formData.materialId) return "Please select a material";
  if (!formData.machineId) return "Please select a machine";
  if (!formData.printTime || parseFloat(formData.printTime) <= 0) return "Print time must be greater than 0";
  if (!formData.filamentWeight || parseFloat(formData.filamentWeight) <= 0) return "Filament weight must be greater than 0";
  return null;
};

export const validateResinForm = (formData: ResinFormData): string | null => {
  if (!formData.projectName.trim()) return "Project name is required";
  if (!formData.materialId) return "Please select a material";
  if (!formData.machineId) return "Please select a machine";
  if (!formData.printTime || parseFloat(formData.printTime) <= 0) return "Print time must be greater than 0";
  if (!formData.resinVolume || parseFloat(formData.resinVolume) <= 0) return "Resin volume must be greater than 0";
  return null;
};
