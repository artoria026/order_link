import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createOrderSchema } from "@/lib/validations";
import { nanoid } from "nanoid";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await db.order.findMany({
    where: { deletedAt: null, createdBy: session.user.id },
    include: {
      participants: { include: { items: true } },
      _count: { select: { participants: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const order = await db.order.create({
    data: {
      ...parsed.data,
      publicId: nanoid(12),
      expiresAt,
      createdBy: session.user.id,
      status: "OPEN",
    },
  });

  await db.restaurant.upsert({
    where: { name: parsed.data.restaurant },
    update: { lastUsed: new Date() },
    create: { name: parsed.data.restaurant, createdBy: session.user.id },
  });

  return NextResponse.json(order, { status: 201 });
}
