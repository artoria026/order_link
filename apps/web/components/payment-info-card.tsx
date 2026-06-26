"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, CreditCard } from "lucide-react";

interface PaymentInfo {
  paymentBank?: string | null;
  paymentHolder?: string | null;
  paymentClabe?: string | null;
  paymentCard?: string | null;
}

export function PaymentInfoCard({ info }: { info: PaymentInfo }) {
  if (!info.paymentClabe && !info.paymentCard) return null;

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  }

  return (
    <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
      <CardHeader className="pb-2 flex-row items-center gap-2">
        <CreditCard className="h-4 w-4 text-green-700 dark:text-green-400" />
        <CardTitle className="text-sm text-green-800 dark:text-green-300">
          Datos de pago — {info.paymentHolder}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {info.paymentBank && (
          <p className="text-xs text-muted-foreground">{info.paymentBank}</p>
        )}
        {info.paymentClabe && (
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-white dark:bg-black/20 px-2 py-1 rounded font-mono tracking-wider">
              {info.paymentClabe}
            </code>
            <Button
              size="icon"
              variant="outline"
              className="h-7 w-7"
              onClick={() => copyText(info.paymentClabe!, "CLABE")}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        {info.paymentCard && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Tarjeta:</span>
            <code className="text-sm font-mono">•••• {info.paymentCard}</code>
            <Button
              size="icon"
              variant="outline"
              className="h-7 w-7"
              onClick={() => copyText(info.paymentCard!, "Número de tarjeta")}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
