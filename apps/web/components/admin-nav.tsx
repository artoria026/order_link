"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface User { name?: string | null; email?: string | null }

export function AdminNav({ user }: { user: User }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/orders", label: "Orders" },
    { href: "/restaurants", label: "Restaurants" },
  ];

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-bold text-lg">OrderLink</Link>
          <nav className="flex gap-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "text-sm transition-colors hover:text-foreground",
                  pathname.startsWith(l.href)
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className={cn(
              "text-sm transition-colors hover:text-foreground hidden sm:block",
              pathname === "/profile" ? "text-foreground font-medium" : "text-muted-foreground"
            )}
          >
            {user.name}
          </Link>
          <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
