/**
 * Merchant-chosen agent identity (name + gender): read + update.
 * Server functions backed by the merchants row of the signed-in owner.
 */
import { createServerFn } from "@tanstack/react-start";
import {
  normalizeAgentGender,
  normalizeAgentName,
  type AgentGender,
  type AgentIdentity,
} from "@/lib/agent-identity";

async function loadUserAdmin() {
  const { requireUserId } = await import("@/lib/session-guard.server");
  const { getSupabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { userId } = await requireUserId();
  return { userId, admin: getSupabaseAdmin() };
}

export const getAgentIdentity = createServerFn({ method: "GET" }).handler(
  async (): Promise<AgentIdentity> => {
    const { userId, admin } = await loadUserAdmin();
    try {
      const { data } = await admin
        .from("merchants")
        .select("agent_name, agent_gender")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      return {
        name: normalizeAgentName(data?.agent_name),
        gender: normalizeAgentGender(data?.agent_gender),
      };
    } catch {
      // Columns not migrated yet — behave as "not chosen".
      return { name: null, gender: "unspecified" };
    }
  },
);

export const updateAgentIdentity = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string | null; gender: AgentGender }) => ({
    name: normalizeAgentName(d?.name),
    gender: normalizeAgentGender(d?.gender),
  }))
  .handler(async ({ data }): Promise<AgentIdentity> => {
    const { userId, admin } = await loadUserAdmin();
    const { error } = await admin
      .from("merchants")
      .update({ agent_name: data.name, agent_gender: data.gender })
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return data;
  });
