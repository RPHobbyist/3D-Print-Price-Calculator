import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Material {
  id: string;
  name: string;
  cost_per_unit: number;
  unit: string;
  print_type: "FDM" | "Resin";
  description: string | null;
}

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

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from("material_presets")
        .select("*")
        .order("print_type", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setMaterials(data || []);
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
      if (editingId) {
        const { error } = await supabase
          .from("material_presets")
          .update({
            name: formData.name,
            cost_per_unit: parseFloat(formData.cost_per_unit),
            unit: formData.unit,
            print_type: formData.print_type,
            description: formData.description || null,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Material updated successfully");
      } else {
        const { error } = await supabase
          .from("material_presets")
          .insert({
            name: formData.name,
            cost_per_unit: parseFloat(formData.cost_per_unit),
            unit: formData.unit,
            print_type: formData.print_type,
            description: formData.description || null,
          });

        if (error) throw error;
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
      description: material.description || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this material?")) return;

    try {
      const { error } = await supabase
        .from("material_presets")
        .delete()
        .eq("id", id);

      if (error) throw error;
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
            <Label htmlFor="cost_per_unit">Cost per Unit ($) *</Label>
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

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
            />
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
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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
                  <TableCell>${material.cost_per_unit.toFixed(2)}</TableCell>
                  <TableCell>{material.unit}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {material.description || "-"}
                  </TableCell>
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
