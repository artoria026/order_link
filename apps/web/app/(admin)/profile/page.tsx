"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(1),
  defaultPaymentBank: z.string().optional(),
  defaultPaymentHolder: z.string().optional(),
  defaultPaymentClabe: z.string().optional(),
  defaultPaymentCard: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((data) => reset(data));
  }, [reset]);

  async function onSubmit(data: ProfileForm) {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Profile saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Personal info</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Default payment info</CardTitle>
            <CardDescription>Se precarga al crear nuevas órdenes. Puedes editarlo por orden.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Banco</Label>
                <Input {...register("defaultPaymentBank")} placeholder="BBVA" />
              </div>
              <div className="space-y-1">
                <Label>Titular</Label>
                <Input {...register("defaultPaymentHolder")} placeholder="Juan García" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>CLABE interbancaria</Label>
              <Input {...register("defaultPaymentClabe")} placeholder="012345678901234567" maxLength={18} />
            </div>
            <div className="space-y-1">
              <Label>Últimos 4 dígitos de tarjeta (opcional)</Label>
              <Input {...register("defaultPaymentCard")} placeholder="4321" maxLength={4} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
