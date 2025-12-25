import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/components/CurrencyProvider";
import { Machine } from "@/types/quote";
import * as sessionStore from "@/lib/sessionStorage";

const MachinesManager = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    hourly_cost: "",
    power_consumption_watts: "",
    print_type: "FDM" as "FDM" | "Resin",
    description: "",
  });
  const { currency, formatPrice } = useCurrency();

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const data = sessionStore.getMachines();
      // Sort by print_type then by name
      data.sort((a, b) => {
        if (a.print_type !== b.print_type) {
          return a.print_type.localeCompare(b.print_type);
        }
        return a.name.localeCompare(b.name);
      });
      setMachines(data);
    } catch (error: any) {
      toast.error("Failed to load machines");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.hourly_cost) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const machineData: Omit<Machine, "id"> & { id?: string } = {
        name: formData.name,
        hourly_cost: parseFloat(formData.hourly_cost),
        power_consumption_watts: formData.power_consumption_watts ? parseInt(formData.power_consumption_watts) : null,
        print_type: formData.print_type,
      };

      if (editingId) {
        machineData.id = editingId;
        sessionStore.saveMachine(machineData);
        toast.success("Machine updated successfully");
      } else {
        sessionStore.saveMachine(machineData);
        toast.success("Machine added successfully");
      }

      resetForm();
      fetchMachines();
    } catch (error: any) {
      toast.error(error.message || "Failed to save machine");
    }
  };

  const handleEdit = (machine: Machine) => {
    setEditingId(machine.id);
    setFormData({
      name: machine.name,
      hourly_cost: machine.hourly_cost.toString(),
      power_consumption_watts: machine.power_consumption_watts?.toString() || "",
      print_type: machine.print_type,
      description: "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this machine?")) return;

    try {
      sessionStore.deleteMachine(id);
      toast.success("Machine deleted successfully");
      fetchMachines();
    } catch (error: any) {
      toast.error("Failed to delete machine");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      hourly_cost: "",
      power_consumption_watts: "",
      print_type: "FDM",
      description: "",
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading machines...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-border rounded-lg bg-secondary/10">
        <h3 className="text-lg font-semibold text-foreground">
          {editingId ? "Edit Machine" : "Add New Machine"}
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Machine Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Prusa i3 MK3S, Elegoo Mars 3"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="print_type">Print Type *</Label>
            <Select
              value={formData.print_type}
              onValueChange={(value: "FDM" | "Resin") => setFormData({ ...formData, print_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FDM">FDM</SelectItem>
                <SelectItem value="Resin">Resin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourly_cost">Hourly Cost ({currency.symbol}) *</Label>
            <Input
              id="hourly_cost"
              type="number"
              step="0.01"
              value={formData.hourly_cost}
              onChange={(e) => setFormData({ ...formData, hourly_cost: e.target.value })}
              placeholder="5.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="power_consumption_watts">Power Consumption (Watts)</Label>
            <Input
              id="power_consumption_watts"
              type="number"
              value={formData.power_consumption_watts}
              onChange={(e) => setFormData({ ...formData, power_consumption_watts: e.target.value })}
              placeholder="250"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="bg-gradient-accent">
            <Plus className="w-4 h-4 mr-2" />
            {editingId ? "Update" : "Add"} Machine
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Hourly Cost</TableHead>
              <TableHead>Power (W)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {machines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No machines added yet. Add your first machine above.
                </TableCell>
              </TableRow>
            ) : (
              machines.map((machine) => (
                <TableRow key={machine.id}>
                  <TableCell className="font-medium">{machine.name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                      {machine.print_type}
                    </span>
                  </TableCell>
                  <TableCell>{formatPrice(machine.hourly_cost)}</TableCell>
                  <TableCell>{machine.power_consumption_watts ? `${machine.power_consumption_watts}W` : "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(machine)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(machine.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MachinesManager;
