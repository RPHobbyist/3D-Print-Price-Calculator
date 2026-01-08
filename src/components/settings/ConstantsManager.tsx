import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { CostConstant } from "@/types/quote";
import { processVisibilityFromDescription, addVisibilityTag } from "@/lib/utils";
import * as sessionStore from "@/lib/sessionStorage";

const ConstantsManager = () => {
  const [constants, setConstants] = useState<CostConstant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    unit: "",
    is_visible: true,
    description: "",
  });

  useEffect(() => {
    fetchConstants();
  }, []);

  const fetchConstants = async () => {
    try {
      const rawData = sessionStore.getConstants();

      const processedData = rawData.map((item: CostConstant) => {
        return {
          ...item,
          ...processVisibilityFromDescription(item.description)
        };
      });

      setConstants(processedData);
    } catch (error) {
      const err = error as Error;
      console.error(err);
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
      const finalDescription = addVisibilityTag(formData.description || "", formData.is_visible);

      const constantData: Omit<CostConstant, "id"> & { id?: string } = {
        name: formData.name,
        value: parseFloat(formData.value),
        unit: formData.unit,
        description: finalDescription || undefined,
        is_visible: formData.is_visible,
      };

      if (editingId) {
        constantData.id = editingId;
      }

      sessionStore.saveConstant(constantData);

      toast.success(editingId ? "Consumable updated successfully" : "Consumable added successfully");
      resetForm();
      fetchConstants();

    } catch (error) {
      const err = error as Error;
      console.error("Save error:", err);
      toast.error("An unexpected error occurred: " + err.message);
    }
  };

  const handleEdit = (constant: CostConstant) => {
    setEditingId(constant.id);
    setFormData({
      name: constant.name,
      value: constant.value.toString(),
      unit: constant.unit,
      is_visible: constant.is_visible !== false,
      description: constant.description || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this constant?")) return;

    try {
      sessionStore.deleteConstant(id);
      toast.success("Constant deleted successfully");
      fetchConstants();
    } catch (error) {
      const err = error as Error;
      console.error(err);
      toast.error("Failed to delete constant");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      value: "",
      unit: "",
      is_visible: true,
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
          {editingId ? "Edit Consumable" : "Add New Consumable"}
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Consumable Name *</Label>
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

          <div className="flex items-center space-x-2 md:col-span-2">
            <Switch
              id="is_visible"
              checked={formData.is_visible}
              onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
            />
            <Label htmlFor="is_visible">Visible in Calculator selection</Label>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="bg-gradient-accent">
            <Plus className="w-4 h-4 mr-2" />
            {editingId ? "Update" : "Add"} Consumable
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
              <TableHead className="w-20 text-center">Visible</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {constants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No consumables added yet. Add your first consumable above.
                </TableCell>
              </TableRow>
            ) : (
              constants.map((constant) => (
                <TableRow key={constant.id}>
                  <TableCell className="font-medium">{constant.name}</TableCell>
                  <TableCell>{constant.value}</TableCell>
                  <TableCell>{constant.unit}</TableCell>
                  <TableCell className="text-center">
                    {constant.is_visible !== false ? (
                      <Eye className="w-4 h-4 mx-auto text-muted-foreground" />
                    ) : (
                      <EyeOff className="w-4 h-4 mx-auto text-muted-foreground/50" />
                    )}
                  </TableCell>
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
