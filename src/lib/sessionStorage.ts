// Session Storage - Data persists only during browser session
// Resets when browser/tab is closed

import { QuoteData, Material, Machine, CostConstant } from "@/types/quote";

// Generate unique IDs
const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Default Materials
const defaultMaterials: Material[] = [
    { id: "fdm-pla", name: "PLA", cost_per_unit: 25, unit: "kg", print_type: "FDM" },
    { id: "fdm-abs", name: "ABS", cost_per_unit: 28, unit: "kg", print_type: "FDM" },
    { id: "fdm-petg", name: "PETG", cost_per_unit: 30, unit: "kg", print_type: "FDM" },
    { id: "fdm-tpu", name: "TPU", cost_per_unit: 45, unit: "kg", print_type: "FDM" },
    { id: "resin-standard", name: "Standard Resin", cost_per_unit: 35, unit: "liter", print_type: "Resin" },
    { id: "resin-water-washable", name: "Water Washable Resin", cost_per_unit: 45, unit: "liter", print_type: "Resin" },
    { id: "resin-abs-like", name: "ABS-Like Resin", cost_per_unit: 50, unit: "liter", print_type: "Resin" },
];

// Default Machines
const defaultMachines: Machine[] = [
    { id: "fdm-ender3", name: "Ender 3", hourly_cost: 2, power_consumption_watts: 350, print_type: "FDM" },
    { id: "fdm-prusa-mk3", name: "Prusa i3 MK3S+", hourly_cost: 5, power_consumption_watts: 120, print_type: "FDM" },
    { id: "fdm-bambu-p1s", name: "Bambu Lab P1S", hourly_cost: 8, power_consumption_watts: 350, print_type: "FDM" },
    { id: "resin-elegoo-mars", name: "Elegoo Mars 3", hourly_cost: 3, power_consumption_watts: 45, print_type: "Resin" },
    { id: "resin-anycubic", name: "Anycubic Photon Mono", hourly_cost: 4, power_consumption_watts: 50, print_type: "Resin" },
];

// Default Constants/Consumables
const defaultConstants: CostConstant[] = [
    { id: "electricity", name: "Electricity Rate", value: 0.12, unit: "$/kWh", is_visible: true, description: "Cost per kilowatt-hour" },
    { id: "labor", name: "Labor Rate", value: 15, unit: "$/hr", is_visible: true, description: "Hourly labor cost" },
    { id: "overhead", name: "Overhead Rate", value: 10, unit: "%", is_visible: true, description: "Overhead percentage" },
    { id: "markup", name: "Default Markup", value: 30, unit: "%", is_visible: true, description: "Default profit margin" },
];

// Session Storage Keys
const STORAGE_KEYS = {
    QUOTES: "session_quotes",
    MATERIALS: "session_materials",
    MACHINES: "session_machines",
    CONSTANTS: "session_constants",
    INITIALIZED: "session_initialized",
};

// Initialize session storage with defaults if not already done
const initializeDefaults = () => {
    if (!sessionStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
        sessionStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify([]));
        sessionStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(defaultMaterials));
        sessionStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(defaultMachines));
        sessionStorage.setItem(STORAGE_KEYS.CONSTANTS, JSON.stringify(defaultConstants));
        sessionStorage.setItem(STORAGE_KEYS.INITIALIZED, "true");
    }
};

// Quotes
export const getQuotes = (): QuoteData[] => {
    initializeDefaults();
    return JSON.parse(sessionStorage.getItem(STORAGE_KEYS.QUOTES) || "[]");
};

export const saveQuote = (quote: QuoteData): QuoteData => {
    const quotes = getQuotes();
    const newQuote: QuoteData = {
        ...quote,
        id: generateId(),
        createdAt: new Date().toISOString(),
    };
    quotes.unshift(newQuote);
    sessionStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
    return newQuote;
};

export const deleteQuote = (id: string): void => {
    const quotes = getQuotes().filter(q => q.id !== id);
    sessionStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
};

export const updateQuoteNotes = (id: string, notes: string): void => {
    const quotes = getQuotes().map(q =>
        q.id === id ? { ...q, notes } : q
    );
    sessionStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
};

// Materials
export const getMaterials = (printType?: "FDM" | "Resin"): Material[] => {
    initializeDefaults();
    const materials: Material[] = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.MATERIALS) || "[]");
    return printType ? materials.filter(m => m.print_type === printType) : materials;
};

export const saveMaterial = (material: Omit<Material, "id"> & { id?: string }): Material => {
    const materials = getMaterials();
    if (material.id) {
        // Update existing
        const index = materials.findIndex(m => m.id === material.id);
        if (index !== -1) {
            materials[index] = material as Material;
        }
    } else {
        // Add new
        const newMaterial: Material = {
            ...material,
            id: generateId(),
        } as Material;
        materials.push(newMaterial);
    }
    sessionStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
    return material as Material;
};

export const deleteMaterial = (id: string): void => {
    const materials = getMaterials().filter(m => m.id !== id);
    sessionStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
};

// Machines
export const getMachines = (printType?: "FDM" | "Resin"): Machine[] => {
    initializeDefaults();
    const machines: Machine[] = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.MACHINES) || "[]");
    return printType ? machines.filter(m => m.print_type === printType) : machines;
};

export const saveMachine = (machine: Omit<Machine, "id"> & { id?: string }): Machine => {
    const machines = getMachines();
    if (machine.id) {
        // Update existing
        const index = machines.findIndex(m => m.id === machine.id);
        if (index !== -1) {
            machines[index] = machine as Machine;
        }
    } else {
        // Add new
        const newMachine: Machine = {
            ...machine,
            id: generateId(),
        } as Machine;
        machines.push(newMachine);
    }
    sessionStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(machines));
    return machine as Machine;
};

export const deleteMachine = (id: string): void => {
    const machines = getMachines().filter(m => m.id !== id);
    sessionStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(machines));
};

// Constants
export const getConstants = (): CostConstant[] => {
    initializeDefaults();
    return JSON.parse(sessionStorage.getItem(STORAGE_KEYS.CONSTANTS) || "[]");
};

export const saveConstant = (constant: Omit<CostConstant, "id"> & { id?: string }): CostConstant => {
    const constants = getConstants();
    if (constant.id) {
        // Update existing
        const index = constants.findIndex(c => c.id === constant.id);
        if (index !== -1) {
            constants[index] = constant as CostConstant;
        }
    } else {
        // Add new
        const newConstant: CostConstant = {
            ...constant,
            id: generateId(),
        } as CostConstant;
        constants.push(newConstant);
    }
    sessionStorage.setItem(STORAGE_KEYS.CONSTANTS, JSON.stringify(constants));
    return constant as CostConstant;
};

export const deleteConstant = (id: string): void => {
    const constants = getConstants().filter(c => c.id !== id);
    sessionStorage.setItem(STORAGE_KEYS.CONSTANTS, JSON.stringify(constants));
};

// Reset all session data
export const resetSessionData = (): void => {
    sessionStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    sessionStorage.removeItem(STORAGE_KEYS.QUOTES);
    sessionStorage.removeItem(STORAGE_KEYS.MATERIALS);
    sessionStorage.removeItem(STORAGE_KEYS.MACHINES);
    sessionStorage.removeItem(STORAGE_KEYS.CONSTANTS);
    initializeDefaults();
};
