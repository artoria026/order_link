import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate, isOrderExpired } from "@/lib/utils";
import { Plus, ExternalLink } from "lucide-react";

export default async function OrdersPage() {
  const session = await auth();
  const orders = await db.order.findMany({
    where: { deletedAt: null, createdBy: session!.user!.id! },
    include: {
      participants: { include: { items: true } },
      _count: { select: { participants: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    DRAFT: "secondary", OPEN: "default", CLOSED: "outline", ARCHIVED: "outline", CANCELLED: "destructive",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Link href="/orders/new">
          <Button><Plus className="w-4 h-4 mr-2" />New Order</Button>
        </Link>
      </div>

      {orders.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          No orders. <Link href="/orders/new" className="underline">Create your first one</Link>.
        </CardContent></Card>
      )}

      <div className="space-y-2">
        {orders.map((o) => {
          const subtotal = o.participants.reduce((s, p) => s + p.items.reduce((a, i) => a + Number(i.unitPrice) * i.quantity, 0), 0);
          const total = subtotal + Number(o.deliveryFee) + Number(o.tip);
          const expired = isOrderExpired(o.expiresAt);
          return (
            <Card key={o.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/orders/${o.id}`} className="flex-1 min-w-0">
                    <p className="font-medium truncate">{o.restaurant}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)} · Payer: {o.payerName} · {o._count.participants} participants</p>
                  </Link>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {expired && <Badge variant="destructive">Expired</Badge>}
                    <Badge variant={statusColor[o.status]}>{o.status}</Badge>
                    <span className="text-sm font-medium">{formatCurrency(total, o.currency)}</span>
                    <Link href={`/o/${o.publicId}`} target="_blank">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
