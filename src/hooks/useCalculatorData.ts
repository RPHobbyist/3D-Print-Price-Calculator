import { useState, useEffect, useCallback } from "react";
import { Material, Machine, CostConstant } from "@/types/quote";
import { processVisibilityFromDescription } from "@/lib/utils";
import { toast } from "sonner";
import * as sessionStore from "@/lib/sessionStorage";

interface UseCalculatorDataOptions {
  printType: "FDM" | "Resin";
}

interface CalculatorData {
  materials: Material[];
  machines: Machine[];
  constants: CostConstant[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getConstantValue: (name: string) => number;
}

export const useCalculatorData = ({ printType }: UseCalculatorDataOptions): CalculatorData => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [constants, setConstants] = useState<CostConstant[]>([]);
  const [allConstants, setAllConstants] = useState<CostConstant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const materialsData = sessionStore.getMaterials(printType);
      const machinesData = sessionStore.getMachines(printType);
      const constantsData = sessionStore.getConstants();

      setMaterials(materialsData);
      setMachines(machinesData);

      // Process constants to extract visibility
      const processedConstants = constantsData.map((c) => {
        const { description, is_visible } = processVisibilityFromDescription(c.description, c.is_visible);
        return {
          ...c,
          description,
          is_visible
        };
      });

      setAllConstants(processedConstants);
      // Filter for UI: Show if visible
      setConstants(processedConstants.filter((c) => c.is_visible !== false));
    } catch (err) {
      const error = err as Error;
      const errorMessage = error.message || "Failed to load calculator data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [printType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getConstantValue = useCallback((name: string): number => {
    // Search in allConstants to ensure hidden system constants (like Electricity) still work
    const constant = allConstants.find(c =>
      c.name.toLowerCase().includes(name.toLowerCase())
    );
    return constant?.value || 0;
  }, [allConstants]);

  return {
    materials,
    machines,
    constants,
    loading,
    error,
    refetch: fetchData,
    getConstantValue,
  };
};
