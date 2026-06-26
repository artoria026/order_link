import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MenuManager } from "@/components/menu-manager";

type Props = { params: Promise<{ id: string }> };

export default async function RestaurantMenuPage({ params }: Props) {
  const { id } = await params;
  await auth();

  const restaurant = await db.restaurant.findUnique({
    where: { id },
    include: {
      menuItems: {
        where: { isActive: true },
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      },
    },
  });
  if (!restaurant) notFound();

  return <MenuManager restaurant={restaurant} />;
}
