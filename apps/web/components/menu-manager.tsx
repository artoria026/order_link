"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const menuItemSchema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  category: z.string().optional(),
  sortOrder: z.number().int().min(0),
});
type MenuItemForm = z.infer<typeof menuItemSchema>;

type MenuItem = {
  id: string; name: string; description: string | null;
  price: unknown; category: string | null; sortOrder: number;
};
type Restaurant = { id: string; name: string; menuItems: MenuItem[] };

export function MenuManager({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<MenuItemForm>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: { sortOrder: 0 },
  });

  function openEdit(item: MenuItem) {
    setEditing(item);
    setValue("name", item.name);
    setValue("description", item.description ?? "");
    setValue("price", item.price ? Number(item.price) : undefined);
    setValue("category", item.category ?? "");
    setValue("sortOrder", item.sortOrder);
    setShowAdd(true);
  }

  function closeDialog() {
    setShowAdd(false);
    setEditing(null);
    reset({ sortOrder: 0 });
  }

  async function onSubmit(data: MenuItemForm) {
    setLoading(true);
    try {
      const url = editing
        ? `/api/restaurants/${restaurant.id}/menu/${editing.id}`
        : `/api/restaurants/${restaurant.id}/menu`;
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(editing ? "Item updated" : "Item added");
      closeDialog();
      router.refresh();
    } catch {
      toast.error("Error saving item");
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("Remove this item from the menu?")) return;
    await fetch(`/api/restaurants/${restaurant.id}/menu/${id}`, { method: "DELETE" });
    toast.success("Item removed");
    router.refresh();
  }

  const grouped = restaurant.menuItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.category ?? "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/restaurants">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          <p className="text-sm text-muted-foreground">{restaurant.menuItems.length} menu items</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      </div>

      {restaurant.menuItems.length === 0 && (
        <Card><CardContent className="py-10 text-center text-muted-foreground">
          No menu items yet. Add items so participants can select them quickly.
        </CardContent></Card>
      )}

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{category}</h2>
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  {item.description && <p className="text-xs text-muted-foreground truncate">{item.description}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.price != null && (
                    <Badge variant="secondary">{formatCurrency(Number(item.price))}</Badge>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteItem(item.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Separator />
        </div>
      ))}

      <Dialog open={showAdd} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Item" : "Add Menu Item"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input {...register("name")} placeholder="Combo Boneless" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea {...register("description")} rows={2} placeholder="Elige sabor: Buffalo, BBQ..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Price</Label>
                <Input type="number" step="0.01" min={0} {...register("price", { valueAsNumber: true })} />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <Input {...register("category")} placeholder="Combos" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Sort order</Label>
              <Input type="number" min={0} {...register("sortOrder", { valueAsNumber: true })} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Saving..." : editing ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
