import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  defaultPaymentBank: z.string().optional(),
  defaultPaymentHolder: z.string().optional(),
  defaultPaymentClabe: z.string().optional(),
  defaultPaymentCard: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true, name: true, email: true,
        defaultPaymentBank: true, defaultPaymentHolder: true,
        defaultPaymentClabe: true, defaultPaymentCard: true,
      },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = await db.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: {
      id: true, name: true, email: true,
      defaultPaymentBank: true, defaultPaymentHolder: true,
      defaultPaymentClabe: true, defaultPaymentCard: true,
    },
  });
  return NextResponse.json(user);
}
