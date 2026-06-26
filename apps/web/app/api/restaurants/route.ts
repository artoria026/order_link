import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const restaurants = await db.restaurant.findMany({
    orderBy: { lastUsed: "desc" },
    take: 20,
  });
  return NextResponse.json(restaurants);
}
