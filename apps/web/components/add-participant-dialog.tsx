"use client";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addParticipantSchema, type AddParticipantInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface MenuItem { id: string; name: string; description: string | null; price: number | null; category: string | null; }
interface Props { token: string; currency: string; menuItems: MenuItem[]; onClose: () => void; onSuccess: () => void; }

export function AddParticipantDialog({ token, currency, menuItems, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<AddParticipantInput>({
    resolver: zodResolver(addParticipantSchema),
    defaultValues: {
      displayName: "",
      items: [{ product: "", quantity: 1, unitPrice: 0, notes: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  async function onSubmit(data: AddParticipantInput) {
    setLoading(true);
    try {
      const res = await fetch(`/api/public/${token}/participant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      toast.success("Order added!");
      onSuccess();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Your Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Your Name *</Label>
            <Input {...register("displayName")} placeholder="Your name" />
            {errors.displayName && <p className="text-xs text-destructive">{errors.displayName.message}</p>}
          </div>

          <Separator />
          <p className="text-sm font-medium">Items</p>

          {fields.map((field, idx) => (
            <div key={field.id} className="space-y-2 bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Item {idx + 1}</span>
                {fields.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => remove(idx)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              {menuItems.length > 0 && (
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm mb-2 bg-background"
                  defaultValue=""
                  onChange={(e) => {
                    const selected = menuItems.find((m) => m.id === e.target.value);
                    if (selected) {
                      setValue(`items.${idx}.product`, selected.name);
                      if (selected.price != null) setValue(`items.${idx}.unitPrice`, selected.price);
                    }
                  }}
                >
                  <option value="">— Select from menu —</option>
                  {Array.from(new Set(menuItems.map((m) => m.category))).map((cat) => (
                    <optgroup key={cat ?? "Other"} label={cat ?? "Other"}>
                      {menuItems.filter((m) => m.category === cat).map((m) => (
                        <option key={m.id} value={m.id}>{m.name}{m.price != null ? ` — ${m.price}` : ""}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              )}
              <Input {...register(`items.${idx}.product`)} placeholder="Product name *" />
              {errors.items?.[idx]?.product && <p className="text-xs text-destructive">{errors.items[idx].product?.message}</p>}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Qty</Label>
                  <Input type="number" min={1} {...register(`items.${idx}.quantity`, { valueAsNumber: true })} />
                </div>
                <div>
                  <Label className="text-xs">Price ({currency})</Label>
                  <Input type="number" step="0.01" min={0} {...register(`items.${idx}.unitPrice`, { valueAsNumber: true })} />
                </div>
              </div>
              <Textarea {...register(`items.${idx}.notes`)} placeholder="Notes (optional)" rows={1} />
            </div>
          ))}
          {errors.items && !Array.isArray(errors.items) && (
            <p className="text-xs text-destructive">{errors.items.message}</p>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => append({ product: "", quantity: 1, unitPrice: 0, notes: "" })}
          >
            <Plus className="h-4 w-4 mr-1" /> Add another item
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>{loading ? "Saving..." : "Confirm"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
