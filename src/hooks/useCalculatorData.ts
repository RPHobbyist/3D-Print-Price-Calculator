import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Material, Machine, CostConstant } from "@/types/quote";
import { processVisibilityFromDescription } from "@/lib/utils";
import { toast } from "sonner";

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
      const [materialsRes, machinesRes, constantsRes] = await Promise.all([
        supabase.from("material_presets").select("*").eq("print_type", printType).order("name"),
        supabase.from("machine_presets").select("*").eq("print_type", printType).order("name"),
        supabase.from("cost_constants").select("*").order("name"),
      ]);

      if (materialsRes.error) throw materialsRes.error;
      if (machinesRes.error) throw machinesRes.error;
      if (constantsRes.error) throw constantsRes.error;

      setMaterials(materialsRes.data || []);
      setMachines(machinesRes.data || []);
      setMaterials(materialsRes.data || []);
      setMachines(machinesRes.data || []);

      const fetchedConstants = constantsRes.data || [];

      // Process constants to extract visibility.
      // We use a prefix "[HIDDEN]" in the description field to store this state
      // because we cannot currently modify the database schema to add a real column.
      const processedConstants = fetchedConstants.map((c: any) => {
        const { description, is_visible } = processVisibilityFromDescription(c.description, c.is_visible);
        return {
          ...c,
          description,
          is_visible
        };
      });

      setAllConstants(processedConstants);
      // Filter for UI: Show if visible
      setConstants(processedConstants.filter((c: any) => c.is_visible !== false));
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load calculator data";
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
