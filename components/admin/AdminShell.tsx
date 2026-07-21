"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Percent,
  FileText,
  Images,
  Sparkles,
  Mail,
  Inbox,
  FolderOpen,
  Menu,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/discounts", label: "Discounts", icon: Percent },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/services", label: "Services", icon: Sparkles },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/contact", label: "Contact", icon: Inbox },
  { href: "/admin/media", label: "Media", icon: FolderOpen },
  { href: "/admin/navigation", label: "Navigation", icon: Menu },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-black text-white">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-charcoal lg:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <Image src="/brand/logo.png" alt="Dazzle Glam" width={120} height={40} className="h-10 w-auto" />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {nav.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-fuchsia/15 text-fuchsia"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="m-3 flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-silver hover:border-fuchsia hover:text-fuchsia"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-4 lg:px-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-fuchsia">Admin Portal</p>
            <p className="font-heading text-xl">Dazzle Glam</p>
          </div>
          <Link href="/" className="text-xs uppercase tracking-wider text-silver hover:text-fuchsia">
            View storefront
          </Link>
        </header>
        <div className="flex gap-2 overflow-x-auto border-b border-white/5 px-3 py-2 lg:hidden">
          {nav.slice(0, 8).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-wider text-silver"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
