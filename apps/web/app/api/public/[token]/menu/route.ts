import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;

  const order = await db.order.findFirst({
    where: { publicId: token, deletedAt: null },
    select: { restaurant: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const restaurant = await db.restaurant.findUnique({
    where: { name: order.restaurant },
    select: {
      menuItems: {
        where: { isActive: true },
        select: { id: true, name: true, description: true, price: true, category: true },
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      },
    },
  });

  return NextResponse.json(restaurant?.menuItems ?? []);
}
