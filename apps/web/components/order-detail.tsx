"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate, isOrderExpired } from "@/lib/utils";
import { toast } from "sonner";
import { ExternalLink, Copy } from "lucide-react";

type Order = {
  id: string; publicId: string; restaurant: string; payerName: string;
  currency: string; comments: string | null; deadlineAt: Date | null;
  expiresAt: Date; status: string; deliveryFee: unknown; tip: unknown;
  participants: Array<{
    id: string; displayName: string; paymentStatus: string; joinedAt: Date;
    items: Array<{ id: string; product: string; quantity: number; unitPrice: unknown; notes: string | null }>;
  }>;
};

export function OrderDetail({ order, userId: _userId }: { order: Order; userId: string }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const expired = isOrderExpired(order.expiresAt);
  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/o/${order.publicId}`
    : `/o/${order.publicId}`;

  const subtotal = order.participants.reduce((s, p) =>
    s + p.items.reduce((a, i) => a + Number(i.unitPrice) * i.quantity, 0), 0);
  const total = subtotal + Number(order.deliveryFee) + Number(order.tip);

  async function updateStatus(status: string) {
    setUpdating(true);
    try {
      await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      toast.success(`Order ${status.toLowerCase()}`);
      router.refresh();
    } catch { toast.error("Failed"); }
    finally { setUpdating(false); }
  }

  async function togglePayment(participantId: string, current: string) {
    const next = current === "PAID" ? "PENDING" : "PAID";
    try {
      await fetch(`/api/participants/${participantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: next }),
      });
      router.refresh();
    } catch {
      toast.error("Failed to update payment");
    }
  }

  const statusColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    DRAFT: "secondary", OPEN: "default", CLOSED: "outline", ARCHIVED: "outline", CANCELLED: "destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{order.restaurant}</h1>
          <p className="text-muted-foreground">Payer: {order.payerName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {expired && <Badge variant="destructive">Expired</Badge>}
          <Badge variant={statusColor[order.status]}>{order.status}</Badge>
          {order.status === "OPEN" && (
            <Button size="sm" variant="outline" onClick={() => updateStatus("CLOSED")} disabled={updating}>Close</Button>
          )}
          {order.status === "CLOSED" && (
            <Button size="sm" variant="outline" onClick={() => updateStatus("ARCHIVED")} disabled={updating}>Archive</Button>
          )}
          {(order.status === "DRAFT" || order.status === "OPEN") && (
            <Button size="sm" variant="destructive" onClick={() => updateStatus("CANCELLED")} disabled={updating}>Cancel</Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Public Link</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">{publicUrl}</code>
          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success("Copied!"); }}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Link href={`/o/${order.publicId}`} target="_blank">
            <Button size="icon" variant="outline" className="h-7 w-7"><ExternalLink className="h-3.5 w-3.5" /></Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="py-3 space-y-1 text-sm">
            {order.deadlineAt && <p><span className="text-muted-foreground">Deadline:</span> {formatDate(order.deadlineAt)}</p>}
            <p><span className="text-muted-foreground">Expires:</span> {formatDate(order.expiresAt)}</p>
            {order.comments && <p><span className="text-muted-foreground">Notes:</span> {order.comments}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 space-y-1 text-sm">
            <p><span className="text-muted-foreground">Subtotal:</span> {formatCurrency(subtotal, order.currency)}</p>
            <p><span className="text-muted-foreground">Delivery:</span> {formatCurrency(Number(order.deliveryFee), order.currency)}</p>
            <p><span className="text-muted-foreground">Tip:</span> {formatCurrency(Number(order.tip), order.currency)}</p>
            <Separator />
            <p className="font-semibold"><span className="text-muted-foreground">Total:</span> {formatCurrency(total, order.currency)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Participants ({order.participants.length})</h2>
        {order.participants.map((p) => {
          const ptotal = p.items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0);
          return (
            <Card key={p.id}>
              <CardHeader className="pb-2 flex-row items-center justify-between">
                <CardTitle className="text-base">{p.displayName}</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatCurrency(ptotal, order.currency)}</span>
                  <Badge
                    variant={p.paymentStatus === "PAID" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => togglePayment(p.id, p.paymentStatus)}
                  >
                    {p.paymentStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {p.items.map((i) => (
                    <div key={i.id} className="flex justify-between text-sm">
                      <span>{i.quantity}x {i.product}{i.notes ? <span className="text-muted-foreground ml-1">({i.notes})</span> : null}</span>
                      <span>{formatCurrency(Number(i.unitPrice) * i.quantity, order.currency)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {order.participants.length === 0 && (
          <p className="text-muted-foreground text-sm">No participants yet. Share the public link!</p>
        )}
      </div>
    </div>
  );
}
