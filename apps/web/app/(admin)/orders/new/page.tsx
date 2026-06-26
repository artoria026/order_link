"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrderSchema, type CreateOrderInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {},
  });

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((profile) => {
        reset((prev) => ({
          ...prev,
          payerName: profile.name ?? "",
          paymentBank: profile.defaultPaymentBank ?? "",
          paymentHolder: profile.defaultPaymentHolder ?? "",
          paymentClabe: profile.defaultPaymentClabe ?? "",
          paymentCard: profile.defaultPaymentCard ?? "",
        }));
      })
      .catch(() => {});
  }, [reset]);

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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restaurant">Restaurante *</Label>
              <Input id="restaurant" {...register("restaurant")} placeholder="Snack House" />
              {errors.restaurant && <p className="text-xs text-destructive">{errors.restaurant.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="payerName">¿Quién paga? *</Label>
              <Input id="payerName" {...register("payerName")} placeholder="Arturo" />
              {errors.payerName && <p className="text-xs text-destructive">{errors.payerName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadlineAt">Límite de pedido</Label>
              <Input id="deadlineAt" type="datetime-local" {...register("deadlineAt")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datos de pago</CardTitle>
            <CardDescription>Se muestran en el link público para que puedan transferir.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="paymentBank">Banco</Label>
                <Input id="paymentBank" {...register("paymentBank")} placeholder="BBVA" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentHolder">Titular</Label>
                <Input id="paymentHolder" {...register("paymentHolder")} placeholder="Arturo García" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentClabe">CLABE interbancaria</Label>
              <Input id="paymentClabe" {...register("paymentClabe")} placeholder="012345678901234567" maxLength={18} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentCard">Últimos 4 dígitos de tarjeta (opcional)</Label>
              <Input id="paymentCard" {...register("paymentCard")} placeholder="4321" maxLength={4} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creando..." : "Crear orden y obtener link"}
        </Button>
      </form>
    </div>
  );
}
