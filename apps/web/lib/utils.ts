import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | { toString(): string }, currency = "MXN") {
  const num = typeof amount === "number" ? amount : Number(amount.toString());
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
  }).format(num);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function isOrderExpired(expiresAt: Date | string) {
  return new Date(expiresAt) < new Date();
}

export function isWithin10Min(joinedAt: Date | string) {
  const diff = Date.now() - new Date(joinedAt).getTime();
  return diff < 10 * 60 * 1000;
}
