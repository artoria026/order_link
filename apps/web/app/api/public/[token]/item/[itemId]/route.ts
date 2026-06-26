import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateItemSchema } from "@/lib/validations";
import { isWithin10Min, isOrderExpired } from "@/lib/utils";

type Params = { params: Promise<{ token: string; itemId: string }> };

async function getOrderAndItem(token: string, itemId: string) {
  const order = await db.order.findFirst({
    where: { publicId: token, deletedAt: null },
  });
  if (!order) return { error: "Order not found", status: 404 };
  if (isOrderExpired(order.expiresAt)) return { error: "Order expired", status: 410 };

  const item = await db.participantItem.findUnique({
    where: { id: itemId },
    include: { participant: true },
  });
  if (!item) return { error: "Item not found", status: 404 };
  if (!isWithin10Min(item.participant.joinedAt)) return { error: "Edit window expired", status: 403 };

  return { order, item };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { token, itemId } = await params;
  const result = await getOrderAndItem(token, itemId);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const body = await req.json();
  const parsed = updateItemSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await db.participantItem.update({
    where: { id: itemId },
    data: parsed.data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { token, itemId } = await params;
  const result = await getOrderAndItem(token, itemId);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  await db.participantItem.delete({ where: { id: itemId } });
  return NextResponse.json({ success: true });
}
