import { Bell, ChartColumn, Map, PackageCheck, Route, Truck, UserRoundCog } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { hasRole, UserSession } from "@/lib/auth";
import { LogoutButton } from "@/components/layout/logout-button";
import { AiCommandBar } from "@/components/layout/ai-command-bar";

type AppShellProps = {
  locale: string;
  session: UserSession;
  children: React.ReactNode;
};

export async function AppShell({ locale, session, children }: AppShellProps) {
  const t = await getTranslations("shell");

  const navItems = [
    { icon: ChartColumn, label: t("nav.dashboard"), href: `/${locale}/dashboard`, roles: ["ADMIN", "MANAGER", "VIEWER"] },
    { icon: Truck, label: t("nav.shipments"), href: `/${locale}/shipments`, roles: ["ADMIN", "MANAGER", "VIEWER"] },
    { icon: Map, label: t("nav.map"), href: `/${locale}/map`, roles: ["ADMIN", "MANAGER", "VIEWER"] },
    { icon: UserRoundCog, label: t("nav.drivers"), href: `/${locale}/drivers`, roles: ["ADMIN", "MANAGER"] },
    { icon: Route, label: t("nav.routes"), href: `/${locale}/routes`, roles: ["ADMIN", "MANAGER", "VIEWER"] },
    { icon: PackageCheck, label: t("nav.alerts"), href: `/${locale}/alerts`, roles: ["ADMIN", "MANAGER"] },
    { icon: Bell, label: t("nav.events"), href: `/${locale}/events`, roles: ["ADMIN", "MANAGER", "VIEWER"] },
  ];
  const filteredNav = navItems.filter((item) => item.roles.some((role) => hasRole(session, role as "ADMIN" | "MANAGER" | "VIEWER")));

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="w-64 border-e border-slate-200 bg-white p-5">
        <h2 className="mb-6 text-lg font-semibold">{t("brand")}</h2>
        <nav className="space-y-2">
          {filteredNav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-slate-100"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold">{t("title")}</h1>
            <p className="text-xs text-slate-500">
              {session.username}
              {session.regionCity ? ` • ${session.regionCity}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AiCommandBar
              locale={locale}
              labels={{
                trigger: t("ai.trigger"),
                title: t("ai.title"),
                subtitle: t("ai.subtitle"),
                placeholder: t("ai.placeholder"),
                hint: t("ai.hint"),
                submit: t("ai.submit"),
                loading: t("ai.loading"),
                empty: t("ai.empty"),
                error: t("ai.error"),
                examples: [t("ai.examples.delayed"), t("ai.examples.routes"), t("ai.examples.drivers")],
                shortcut: "Ctrl K",
              }}
            />
            <LocaleSwitcher locale={locale} />
            <LogoutButton locale={locale} />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
