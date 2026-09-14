import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ClipboardList, LayoutGrid, TrendingUp } from "lucide-react";

/**
 * Presentation shell for the redesigned merchant hub (orders / earnings).
 * Everything is scoped under `.hub` so the rest of the site keeps its own look.
 */
export function HubShell({
  eyebrow,
  title,
  subtitle,
  aside,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div dir="rtl" className="hub min-h-screen pb-24">
      <header className="hub-bar">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
            لوحة التحكم
          </Link>
          <span className="hub-display text-sm font-bold text-primary">cupai</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl space-y-5 px-4 pt-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </div>
            <h1 className="mt-1.5 text-[26px] font-bold leading-tight sm:text-3xl">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {aside}
        </div>

        {children}
      </div>

      <HubTabBar />
    </div>
  );
}

const TABS = [
  { to: "/dashboard" as const, label: "الرئيسية", Icon: LayoutGrid },
  { to: "/orders" as const, label: "الطلبات", Icon: ClipboardList },
  { to: "/earnings" as const, label: "الأرباح", Icon: TrendingUp },
];

function HubTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-3">
        {TABS.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-muted-foreground transition-colors"
            activeProps={{ className: "text-primary" }}
            activeOptions={{ exact: true }}
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function HubCard({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={`hub-card ${className}`}>{children}</div>;
}
