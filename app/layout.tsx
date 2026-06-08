"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  LayoutDashboard,
  Users,
  BedDouble,
  Tag,
  CalendarCheck,
  ShoppingBag,
  Receipt,
  CreditCard,
  Star,
  UserCog,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { seedData } from "@/lib/seed";
import "./globals.css";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Hóspedes", href: "/hospedes", icon: Users },
  { label: "Quartos", href: "/quartos", icon: BedDouble },
  { label: "Tipos de Quarto", href: "/tipos", icon: Tag },
  { label: "Reservas", href: "/reservas", icon: CalendarCheck },
  { label: "Serviços", href: "/servicos", icon: ShoppingBag },
  { label: "Consumos", href: "/consumos", icon: Receipt },
  { label: "Pagamentos", href: "/pagamentos", icon: CreditCard },
  { label: "Avaliações", href: "/avaliacoes", icon: Star },
  { label: "Funcionários", href: "/funcionarios", icon: UserCog },
];

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/hospedes": "Hóspedes",
  "/quartos": "Quartos",
  "/tipos": "Tipos de Quarto",
  "/reservas": "Reservas",
  "/servicos": "Serviços",
  "/consumos": "Consumos",
  "/pagamentos": "Pagamentos",
  "/avaliacoes": "Avaliações",
  "/funcionarios": "Funcionários",
};

function Shell({
  children,
  pathname,
}: {
  children: ReactNode;
  pathname: string;
}) {
  const pageTitle =
    Object.entries(pageTitles).find(
      ([path]) =>
        pathname === path || (path !== "/" && pathname.startsWith(path))
    )?.[1] || "HotelSystem";

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-zinc-950">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-screen w-60 bg-zinc-900 border-r border-zinc-800 flex flex-col overflow-y-auto z-50">
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-zinc-50" />
              <span className="text-xl font-bold text-zinc-50">HeroHotel</span>
            </div>
          </div>
          <nav className="flex-1 px-3 py-6 space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col ml-60">
          {/* Topbar */}
          <header className="fixed top-0 right-0 left-60 h-14 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-6 z-40">
            <h2 className="text-white font-medium">{pageTitle}</h2>
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8 bg-zinc-800">
                <AvatarFallback className="text-zinc-50 text-xs font-semibold">
                  AD
                </AvatarFallback>
              </Avatar>
              <span className="text-zinc-400 text-sm">Admin</span>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-auto pt-14">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

function DataInit() {
  useEffect(() => {
    seedData();
  }, []);
  return null;
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-zinc-950 text-zinc-50 antialiased">
        <DataInit />
        <Shell pathname={pathname}>{children}</Shell>
      </body>
    </html>
  );
}
