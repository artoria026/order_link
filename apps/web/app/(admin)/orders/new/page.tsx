"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrderSchema, type CreateOrderInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: { currency: "MXN", deliveryFee: 0, tip: 0 },
  });

  async function onSubmit(data: CreateOrderInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      const order = await res.json();
      toast.success("Order created!");
      router.push(`/orders/${order.id}`);
    } catch {
      toast.error("Failed to create order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold">New Order</h1>
      <Card>
        <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restaurant">Restaurant *</Label>
              <Input id="restaurant" {...register("restaurant")} placeholder="Tacos El Güero" />
              {errors.restaurant && <p className="text-xs text-destructive">{errors.restaurant.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="payerName">Who pays? *</Label>
              <Input id="payerName" {...register("payerName")} placeholder="Juan" />
              {errors.payerName && <p className="text-xs text-destructive">{errors.payerName.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" {...register("currency")} placeholder="MXN" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadlineAt">Deadline</Label>
                <Input id="deadlineAt" type="datetime-local" {...register("deadlineAt")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="deliveryFee">Delivery Fee</Label>
                <Input id="deliveryFee" type="number" step="0.01" {...register("deliveryFee", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tip">Tip</Label>
                <Input id="tip" type="number" step="0.01" {...register("tip", { valueAsNumber: true })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea id="comments" {...register("comments")} rows={2} placeholder="Any notes..." />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create & Get Link"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
