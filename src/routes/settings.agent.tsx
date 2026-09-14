import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, Loader2, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/cupai-logo.png.asset.json";
import type { AgentGender } from "@/lib/agent-identity";
import { getAgentIdentity, updateAgentIdentity } from "@/lib/agent-identity.functions";

export const Route = createFileRoute("/settings/agent")({
  head: () => ({
    meta: [
      { title: "هوية الوكيل الذكي · cupai" },
      {
        name: "description",
        content: "اختر اسم الوكيل الذكي وجنسه ليعرّف نفسه به أمام عملائك ويلتزم بصيغة الكلام المناسبة.",
      },
      { property: "og:title", content: "هوية الوكيل الذكي · cupai" },
      {
        property: "og:description",
        content: "اسم الوكيل وجنسه يتحكمان في طريقة تعريفه بنفسه وحديثه مع عملائك.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AgentIdentityPage,
});

const GENDERS: Array<{ key: AgentGender; label: string; desc: string }> = [
  { key: "female", label: "أنثى", desc: "يتحدث عن نفسه بصيغة المؤنث (أنا شايفة، أنا جاهزة)." },
  { key: "male", label: "ذكر", desc: "يتحدث عن نفسه بصيغة المذكر (أنا شايف، أنا جاهز)." },
  { key: "unspecified", label: "بدون تحديد", desc: "يتحدث عن نفسه بصيغة محايدة تماماً." },
];

function AgentIdentityPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["agent-identity"], queryFn: () => getAgentIdentity() });

  const [name, setName] = useState("");
  const [gender, setGender] = useState<AgentGender>("unspecified");

  useEffect(() => {
    if (q.data) {
      setName(q.data.name ?? "");
      setGender(q.data.gender);
    }
  }, [q.data]);

  const m = useMutation({
    mutationFn: (v: { name: string | null; gender: AgentGender }) =>
      updateAgentIdentity({ data: v }),
    onSuccess: () => {
      toast.success("تم حفظ هوية الوكيل.");
      qc.invalidateQueries({ queryKey: ["agent-identity"] });
    },
    onError: (e: any) => toast.error(e?.message || "تعذر حفظ الهوية."),
  });

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-surface">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo.url} alt="cupai" className="h-8 w-8 rounded-lg shadow-card" />
            <span className="text-sm font-semibold tracking-tight">cupai</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard">
              <ArrowLeft className="ml-1 h-4 w-4" />
              لوحة التحكم
            </Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10">
        <section className="flex items-start gap-3">
          <div className="rounded-xl bg-gradient-brand p-2.5 text-primary-foreground shadow-glow">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">هوية الوكيل الذكي</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              اختر الاسم الذي يعرّف به الوكيل نفسه أمام عملائك، والصيغة التي يتحدث بها عن نفسه.
            </p>
          </div>
        </section>

        <section className="space-y-5 rounded-2xl border border-border/60 bg-background/80 p-5 shadow-card backdrop-blur">
          <div className="space-y-2">
            <Label htmlFor="agent-name">اسم الوكيل</Label>
            <Input
              id="agent-name"
              value={name}
              maxLength={40}
              placeholder="مثال: سلمى"
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              سيبدأ الوكيل المحادثة بترحيب يذكر فيه اسم متجرك واسمه معاً. اترك الحقل فارغاً إن كنت
              لا تريد اسماً.
            </p>
          </div>

          <div className="space-y-2">
            <Label>جنس الوكيل</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {GENDERS.map((g) => {
                const active = gender === g.key;
                return (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setGender(g.key)}
                    className={`rounded-xl border p-3 text-right transition ${
                      active
                        ? "border-primary bg-primary/10 shadow-glow"
                        : "border-border/60 bg-background/60 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{g.label}</span>
                      {active && <BadgeCheck className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {g.desc}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              هذا يخص طريقة حديث الوكيل عن نفسه فقط؛ مخاطبة العميل تظل محايدة دائماً (حضرتك / يا
              فندم).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              disabled={q.isLoading || m.isPending}
              onClick={() => m.mutate({ name: name.trim() || null, gender })}
            >
              {m.isPending && <Loader2 className="ml-1 h-4 w-4 animate-spin" />}
              حفظ
            </Button>
            {q.isLoading && (
              <span className="text-xs text-muted-foreground">جارٍ تحميل الإعدادات…</span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
