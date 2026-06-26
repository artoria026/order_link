import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ChevronRight, UtensilsCrossed } from "lucide-react";

export default async function RestaurantsPage() {
  const session = await auth();
  const restaurants = await db.restaurant.findMany({
    where: { createdBy: session!.user!.id! },
    include: { menuItems: { where: { isActive: true }, select: { id: true } } },
    orderBy: { lastUsed: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Restaurants & Menus</h1>
      {restaurants.length === 0 && (
        <Card><CardContent className="py-10 text-center text-muted-foreground">
          No restaurants yet. Create an order first to add a restaurant.
        </CardContent></Card>
      )}
      <div className="space-y-2">
        {restaurants.map((r) => (
          <Link key={r.id} href={`/restaurants/${r.id}`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.menuItems.length} menu items · Last used {formatDate(r.lastUsed)}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
