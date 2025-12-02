import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";
import { QuoteData } from "@/pages/Index";
import { toast } from "sonner";

interface FDMCalculatorProps {
  onCalculate: (data: QuoteData) => void;
}

const FDMCalculator = ({ onCalculate }: FDMCalculatorProps) => {
  const [formData, setFormData] = useState({
    printTime: "",
    filamentWeight: "",
    filamentCostPerKg: "",
    supportWeight: "",
    machineHourlyCost: "",
    electricityRate: "",
    powerConsumption: "",
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
    const requiredFields = ["printTime", "filamentWeight", "filamentCostPerKg", "machineHourlyCost"];
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Parse values
    const printTimeHours = parseFloat(formData.printTime);
    const filamentWeightKg = parseFloat(formData.filamentWeight) / 1000;
    const supportWeightKg = formData.supportWeight ? parseFloat(formData.supportWeight) / 1000 : 0;
    const filamentCostPerKg = parseFloat(formData.filamentCostPerKg);
    const machineHourlyCost = parseFloat(formData.machineHourlyCost);
    const electricityRate = formData.electricityRate ? parseFloat(formData.electricityRate) : 0;
    const powerConsumptionKw = formData.powerConsumption ? parseFloat(formData.powerConsumption) / 1000 : 0;
    const laborHours = formData.laborHours ? parseFloat(formData.laborHours) : 0;
    const laborRate = formData.laborRate ? parseFloat(formData.laborRate) : 0;
    const overheadPercentage = formData.overheadPercentage ? parseFloat(formData.overheadPercentage) : 0;
    const markupPercentage = formData.markupPercentage ? parseFloat(formData.markupPercentage) : 20;

    // Calculate costs
    const materialCost = (filamentWeightKg + supportWeightKg) * filamentCostPerKg;
    const machineTimeCost = printTimeHours * machineHourlyCost;
    const electricityCost = printTimeHours * powerConsumptionKw * electricityRate;
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
      printType: "FDM",
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
              placeholder="8.5"
              value={formData.printTime}
              onChange={(e) => handleInputChange("printTime", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filamentWeight">Filament Weight (grams) *</Label>
            <Input
              id="filamentWeight"
              type="number"
              step="0.1"
              placeholder="250"
              value={formData.filamentWeight}
              onChange={(e) => handleInputChange("filamentWeight", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportWeight">Support Material (grams)</Label>
            <Input
              id="supportWeight"
              type="number"
              step="0.1"
              placeholder="50"
              value={formData.supportWeight}
              onChange={(e) => handleInputChange("supportWeight", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filamentCostPerKg">Filament Cost per kg ($) *</Label>
            <Input
              id="filamentCostPerKg"
              type="number"
              step="0.01"
              placeholder="25.00"
              value={formData.filamentCostPerKg}
              onChange={(e) => handleInputChange("filamentCostPerKg", e.target.value)}
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
              placeholder="5.00"
              value={formData.machineHourlyCost}
              onChange={(e) => handleInputChange("machineHourlyCost", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="powerConsumption">Power Consumption (Watts)</Label>
            <Input
              id="powerConsumption"
              type="number"
              placeholder="250"
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
              placeholder="0.5"
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

export default FDMCalculator;
