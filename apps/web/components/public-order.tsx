"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AddParticipantDialog } from "@/components/add-participant-dialog";
import { PaymentInfoCard } from "@/components/payment-info-card";
import { Plus, Clock } from "lucide-react";

interface MenuItem { id: string; name: string; description: string | null; price: number | null; category: string | null; }

interface Order {
  id: string; publicId: string; restaurant: string; payerName: string;
  currency: string; comments: string | null; deadlineAt: string | null;
  expiresAt: string; status: string; deliveryFee: number; tip: number;
  expired: boolean; subtotal: number; total: number;
  paymentBank?: string | null; paymentHolder?: string | null;
  paymentClabe?: string | null; paymentCard?: string | null;
  participants: Array<{
    id: string; displayName: string; paymentStatus: string; joinedAt: string;
    items: Array<{ id: string; product: string; quantity: number; unitPrice: number; notes: string | null }>;
  }>;
}

export function PublicOrderPage({ token }: { token: string }) {
  const [showAdd, setShowAdd] = useState(false);
  const [countdown, setCountdown] = useState("");

  const { data: order, isLoading, isError, refetch } = useQuery<Order>({
    queryKey: ["public-order", token],
    queryFn: () => fetch(`/api/public/${token}`).then((r) => r.ok ? r.json() : Promise.reject()),
    refetchInterval: 5000,
  });

  const { data: menuItems = [] } = useQuery<MenuItem[]>({
    queryKey: ["menu", order?.restaurant],
    queryFn: async () => {
      if (!order?.restaurant) return [];
      const restaurants = await fetch(`/api/restaurants`).then(r => r.json());
      const found = restaurants.find((r: {name: string; id: string}) => r.name === order.restaurant);
      if (!found) return [];
      return fetch(`/api/restaurants/${found.id}/menu`).then(r => r.json());
    },
    enabled: !!order,
  });

  useEffect(() => {
    if (!order?.deadlineAt) return;
    const interval = setInterval(() => {
      const diff = new Date(order.deadlineAt!).getTime() - Date.now();
      if (diff <= 0) { setCountdown("Deadline passed"); clearInterval(interval); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [order?.deadlineAt]);

  if (isLoading) return (
    <main className="min-h-screen bg-muted/40 p-4">
      <div className="max-w-lg mx-auto space-y-4 pt-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </main>
  );

  if (isError || !order) return (
    <main className="min-h-screen bg-muted/40 flex items-center justify-center">
      <div className="text-center"><p className="text-xl font-semibold">Order not found</p><p className="text-muted-foreground">This link may have expired or doesn't exist.</p></div>
    </main>
  );

  const canAdd = !order.expired && order.status === "OPEN";

  return (
    <main className="min-h-screen bg-muted/40 pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{order.restaurant}</h1>
            <p className="text-muted-foreground text-sm">Payer: {order.payerName}</p>
          </div>
          <Badge variant={order.status === "OPEN" ? "default" : "secondary"}>{order.status}</Badge>
        </div>

        {order.deadlineAt && (
          <Card>
            <CardContent className="py-3 flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Deadline:</span>
              <span className="font-medium">{countdown || formatDate(order.deadlineAt)}</span>
            </CardContent>
          </Card>
        )}

        {order.expired && (
          <Card className="border-destructive"><CardContent className="py-3 text-destructive text-sm font-medium">This order has expired and is read-only.</CardContent></Card>
        )}

        {order.comments && (
          <Card><CardContent className="py-3 text-sm text-muted-foreground">{order.comments}</CardContent></Card>
        )}

        <PaymentInfoCard info={{
          paymentBank: order.paymentBank,
          paymentHolder: order.paymentHolder,
          paymentClabe: order.paymentClabe,
          paymentCard: order.paymentCard,
        }} />

        <Card>
          <CardContent className="py-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(order.subtotal, order.currency)}</span></div>
            {order.deliveryFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{formatCurrency(order.deliveryFee, order.currency)}</span></div>}
            {order.tip > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Tip</span><span>{formatCurrency(order.tip, order.currency)}</span></div>}
            <Separator />
            <div className="flex justify-between font-semibold"><span>Total</span><span>{formatCurrency(order.total, order.currency)}</span></div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="font-semibold">Participants ({order.participants.length})</h2>
          {order.participants.map((p) => {
            const ptotal = p.items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0);
            return (
              <Card key={p.id}>
                <CardHeader className="pb-2 flex-row items-center justify-between">
                  <CardTitle className="text-base">{p.displayName}</CardTitle>
                  <span className="text-sm font-medium">{formatCurrency(ptotal, order.currency)}</span>
                </CardHeader>
                <CardContent className="pt-0 space-y-1">
                  {p.items.map((i) => (
                    <div key={i.id} className="flex justify-between text-sm">
                      <span>{i.quantity}x {i.product}{i.notes ? <span className="text-muted-foreground ml-1">({i.notes})</span> : null}</span>
                      <span>{formatCurrency(Number(i.unitPrice) * i.quantity, order.currency)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
          {order.participants.length === 0 && (
            <p className="text-muted-foreground text-center text-sm py-6">Be the first to add your order!</p>
          )}
        </div>
      </div>

      {canAdd && (
        <div className="fixed bottom-6 right-6">
          <Button size="lg" className="rounded-full shadow-lg gap-2" onClick={() => setShowAdd(true)}>
            <Plus className="h-5 w-5" /> Add My Order
          </Button>
        </div>
      )}

      {showAdd && (
        <AddParticipantDialog
          token={token}
          currency={order.currency}
          menuItems={menuItems}
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); refetch(); }}
        />
      )}
    </main>
  );
}
