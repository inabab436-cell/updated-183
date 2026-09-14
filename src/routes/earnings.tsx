import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Package, Clock, ArrowUpRight } from "lucide-react";

import { HubShell, HubCard } from "@/components/hub/hub-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { getEarningsSummary, type EarningsSummary } from "@/lib/orders.functions";

export const Route = createFileRoute("/earnings")({
  head: () => ({
    meta: [
      { title: "الأرباح · cupai" },
      { name: "description", content: "نظرة مالية سريعة على أداء متجرك." },
      { property: "og:title", content: "الأرباح · cupai" },
      { property: "og:description", content: "نظرة مالية سريعة على أداء متجرك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "الأرباح · cupai" },
      { name: "twitter:description", content: "نظرة مالية سريعة على أداء متجرك." },
    ],
  }),
  component: EarningsPage,
});

function fmtMoney(n: number): string {
  return new Intl.NumberFormat("ar-EG", {
    maximumFractionDigits: 2,
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
}

function EarningsPage() {
  const q = useQuery({
    queryKey: ["earnings-summary"],
    queryFn: () => getEarningsSummary(),
    refetchInterval: 30_000,
  });

  const data: EarningsSummary | undefined = q.data;

  return (
    <HubShell
      eyebrow="نظرة مالية"
      title={<>أرباح متجرك</>}
      subtitle="ثلاثة مؤشرات تكفي لتعرف موقفك المالي في ثوانٍ."
    >
      {q.isLoading ? (
        <LoadingMetrics />
      ) : q.isError ? (
        <HubCard className="p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-bold">تعذر تحميل البيانات</h2>
          <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted-foreground">
            {(q.error as Error)?.message || "حدث خطأ أثناء جلب نظرتك المالية."}
          </p>
        </HubCard>
      ) : !data || data.orderCount === 0 ? (
        <HubCard className="p-10 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-bold">لا توجد أرباح بعد</h2>
          <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted-foreground">
            بمجرد استلام أول طلب، ستظهر هنا نظرتك المالية السريعة.
          </p>
        </HubCard>
      ) : (
        <div className="space-y-4">
          {/* Hero: total profit */}
          <div className="relative overflow-hidden rounded-[var(--radius)] bg-gradient-brand p-6 text-primary-foreground shadow-glow sm:p-8">
            <div className="pointer-events-none absolute -end-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/75">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15">
                  <TrendingUp className="h-3.5 w-3.5" />
                </span>
                إجمالي الأرباح
              </div>
              <div className="mt-4 flex flex-wrap items-baseline gap-2">
                <span className="hub-display text-[44px] font-bold leading-none sm:text-6xl">
                  {fmtMoney(data.totalProfit)}
                </span>
                {data.currency && (
                  <span className="text-base font-medium text-white/75">{data.currency}</span>
                )}
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-white/70">
                صافي الأرباح بعد خصم تكاليف الشحن.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <MiniCard
              icon={<Package className="h-5 w-5" />}
              label="عدد الأوردرات"
              value={String(data.orderCount)}
              subtext="إجمالي الطلبات النشطة"
              tone="green"
            />
            <MiniCard
              icon={<Clock className="h-5 w-5" />}
              label="أرباح تحت التحصيل"
              value={fmtMoney(data.pendingProfit)}
              currency={data.currency}
              subtext="أوردرات لم تُسلّم أو تُحصّل بعد"
              tone="amber"
            />
          </div>
        </div>
      )}
    </HubShell>
  );
}

function MiniCard({
  icon,
  label,
  value,
  currency,
  subtext,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  currency?: string;
  subtext: string;
  tone: "green" | "amber";
}) {
  const amber = tone === "amber";
  return (
    <HubCard className="p-5">
      <div className="flex items-start justify-between">
        <div
          className={`grid h-11 w-11 place-items-center rounded-2xl ${
            amber ? "bg-amber-500/10 text-amber-600" : "bg-accent text-accent-foreground"
          }`}
        >
          {icon}
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground/50" />
      </div>
      <div className="mt-4 text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="hub-display text-3xl font-bold leading-none">{value}</span>
        {currency && <span className="text-sm text-muted-foreground">{currency}</span>}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">{subtext}</p>
    </HubCard>
  );
}

function LoadingMetrics() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-44 w-full rounded-[var(--radius)]" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-40 w-full rounded-[var(--radius)]" />
        <Skeleton className="h-40 w-full rounded-[var(--radius)]" />
      </div>
    </div>
  );
}
