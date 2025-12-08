import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Material, Machine, CostConstant } from "@/types/quote";
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
      setConstants(constantsRes.data || []);
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
    const constant = constants.find(c => 
      c.name.toLowerCase().includes(name.toLowerCase())
    );
    return constant?.value || 0;
  }, [constants]);

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
