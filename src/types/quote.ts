// Centralized types for the quote calculator application

export interface QuoteData {
  id?: string;
  materialCost: number;
  machineTimeCost: number;
  electricityCost: number;
  laborCost: number;
  overheadCost: number;
  subtotal: number;
  markup: number;
  totalPrice: number;
  printType: "FDM" | "Resin";
  projectName: string;
  printColour: string;
  parameters: QuoteParameters;
  createdAt?: string;
  notes?: string;
}

export interface QuoteParameters {
  materialName?: string;
  machineName?: string;
  constantName?: string;
  constantValue?: number;
  printTime?: string;
  filamentWeight?: string;
  resinVolume?: string;
  laborHours?: string;
  overheadPercentage?: string;
  markupPercentage?: string;
  [key: string]: any;
}

export interface Material {
  id: string;
  name: string;
  cost_per_unit: number;
  unit: string;
  print_type: "FDM" | "Resin";
}

export interface Machine {
  id: string;
  name: string;
  hourly_cost: number;
  power_consumption_watts: number | null;
  print_type: "FDM" | "Resin";
}

export interface CostConstant {
  id: string;
  name: string;
  value: number;
  unit: string;
  description?: string | null;
}

export interface FDMFormData {
  projectName: string;
  printColour: string;
  materialId: string;
  machineId: string;
  printTime: string;
  filamentWeight: string;
  laborHours: string;
  overheadPercentage: string;
  markupPercentage: string;
  selectedConstantId: string;
}

export interface ResinFormData {
  projectName: string;
  printColour: string;
  materialId: string;
  machineId: string;
  printTime: string;
  resinVolume: string;
  washingTime: string;
  curingTime: string;
  isopropylCost: string;
  laborHours: string;
  overheadPercentage: string;
  markupPercentage: string;
  selectedConstantId: string;
}

export interface QuoteStats {
  totalQuotes: number;
  totalRevenue: number;
  avgQuoteValue: number;
  fdmCount: number;
  resinCount: number;
  recentQuotes: number;
}
