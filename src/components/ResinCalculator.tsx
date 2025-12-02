import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";
import { QuoteData } from "@/pages/Index";
import { toast } from "sonner";

interface ResinCalculatorProps {
  onCalculate: (data: QuoteData) => void;
}

const ResinCalculator = ({ onCalculate }: ResinCalculatorProps) => {
  const [formData, setFormData] = useState({
    printTime: "",
    resinVolume: "",
    resinCostPerLiter: "",
    supportVolume: "",
    machineHourlyCost: "",
    electricityRate: "",
    powerConsumption: "",
    washingTime: "",
    curingTime: "",
    isopropylCost: "",
    laborHours: "",
    laborRate: "",
    overheadPercentage: "",
    markupPercentage: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateQuote = () => {
    // Validate inputs
    const requiredFields = ["printTime", "resinVolume", "resinCostPerLiter", "machineHourlyCost"];
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Parse values
    const printTimeHours = parseFloat(formData.printTime);
    const resinVolumeLiters = parseFloat(formData.resinVolume) / 1000;
    const supportVolumeLiters = formData.supportVolume ? parseFloat(formData.supportVolume) / 1000 : 0;
    const resinCostPerLiter = parseFloat(formData.resinCostPerLiter);
    const machineHourlyCost = parseFloat(formData.machineHourlyCost);
    const electricityRate = formData.electricityRate ? parseFloat(formData.electricityRate) : 0;
    const powerConsumptionKw = formData.powerConsumption ? parseFloat(formData.powerConsumption) / 1000 : 0;
    const washingTimeHours = formData.washingTime ? parseFloat(formData.washingTime) / 60 : 0;
    const curingTimeHours = formData.curingTime ? parseFloat(formData.curingTime) / 60 : 0;
    const isopropylCost = formData.isopropylCost ? parseFloat(formData.isopropylCost) : 0;
    const laborHours = formData.laborHours ? parseFloat(formData.laborHours) : 0;
    const laborRate = formData.laborRate ? parseFloat(formData.laborRate) : 0;
    const overheadPercentage = formData.overheadPercentage ? parseFloat(formData.overheadPercentage) : 0;
    const markupPercentage = formData.markupPercentage ? parseFloat(formData.markupPercentage) : 20;

    // Calculate costs
    const materialCost = (resinVolumeLiters + supportVolumeLiters) * resinCostPerLiter + isopropylCost;
    const totalProcessTime = printTimeHours + washingTimeHours + curingTimeHours;
    const machineTimeCost = totalProcessTime * machineHourlyCost;
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
      parameters: formData,
    };

    onCalculate(quoteData);
    toast.success("Quote calculated successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Print Parameters</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="printTime">Print Time (hours) *</Label>
            <Input
              id="printTime"
              type="number"
              step="0.1"
              placeholder="4.5"
              value={formData.printTime}
              onChange={(e) => handleInputChange("printTime", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resinVolume">Resin Volume (ml) *</Label>
            <Input
              id="resinVolume"
              type="number"
              step="0.1"
              placeholder="150"
              value={formData.resinVolume}
              onChange={(e) => handleInputChange("resinVolume", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportVolume">Support Volume (ml)</Label>
            <Input
              id="supportVolume"
              type="number"
              step="0.1"
              placeholder="25"
              value={formData.supportVolume}
              onChange={(e) => handleInputChange("supportVolume", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resinCostPerLiter">Resin Cost per Liter ($) *</Label>
            <Input
              id="resinCostPerLiter"
              type="number"
              step="0.01"
              placeholder="50.00"
              value={formData.resinCostPerLiter}
              onChange={(e) => handleInputChange("resinCostPerLiter", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Post-Processing</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="washingTime">Washing Time (minutes)</Label>
            <Input
              id="washingTime"
              type="number"
              placeholder="10"
              value={formData.washingTime}
              onChange={(e) => handleInputChange("washingTime", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="curingTime">Curing Time (minutes)</Label>
            <Input
              id="curingTime"
              type="number"
              placeholder="15"
              value={formData.curingTime}
              onChange={(e) => handleInputChange("curingTime", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="isopropylCost">IPA/Cleaning Cost ($)</Label>
            <Input
              id="isopropylCost"
              type="number"
              step="0.01"
              placeholder="2.00"
              value={formData.isopropylCost}
              onChange={(e) => handleInputChange("isopropylCost", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Machine Costs</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="machineHourlyCost">Machine Cost per Hour ($) *</Label>
            <Input
              id="machineHourlyCost"
              type="number"
              step="0.01"
              placeholder="8.00"
              value={formData.machineHourlyCost}
              onChange={(e) => handleInputChange("machineHourlyCost", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="powerConsumption">Power Consumption (Watts)</Label>
            <Input
              id="powerConsumption"
              type="number"
              placeholder="120"
              value={formData.powerConsumption}
              onChange={(e) => handleInputChange("powerConsumption", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="electricityRate">Electricity Rate ($ per kWh)</Label>
            <Input
              id="electricityRate"
              type="number"
              step="0.01"
              placeholder="0.15"
              value={formData.electricityRate}
              onChange={(e) => handleInputChange("electricityRate", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Labor & Business Costs</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="laborHours">Labor Hours</Label>
            <Input
              id="laborHours"
              type="number"
              step="0.1"
              placeholder="1.0"
              value={formData.laborHours}
              onChange={(e) => handleInputChange("laborHours", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="laborRate">Labor Rate ($ per hour)</Label>
            <Input
              id="laborRate"
              type="number"
              step="0.01"
              placeholder="25.00"
              value={formData.laborRate}
              onChange={(e) => handleInputChange("laborRate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="overheadPercentage">Overhead (%)</Label>
            <Input
              id="overheadPercentage"
              type="number"
              step="0.1"
              placeholder="15"
              value={formData.overheadPercentage}
              onChange={(e) => handleInputChange("overheadPercentage", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="markupPercentage">Profit Markup (%)</Label>
            <Input
              id="markupPercentage"
              type="number"
              step="0.1"
              placeholder="20"
              value={formData.markupPercentage}
              onChange={(e) => handleInputChange("markupPercentage", e.target.value)}
            />
          </div>
        </div>
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

export default ResinCalculator;
