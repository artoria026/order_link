import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrderDetail } from "@/components/order-detail";

type Props = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const order = await db.order.findFirst({
    where: { id, deletedAt: null },
    include: {
      participants: {
        include: { items: { orderBy: { createdAt: "asc" } } },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!order) notFound();

  return <OrderDetail order={order} userId={session!.user!.id!} />;
}
