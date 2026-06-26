import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const createMenuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  category: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const items = await db.menuItem.findMany({
    where: { restaurantId: id, isActive: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = createMenuItemSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const item = await db.menuItem.create({
    data: { ...parsed.data, restaurantId: id },
  });
  return NextResponse.json(item, { status: 201 });
}
