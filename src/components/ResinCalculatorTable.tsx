import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator } from "lucide-react";
import { QuoteData } from "@/pages/Index";
import { toast } from "sonner";

interface ResinCalculatorProps {
  onCalculate: (data: QuoteData) => void;
}

interface Material {
  id: string;
  name: string;
  cost_per_unit: number;
  unit: string;
}

interface Machine {
  id: string;
  name: string;
  hourly_cost: number;
  power_consumption_watts: number | null;
}

interface Constant {
  id: string;
  name: string;
  value: number;
  unit: string;
}

const ResinCalculatorTable = ({ onCalculate }: ResinCalculatorProps) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [constants, setConstants] = useState<Constant[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    projectName: "",
    printColour: "",
    materialId: "",
    machineId: "",
    printTime: "",
    resinVolume: "",
    supportVolume: "",
    washingTime: "",
    curingTime: "",
    isopropylCost: "",
    laborHours: "",
    overheadPercentage: "",
    markupPercentage: "20",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [materialsRes, machinesRes, constantsRes] = await Promise.all([
        supabase.from("material_presets").select("*").eq("print_type", "Resin").order("name"),
        supabase.from("machine_presets").select("*").eq("print_type", "Resin").order("name"),
        supabase.from("cost_constants").select("*").order("name"),
      ]);

      if (materialsRes.error) throw materialsRes.error;
      if (machinesRes.error) throw machinesRes.error;
      if (constantsRes.error) throw constantsRes.error;

      setMaterials(materialsRes.data || []);
      setMachines(machinesRes.data || []);
      setConstants(constantsRes.data || []);
    } catch (error: any) {
      toast.error("Failed to load data from database");
    } finally {
      setLoading(false);
    }
  };

  const getConstantValue = (name: string): number => {
    const constant = constants.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
    return constant?.value || 0;
  };

  const calculateQuote = () => {
    if (!formData.projectName || !formData.materialId || !formData.machineId || !formData.printTime || !formData.resinVolume) {
      toast.error("Please fill in all required fields");
      return;
    }

    const selectedMaterial = materials.find(m => m.id === formData.materialId);
    const selectedMachine = machines.find(m => m.id === formData.machineId);

    if (!selectedMaterial || !selectedMachine) {
      toast.error("Invalid material or machine selection");
      return;
    }

    const printTimeHours = parseFloat(formData.printTime);
    const resinVolumeLiters = parseFloat(formData.resinVolume) / 1000;
    const supportVolumeLiters = formData.supportVolume ? parseFloat(formData.supportVolume) / 1000 : 0;
    const washingTimeHours = formData.washingTime ? parseFloat(formData.washingTime) / 60 : 0;
    const curingTimeHours = formData.curingTime ? parseFloat(formData.curingTime) / 60 : 0;
    const isopropylCost = formData.isopropylCost ? parseFloat(formData.isopropylCost) : 0;
    const laborHours = formData.laborHours ? parseFloat(formData.laborHours) : 0;
    const overheadPercentage = formData.overheadPercentage ? parseFloat(formData.overheadPercentage) : 0;
    const markupPercentage = parseFloat(formData.markupPercentage);

    const electricityRate = getConstantValue("electricity");
    const laborRate = getConstantValue("labor");

    const materialCost = (resinVolumeLiters + supportVolumeLiters) * selectedMaterial.cost_per_unit + isopropylCost;
    const totalProcessTime = printTimeHours + washingTimeHours + curingTimeHours;
    const machineTimeCost = totalProcessTime * selectedMachine.hourly_cost;
    const powerConsumptionKw = selectedMachine.power_consumption_watts ? selectedMachine.power_consumption_watts / 1000 : 0;
    const electricityCost = totalProcessTime * powerConsumptionKw * electricityRate;
    const laborCost = laborHours * laborRate;

    const subtotalBeforeOverhead = materialCost + machineTimeCost + electricityCost + laborCost;
    const overheadCost = (subtotalBeforeOverhead * overheadPercentage) / 100;
    const subtotal = subtotalBeforeOverhead + overheadCost;

    const markup = (subtotal * markupPercentage) / 100;
    const totalPrice = subtotal + markup;

    const quoteData: QuoteData = {
      materialCost,
      machineTimeCost,
      electricityCost,
      laborCost,
      overheadCost,
      subtotal,
      markup,
      totalPrice,
      printType: "Resin",
      projectName: formData.projectName,
      printColour: formData.printColour,
      parameters: {
        ...formData,
        materialName: selectedMaterial.name,
        machineName: selectedMachine.name,
      },
    };

    onCalculate(quoteData);
    toast.success("Quote calculated successfully!");
  };

  if (loading) {
    return <div className="text-center py-8">Loading calculator...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Parameter</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Project Name *</TableCell>
              <TableCell>
                <Input
                  type="text"
                  placeholder="Enter project name"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="bg-background"
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Print Colour</TableCell>
              <TableCell>
                <Input
                  type="text"
                  placeholder="e.g., Red, Blue, Black"
                  value={formData.printColour}
                  onChange={(e) => setFormData({ ...formData, printColour: e.target.value })}
                  className="bg-background"
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Material *</TableCell>
              <TableCell>
                <Select value={formData.materialId} onValueChange={(value) => setFormData({ ...formData, materialId: value })}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {materials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name} (₹{material.cost_per_unit}/{material.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Machine *</TableCell>
              <TableCell>
                <Select value={formData.machineId} onValueChange={(value) => setFormData({ ...formData, machineId: value })}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select machine" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {machines.map((machine) => (
                      <SelectItem key={machine.id} value={machine.id}>
                        {machine.name} (₹{machine.hourly_cost}/hr)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Print Time (hours) *</TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="4.5"
                  value={formData.printTime}
                  onChange={(e) => setFormData({ ...formData, printTime: e.target.value })}
                  className="bg-background"
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Resin Volume (ml) *</TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="150"
                  value={formData.resinVolume}
                  onChange={(e) => setFormData({ ...formData, resinVolume: e.target.value })}
                  className="bg-background"
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Support Volume (ml)</TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="25"
                  value={formData.supportVolume}
                  onChange={(e) => setFormData({ ...formData, supportVolume: e.target.value })}
                  className="bg-background"
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Washing Time (minutes)</TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder="10"
                  value={formData.washingTime}
                  onChange={(e) => setFormData({ ...formData, washingTime: e.target.value })}
                  className="bg-background"
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Curing Time (minutes)</TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder="15"
                  value={formData.curingTime}
                  onChange={(e) => setFormData({ ...formData, curingTime: e.target.value })}
                  className="bg-background"
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">IPA/Cleaning Cost (₹)</TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="2.00"
                  value={formData.isopropylCost}
                  onChange={(e) => setFormData({ ...formData, isopropylCost: e.target.value })}
                  className="bg-background"
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Labor Hours</TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="1.0"
                  value={formData.laborHours}
                  onChange={(e) => setFormData({ ...formData, laborHours: e.target.value })}
                  className="bg-background"
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Overhead (%)</TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="15"
                  value={formData.overheadPercentage}
                  onChange={(e) => setFormData({ ...formData, overheadPercentage: e.target.value })}
                  className="bg-background"
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Profit Markup (%)</TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="20"
                  value={formData.markupPercentage}
                  onChange={(e) => setFormData({ ...formData, markupPercentage: e.target.value })}
                  className="bg-background"
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Button 
        onClick={calculateQuote} 
        className="w-full bg-gradient-accent hover:opacity-90 transition-opacity"
        size="lg"
      >
        <Calculator className="w-4 h-4 mr-2" />
        Calculate Quote
      </Button>
    </div>
  );
};

export default ResinCalculatorTable;
