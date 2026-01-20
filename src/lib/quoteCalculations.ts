/*
 * 3D Print Price Calculator
 * Copyright (C) 2025 Rp Hobbyist
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { QuoteData, Material, Machine, FDMFormData, ResinFormData, CostConstant } from "@/types/quote";

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
  paintConsumable?: CostConstant;
  paintConsumable2?: CostConstant;
  customerId?: string;
  clientName?: string;
}

interface ResinCalculationInput extends CalculationParams {
  formData: ResinFormData;
  consumables?: ConsumableInfo[];
  paintConsumable?: CostConstant;
  paintConsumable2?: CostConstant;
  customerId?: string;
  clientName?: string;
}

export const calculateFDMQuote = ({
  formData,
  material,
  machine,
  electricityRate,
  laborRate,
  consumables = [],
  paintConsumable,
  paintConsumable2,
  customerId,
  clientName,
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

  // Painting Calculation
  const paintingTime = formData.paintingTime ? parseFloat(formData.paintingTime) : 0;
  const paintingLayers = formData.paintingLayers ? parseInt(formData.paintingLayers) : 0;
  // Painting fields removed from FormData, using flat consumable value
  const surfaceAreaCm2 = formData.surfaceAreaCm2 ? parseFloat(formData.surfaceAreaCm2) : 0;
  const surfaceAreaCm2ForStorage = surfaceAreaCm2; // Keep cm² value for storage

  const paintingLaborCost = paintingTime * laborRate;

  // Revised formula: Supports both flat rate AND calculated ($/ml) paints
  let paintingMaterialCost = 0;

  if (paintConsumable) {
    // Check if it's a calculated paint ($/ml)
    if (paintConsumable.unit === '$/ml' || paintConsumable.unit.includes('/ml')) {
      // Extract usage rate from description (e.g. "Usage Rate: 0.02ml/cm2")
      // matches "Usage Rate: 0.02" with optional unit suffix
      const usageRateMatch = paintConsumable.description?.match(/Usage Rate:\s*([\d.]+)/i);
      const usageRate = usageRateMatch ? parseFloat(usageRateMatch[1]) : 0.02; // Default to 0.02 if not found

      paintingMaterialCost = paintConsumable.value * surfaceAreaCm2 * Math.max(1, paintingLayers) * usageRate;
    } else {
      // Flat rate
      paintingMaterialCost = paintConsumable.value;
    }
  }

  // Second Painting Calculation (Primary Paint)
  // Re-use logic for second paint if present
  let paintingMaterialCost2 = 0;
  const paintingLayers2 = formData.paintingLayers2 ? parseInt(formData.paintingLayers2) : 0;

  if (paintConsumable2) {
    if (paintConsumable2.unit === '$/ml' || paintConsumable2.unit.includes('/ml')) {
      const usageRateMatch = paintConsumable2.description?.match(/Usage Rate:\s*([\d.]+)/i);
      const usageRate = usageRateMatch ? parseFloat(usageRateMatch[1]) : 0.02;

      paintingMaterialCost2 = paintConsumable2.value * surfaceAreaCm2 * Math.max(1, paintingLayers2) * usageRate;
    } else {
      paintingMaterialCost2 = paintConsumable2.value;
    }
  }

  const paintingCost = paintingLaborCost + paintingMaterialCost + paintingMaterialCost2;

  const subtotalBeforeOverhead = materialCost + machineTimeCost + electricityCost + laborCost + consumablesTotal + paintingCost;
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
    paintingCost: paintingCost * quantity,
    unitPrice,
    quantity,
    totalPrice,
    printType: "FDM",
    projectName: formData.projectName,
    printColour: formData.printColour,
    filePath: formData.filePath, // Include file path for printing
    customerId,
    clientName,
    priority: formData.priority as 'Low' | 'Medium' | 'High' | undefined,
    dueDate: formData.dueDate,
    assignedEmployeeId: formData.assignedEmployeeId,
    parameters: {
      ...formData,
      materialName: material.name,
      machineName: machine.name,
      consumables,
      consumablesTotal,
      paintConsumableValue: paintingMaterialCost,
      paintConsumableValue2: paintingMaterialCost2,
    },
    surfaceAreaCm2: surfaceAreaCm2ForStorage,
  };
};

export const calculateResinQuote = ({
  formData,
  material,
  machine,
  electricityRate,
  laborRate,
  consumables = [],
  paintConsumable,
  paintConsumable2,
  customerId,
  clientName,
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

  // Painting Calculation
  const paintingTime = formData.paintingTime ? parseFloat(formData.paintingTime) : 0;
  const paintingLayers = formData.paintingLayers ? parseInt(formData.paintingLayers) : 0;
  // Painting fields removed from FormData, using flat consumable value
  const surfaceAreaCm2 = formData.surfaceAreaCm2 ? parseFloat(formData.surfaceAreaCm2) : 0;
  const surfaceAreaCm2ForStorage = surfaceAreaCm2; // Keep cm² value for storage

  const paintingLaborCost = paintingTime * laborRate;

  // Primary Paint
  let paintingMaterialCost = 0;

  if (paintConsumable) {
    if (paintConsumable.unit === '$/ml' || paintConsumable.unit.includes('/ml')) {
      const usageRateMatch = paintConsumable.description?.match(/Usage Rate:\s*([\d.]+)/i);
      const usageRate = usageRateMatch ? parseFloat(usageRateMatch[1]) : 0.02;
      paintingMaterialCost = paintConsumable.value * surfaceAreaCm2 * Math.max(1, paintingLayers) * usageRate;
    } else {
      paintingMaterialCost = paintConsumable.value;
    }
  }

  // Secondary Paint
  let paintingMaterialCost2 = 0;
  const paintingLayers2 = formData.paintingLayers2 ? parseInt(formData.paintingLayers2) : 0;

  if (paintConsumable2) {
    if (paintConsumable2.unit === '$/ml' || paintConsumable2.unit.includes('/ml')) {
      const usageRateMatch = paintConsumable2.description?.match(/Usage Rate:\s*([\d.]+)/i);
      const usageRate = usageRateMatch ? parseFloat(usageRateMatch[1]) : 0.02;
      paintingMaterialCost2 = paintConsumable2.value * surfaceAreaCm2 * Math.max(1, paintingLayers2) * usageRate;
    } else {
      paintingMaterialCost2 = paintConsumable2.value;
    }
  }

  const paintingCost = paintingLaborCost + paintingMaterialCost + paintingMaterialCost2;

  const subtotalBeforeOverhead = materialCost + machineTimeCost + electricityCost + laborCost + consumablesTotal + paintingCost;
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
    paintingCost: paintingCost * quantity,
    unitPrice,
    quantity,
    totalPrice,
    printType: "Resin",
    projectName: formData.projectName,
    printColour: formData.printColour,
    customerId,
    clientName,
    parameters: {
      ...formData,
      materialName: material.name,
      machineName: machine.name,
      consumables,
      consumablesTotal,
      paintingTime,
      paintingLayers,
      paintingLayers2,
      paintConsumableValue: paintingMaterialCost,
      paintConsumableValue2: paintingMaterialCost2,
      surfaceAreaCm2: formData.surfaceAreaCm2 ? parseFloat(formData.surfaceAreaCm2) : undefined,
    },
    surfaceAreaCm2: surfaceAreaCm2ForStorage,
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
