import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/components/CurrencyProvider";
import { Material } from "@/types/quote";
import * as sessionStore from "@/lib/sessionStorage";

const MaterialsManager = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    cost_per_unit: "",
    unit: "kg",
    print_type: "FDM" as "FDM" | "Resin",
    description: "",
  });
  const { currency, formatPrice } = useCurrency();

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const data = sessionStore.getMaterials();
      // Sort by print_type then by name
      data.sort((a, b) => {
        if (a.print_type !== b.print_type) {
          return a.print_type.localeCompare(b.print_type);
        }
        return a.name.localeCompare(b.name);
      });
      setMaterials(data);
    } catch (error: any) {
      toast.error("Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.cost_per_unit) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const materialData: Omit<Material, "id"> & { id?: string } = {
        name: formData.name,
        cost_per_unit: parseFloat(formData.cost_per_unit),
        unit: formData.unit,
        print_type: formData.print_type,
      };

      if (editingId) {
        materialData.id = editingId;
        sessionStore.saveMaterial(materialData);
        toast.success("Material updated successfully");
      } else {
        sessionStore.saveMaterial(materialData);
        toast.success("Material added successfully");
      }

      resetForm();
      fetchMaterials();
    } catch (error: any) {
      toast.error(error.message || "Failed to save material");
    }
  };

  const handleEdit = (material: Material) => {
    setEditingId(material.id);
    setFormData({
      name: material.name,
      cost_per_unit: material.cost_per_unit.toString(),
      unit: material.unit,
      print_type: material.print_type,
      description: "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this material?")) return;

    try {
      sessionStore.deleteMaterial(id);
      toast.success("Material deleted successfully");
      fetchMaterials();
    } catch (error: any) {
      toast.error("Failed to delete material");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      cost_per_unit: "",
      unit: "kg",
      print_type: "FDM",
      description: "",
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading materials...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-border rounded-lg bg-secondary/10">
        <h3 className="text-lg font-semibold text-foreground">
          {editingId ? "Edit Material" : "Add New Material"}
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Material Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., PLA, ABS, Standard Resin"
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
            <Label htmlFor="cost_per_unit">Cost per Unit ({currency.symbol}) *</Label>
            <Input
              id="cost_per_unit"
              type="number"
              step="0.01"
              value={formData.cost_per_unit}
              onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
              placeholder="25.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit *</Label>
            <Select
              value={formData.unit}
              onValueChange={(value) => setFormData({ ...formData, unit: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Kilogram (kg)</SelectItem>
                <SelectItem value="liter">Liter (L)</SelectItem>
                <SelectItem value="g">Gram (g)</SelectItem>
                <SelectItem value="ml">Milliliter (ml)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="bg-gradient-accent">
            <Plus className="w-4 h-4 mr-2" />
            {editingId ? "Update" : "Add"} Material
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
              <TableHead>Cost per Unit</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No materials added yet. Add your first material above.
                </TableCell>
              </TableRow>
            ) : (
              materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                      {material.print_type}
                    </span>
                  </TableCell>
                  <TableCell>{formatPrice(material.cost_per_unit)}</TableCell>
                  <TableCell>{material.unit}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(material)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(material.id)}
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

export default MaterialsManager;
