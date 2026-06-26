import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, isOrderExpired } from "@/lib/utils";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [orders, restaurants] = await Promise.all([
    db.order.findMany({
      where: { deletedAt: null, createdBy: userId },
      include: { _count: { select: { participants: true } }, participants: { include: { items: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.restaurant.findMany({
      where: { createdBy: userId },
      orderBy: { lastUsed: "desc" },
      take: 5,
    }),
  ]);

  const active = orders.filter((o) => o.status === "OPEN" && !isOrderExpired(o.expiresAt));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today);

  const statusColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    DRAFT: "secondary",
    OPEN: "default",
    CLOSED: "outline",
    ARCHIVED: "outline",
    CANCELLED: "destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/orders/new">
          <Button><Plus className="w-4 h-4 mr-2" /> New Order</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Orders</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{active.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Today</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{todayOrders.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{orders.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Restaurants</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{restaurants.length}</div></CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        <div className="sm:col-span-2 space-y-3">
          <h2 className="font-semibold">Recent Orders</h2>
          {orders.length === 0 && (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No orders yet. <Link href="/orders/new" className="underline">Create one</Link>.</CardContent></Card>
          )}
          {orders.map((o) => {
            const subtotal = o.participants.reduce((s, p) => s + p.items.reduce((a, i) => a + Number(i.unitPrice) * i.quantity, 0), 0);
            const total = subtotal + Number(o.deliveryFee) + Number(o.tip);
            return (
              <Link key={o.id} href={`/orders/${o.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{o.restaurant}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)} · {o._count.participants} participants</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={statusColor[o.status]}>{o.status}</Badge>
                        <p className="text-sm font-medium mt-1">{formatCurrency(total, o.currency)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold">Recent Restaurants</h2>
          {restaurants.map((r) => (
            <Card key={r.id}>
              <CardContent className="py-3 px-4">
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground">Last: {formatDate(r.lastUsed)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
