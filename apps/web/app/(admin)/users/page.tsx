import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Users, CreditCard, Building2, User } from "lucide-react";

export default async function UsersPage() {
  const session = await auth();

  const users = await db.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      defaultPaymentBank: true,
      defaultPaymentHolder: true,
      defaultPaymentClabe: true,
      defaultPaymentCard: true,
      createdAt: true,
    },
  });

  const hasPayment = (u: typeof users[number]) =>
    u.defaultPaymentBank || u.defaultPaymentClabe || u.defaultPaymentHolder;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Badge variant="secondary">{users.length} registrados</Badge>
      </div>

      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-medium leading-none">
                      {u.name}
                      {u.id === session!.user!.id && (
                        <span className="ml-2 text-xs text-muted-foreground">(tú)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{u.email}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground shrink-0">
                  Desde {formatDate(u.createdAt)}
                </p>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {hasPayment(u) ? (
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm border-t pt-3">
                  {u.defaultPaymentBank && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Banco:</span>
                      <span className="font-medium">{u.defaultPaymentBank}</span>
                    </div>
                  )}
                  {u.defaultPaymentHolder && (
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Titular:</span>
                      <span className="font-medium">{u.defaultPaymentHolder}</span>
                    </div>
                  )}
                  {u.defaultPaymentClabe && (
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">CLABE:</span>
                      <span className="font-mono font-medium tracking-wide">
                        {u.defaultPaymentClabe.replace(/(\d{4})(?=\d)/g, "$1 ")}
                      </span>
                      {u.defaultPaymentCard && (
                        <span className="text-muted-foreground ml-2">
                          · tarjeta <span className="font-medium">····{u.defaultPaymentCard}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground border-t pt-3 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Sin medios de pago registrados
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {users.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No hay usuarios registrados aún.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
