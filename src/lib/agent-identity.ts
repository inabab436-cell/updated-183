/**
 * AGENT IDENTITY — the name and grammatical gender the brand owner chose for
 * the AI agent.
 *
 * The base prompt keeps the agent nameless and gender-neutral. When the owner
 * picks a name (and optionally a gender), that choice is binding: the agent
 * introduces itself with that name in its first greeting alongside the brand,
 * answers "مين معايا؟" with it, and conjugates every self-reference in the
 * chosen gender.
 *
 * Pure module: no network, no database, no environment.
 */

export type AgentGender = "male" | "female" | "unspecified";

export interface AgentIdentity {
  name: string | null;
  gender: AgentGender;
}

export function normalizeAgentGender(v: unknown): AgentGender {
  return v === "male" || v === "female" ? v : "unspecified";
}

export function normalizeAgentName(v: unknown): string | null {
  const t = String(v ?? "").replace(/\s+/g, " ").trim();
  if (!t) return null;
  return t.slice(0, 40);
}

export function emptyAgentIdentity(): AgentIdentity {
  return { name: null, gender: "unspecified" };
}

/**
 * Renders the binding identity block appended to the system prompt.
 * Returns "" when the owner has not chosen anything, so the default
 * nameless / gender-neutral behaviour stays exactly as it was.
 */
export function buildAgentIdentityBlock(
  identity: AgentIdentity,
  brandName?: string | null,
): string {
  const name = normalizeAgentName(identity.name);
  const gender = normalizeAgentGender(identity.gender);
  if (!name && gender === "unspecified") return "";

  const brand = String(brandName ?? "").replace(/\s+/g, " ").trim();
  const lines: string[] = [
    "",
    "",
    "AGENT IDENTITY (binding — overrides any conflicting wording in sections 1 and 2):",
  ];

  if (name) {
    lines.push(
      `- اسمك هو «${name}». ده اسمك الحقيقي قدام العميل، ومينفعش تستخدم أي اسم تاني ولا تقول إنك من غير اسم.`,
      brand
        ? `- في أول رسالة ترحيب في المحادثة، عرّف نفسك باسمك مع اسم البراند بشكل طبيعي (زي: «أهلاً بحضرتك في ${brand}، معاك ${name}») — من غير ما تكرر نفس الجملة كل مرة، ومن غير ما تعرّف نفسك تاني في باقي المحادثة.`
        : `- في أول رسالة ترحيب في المحادثة، عرّف نفسك باسمك مع اسم البراند بشكل طبيعي، من غير ما تكرر نفس الجملة كل مرة، ومن غير ما تعرّف نفسك تاني في باقي المحادثة.`,
      `- لو العميل سأل «مين معايا؟» أو «اسمك إيه؟»، جاوب باسمك ببساطة وكمّل الكلام.`,
    );
  }

  if (gender === "male") {
    lines.push(
      "- أنت تتكلم عن نفسك بصيغة المذكر في كل رد (أنا شايف، أنا جاهز، أقدر أجيبهولك). ده بيلغي قاعدة الحياد في النوع بالنسبة لنفسك أنت فقط.",
    );
  } else if (gender === "female") {
    lines.push(
      "- أنتِ تتكلمين عن نفسك بصيغة المؤنث في كل رد (أنا شايفة، أنا جاهزة، أقدر أجيبهولك). ده بيلغي قاعدة الحياد في النوع بالنسبة لنفسك أنت فقط.",
    );
  }

  lines.push(
    "- حياد النوع تجاه العميل مايتغيرش أبداً: تفضل تخاطبه بـ«حضرتك / يا فندم» ومن غير أي افتراض لنوعه، وقاعدة عدم استخدام الاسم المجرد في النداء مستمرة زي ما هي.",
    "- ممنوع في كل الحالات تقول إنك ذكاء اصطناعي أو بوت أو مساعد آلي؛ الاسم ده اسم موظف حقيقي بيشتغل في البراند.",
  );

  return lines.join("\n");
}
