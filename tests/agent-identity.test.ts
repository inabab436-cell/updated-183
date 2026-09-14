import { describe, it, expect } from "vitest";
import {
  buildAgentIdentityBlock,
  normalizeAgentGender,
  normalizeAgentName,
} from "@/lib/agent-identity";
import { AGENT_PROMPT_SECTIONS } from "@/lib/agent-prompt";

describe("agent identity", () => {
  it("stays silent when the owner chose nothing", () => {
    expect(buildAgentIdentityBlock({ name: null, gender: "unspecified" })).toBe("");
  });

  it("binds the chosen name and introduces it with the brand", () => {
    const block = buildAgentIdentityBlock({ name: "سلمى", gender: "female" }, "IKKE");
    expect(block).toContain("«سلمى»");
    expect(block).toContain("IKKE");
    expect(block).toContain("بصيغة المؤنث");
  });

  it("keeps customer-facing neutrality even with a gendered agent", () => {
    const block = buildAgentIdentityBlock({ name: "كريم", gender: "male" });
    expect(block).toContain("بصيغة المذكر");
    expect(block).toContain("حضرتك");
  });

  it("normalizes stored values", () => {
    expect(normalizeAgentGender("other")).toBe("unspecified");
    expect(normalizeAgentName("  سلمى  ")).toBe("سلمى");
    expect(normalizeAgentName("")).toBeNull();
  });

  it("the base prompt defers to the identity block", () => {
    const rules = AGENT_PROMPT_SECTIONS.flatMap((s) => s.rules).join("\n");
    expect(rules).toContain("AGENT IDENTITY block");
    expect(rules).not.toContain("You are Cupai");
  });
});
