import { notFound } from "next/navigation";
import { PublicOrderPage } from "@/components/public-order";

type Props = { params: Promise<{ token: string }> };

export default async function PublicOrder({ params }: Props) {
  const { token } = await params;
  return <PublicOrderPage token={token} />;
}
