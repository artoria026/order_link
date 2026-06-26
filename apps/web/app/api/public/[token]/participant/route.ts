import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { addParticipantSchema } from "@/lib/validations";
import { isOrderExpired } from "@/lib/utils";

type Params = { params: Promise<{ token: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params;

  const order = await db.order.findFirst({
    where: { publicId: token, deletedAt: null },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (isOrderExpired(order.expiresAt)) return NextResponse.json({ error: "Order expired" }, { status: 410 });
  if (order.status !== "OPEN") return NextResponse.json({ error: "Order is not open" }, { status: 409 });

  const body = await req.json();
  const parsed = addParticipantSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const participant = await db.participant.create({
    data: {
      orderId: order.id,
      displayName: parsed.data.displayName,
      items: {
        create: parsed.data.items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          notes: item.notes,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json(participant, { status: 201 });
}
