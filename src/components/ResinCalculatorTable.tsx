import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, Sparkles } from "lucide-react";
import { QuoteData } from "@/pages/Index";
import { toast } from "sonner";
import ResinFileUpload from "./ResinFileUpload";
import { ResinFileData } from "@/lib/resinFileParser";

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
    
    washingTime: "",
    curingTime: "",
    isopropylCost: "",
    laborHours: "",
    overheadPercentage: "",
    markupPercentage: "20",
    selectedConstantId: "",
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

  const handleConstantSelect = (constantId: string) => {
    const constant = constants.find(c => c.id === constantId);
    if (constant) {
      setFormData(prev => ({
        ...prev,
        selectedConstantId: constantId,
      }));
      toast.info(`Selected: ${constant.name} = ${constant.value} ${constant.unit}`);
    }
  };

  const handleResinFileData = (data: ResinFileData) => {
    let matchedMachineId = '';
    
    // Auto-select machine based on printer_model
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
    const washingTimeHours = formData.washingTime ? parseFloat(formData.washingTime) / 60 : 0;
    const curingTimeHours = formData.curingTime ? parseFloat(formData.curingTime) / 60 : 0;
    const isopropylCost = formData.isopropylCost ? parseFloat(formData.isopropylCost) : 0;
    const laborHours = formData.laborHours ? parseFloat(formData.laborHours) : 0;
    const overheadPercentage = formData.overheadPercentage ? parseFloat(formData.overheadPercentage) : 0;
    const markupPercentage = parseFloat(formData.markupPercentage);

    const electricityRate = getConstantValue("electricity");
    const laborRate = getConstantValue("labor");

    const materialCost = resinVolumeLiters * selectedMaterial.cost_per_unit + isopropylCost;
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

    const selectedConstant = constants.find(c => c.id === formData.selectedConstantId);

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
        constantName: selectedConstant?.name,
        constantValue: selectedConstant?.value,
      },
    };

    onCalculate(quoteData);
    toast.success("Quote calculated successfully!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary animate-spin" />
          <span className="text-muted-foreground">Loading calculator...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ResinFileUpload onDataExtracted={handleResinFileData} />
      
      <div className="border border-border rounded-xl overflow-hidden shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-1/3 font-semibold">Parameter</TableHead>
              <TableHead className="font-semibold">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">Project Name *</TableCell>
              <TableCell>
                <Input
                  type="text"
                  placeholder="Enter project name"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="bg-background border-input"
                />
              </TableCell>
            </TableRow>

            <TableRow className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">Print Colour</TableCell>
              <TableCell>
                <Input
                  type="text"
                  placeholder="e.g., Red, Blue, Black"
                  value={formData.printColour}
                  onChange={(e) => setFormData({ ...formData, printColour: e.target.value })}
                  className="bg-background border-input"
                />
              </TableCell>
            </TableRow>

            <TableRow className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">Material *</TableCell>
              <TableCell>
                <Select value={formData.materialId} onValueChange={(value) => setFormData({ ...formData, materialId: value })}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    {materials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name} (₹{material.cost_per_unit}/{material.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>

            <TableRow className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">Machine *</TableCell>
              <TableCell>
                <Select value={formData.machineId} onValueChange={(value) => setFormData({ ...formData, machineId: value })}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select machine" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    {machines.map((machine) => (
                      <SelectItem key={machine.id} value={machine.id}>
                        {machine.name} (₹{machine.hourly_cost}/hr)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>

            <TableRow className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">Constant Value</TableCell>
              <TableCell>
                <Select value={formData.selectedConstantId} onValueChange={handleConstantSelect}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select a constant (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    {constants.map((constant) => (
                      <SelectItem key={constant.id} value={constant.id}>
                        {constant.name}: {constant.value} {constant.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>

            <TableRow className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">Print Time (hours) *</TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="4.5"
                  value={formData.printTime}
                  onChange={(e) => setFormData({ ...formData, printTime: e.target.value })}
                  className="bg-background border-input"
                />
              </TableCell>
            </TableRow>

            <TableRow className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">Resin Volume (ml) *</TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="150"
                  value={formData.resinVolume}
                  onChange={(e) => setFormData({ ...formData, resinVolume: e.target.value })}
                  className="bg-background border-input"
                />
              </TableCell>
            </TableRow>


            <TableRow className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">Washing Time (minutes)</TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder="10"
                  value={formData.washingTime}
                  onChange={(e) => setFormData({ ...formData, washingTime: e.target.value })}
                  className="bg-background border-input"
                />
              </TableCell>
            </TableRow>

            <TableRow className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">Curing Time (minutes)</TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder="15"
                  value={formData.curingTime}
                  onChange={(e) => setFormData({ ...formData, curingTime: e.target.value })}
                  className="bg-background border-input"
                />
              </TableCell>
            </TableRow>

            <TableRow className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">IPA/Cleaning Cost (₹)</TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="50"
                  value={formData.isopropylCost}
                  onChange={(e) => setFormData({ ...formData, isopropylCost: e.target.value })}
                  className="bg-background border-input"
                />
              </TableCell>
            </TableRow>

            <TableRow className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">Labor Hours</TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="1.0"
                  value={formData.laborHours}
                  onChange={(e) => setFormData({ ...formData, laborHours: e.target.value })}
                  className="bg-background border-input"
                />
              </TableCell>
            </TableRow>

            <TableRow className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">Overhead (%)</TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="15"
                  value={formData.overheadPercentage}
                  onChange={(e) => setFormData({ ...formData, overheadPercentage: e.target.value })}
                  className="bg-background border-input"
                />
              </TableCell>
            </TableRow>

            <TableRow className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">Profit Markup (%)</TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="20"
                  value={formData.markupPercentage}
                  onChange={(e) => setFormData({ ...formData, markupPercentage: e.target.value })}
                  className="bg-background border-input"
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Button 
        onClick={calculateQuote} 
        className="w-full bg-gradient-accent hover:opacity-90 transition-all shadow-elevated hover:shadow-card text-accent-foreground font-semibold"
        size="lg"
      >
        <Calculator className="w-5 h-5 mr-2" />
        Calculate Quote
      </Button>
    </div>
  );
};

export default ResinCalculatorTable;