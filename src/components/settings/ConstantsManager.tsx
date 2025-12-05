import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Constant {
  id: string;
  name: string;
  value: number;
  unit: string;
  description: string | null;
}

const ConstantsManager = () => {
  const [constants, setConstants] = useState<Constant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    unit: "",
    description: "",
  });

  useEffect(() => {
    fetchConstants();
  }, []);

  const fetchConstants = async () => {
    try {
      const { data, error } = await supabase
        .from("cost_constants")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setConstants(data || []);
    } catch (error: any) {
      toast.error("Failed to load constants");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.value || !formData.unit) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const constantData = {
        name: formData.name,
        value: parseFloat(formData.value),
        unit: formData.unit,
        description: formData.description || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("cost_constants")
          .update(constantData)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Constant updated successfully");
      } else {
        const { error } = await supabase
          .from("cost_constants")
          .insert(constantData);

        if (error) throw error;
        toast.success("Constant added successfully");
      }

      resetForm();
      fetchConstants();
    } catch (error: any) {
      toast.error(error.message || "Failed to save constant");
    }
  };

  const handleEdit = (constant: Constant) => {
    setEditingId(constant.id);
    setFormData({
      name: constant.name,
      value: constant.value.toString(),
      unit: constant.unit,
      description: constant.description || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this constant?")) return;

    try {
      const { error } = await supabase
        .from("cost_constants")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Constant deleted successfully");
      fetchConstants();
    } catch (error: any) {
      toast.error("Failed to delete constant");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      value: "",
      unit: "",
      description: "",
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading constants...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-border rounded-lg bg-secondary/10">
        <h3 className="text-lg font-semibold text-foreground">
          {editingId ? "Edit Constant" : "Add New Constant"}
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Constant Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Electricity Rate, Labor Rate"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Value *</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="0.15"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit *</Label>
            <Input
              id="unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="e.g., ₹/kWh, ₹/hr, %"
              required
            />
          </div>

          <div className="space-y-2">
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
            {editingId ? "Update" : "Add"} Constant
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
              <TableHead>Value</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {constants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No constants added yet. Add your first constant above.
                </TableCell>
              </TableRow>
            ) : (
              constants.map((constant) => (
                <TableRow key={constant.id}>
                  <TableCell className="font-medium">{constant.name}</TableCell>
                  <TableCell>{constant.value}</TableCell>
                  <TableCell>{constant.unit}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {constant.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(constant)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(constant.id)}
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

export default ConstantsManager;
