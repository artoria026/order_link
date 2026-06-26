import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isOrderExpired } from "@/lib/utils";

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;

  const order = await db.order.findFirst({
    where: { publicId: token, deletedAt: null },
    include: {
      participants: {
        include: {
          items: { orderBy: { createdAt: "asc" } },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const expired = isOrderExpired(order.expiresAt);
  const subtotal = order.participants.reduce((sum, p) =>
    sum + p.items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0), 0);
  const total = subtotal + Number(order.deliveryFee) + Number(order.tip);

  return NextResponse.json({ ...order, expired, subtotal, total });
}
