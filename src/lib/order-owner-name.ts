/**
 * ORDER OWNER NAME — who the order is registered for, as opposed to the name
 * the agent uses to ADDRESS the person in chat.
 *
 * Why this module exists
 * ----------------------
 * The prompt already carries the rule "the chat name is not automatically the
 * order name". That rule kept losing, because a LOWER layer contradicted it:
 * the conversational name (from the customer row / this turn's extraction) was
 * merged into the structured order state under `name`, and the ACTIVE ORDER
 * STATE block then printed it as a known order field and removed "الاسم" from
 * the missing list. The model reads structured state as fact, so a rule stated
 * in prose could never win against it.
 *
 * This module makes the distinction explicit at the state layer:
 *   - a name whose stage is `confirmed` / `committed` IS the order owner,
 *   - any other name is only a form of address, unless the customer has just
 *     answered the order-name question in this very turn.
 *
 * Pure: no network, no database, no environment.
 */

import { normalizeText } from "@/lib/order-data-verification";

/** The agent asked, at the order step, which name the order goes under. */
const ORDER_NAME_ASK = [
  /الطلب\s*(هيتسجل|هيكون|يتسجل|هنسجله)?\s*(باسم|بأسم)\s*(مين|من)/,
  /(باسم|بأسم)\s*مين/,
  /اسم\s*(صاحب|مستلم|المستلم|متلقي)\s*(الطلب|الاوردر|الأوردر)/,
  /الاسم\s*(بالكامل|الكامل|الثلاثي|الثنائي)/,
  /الاوردر\s*(باسم|بأسم)/,
];

export function assistantAskedOrderName(text: string | null | undefined): boolean {
  const n = normalizeText(String(text ?? ""));
  if (!n) return false;
  return ORDER_NAME_ASK.some((re) => re.test(n));
}

/**
 * The customer's reply looks like an answer to that question: an explicit
 * "اسمي …" / "باسم …", or a short letters-only line that reads as a name.
 */
export function customerAnsweredWithName(text: string | null | undefined): boolean {
  const raw = String(text ?? "").trim();
  if (!raw) return false;
  const n = normalizeText(raw);
  if (!n) return false;
  if (/^(اسمي|اسمه|اسمها|باسم|بأسم|سجله باسم|سجليه باسم)\b/.test(n)) return true;
  if (/\d/.test(n)) return false;
  const words = n.split(" ").filter(Boolean);
  return words.length >= 1 && words.length <= 5 && words.every((w) => w.length >= 2);
}

export interface OrderOwnerNameInput {
  /** Value stored in the structured order state, if any. */
  value?: string | null;
  /** Its stage in the structured order state. */
  stage?: "extracted" | "verified" | "confirmed" | "committed" | null;
  /** Last thing the agent said before the customer's current message. */
  lastAssistantText?: string | null;
  /** The customer's current message. */
  lastCustomerText?: string | null;
}

export interface OrderOwnerNameResult {
  /** The name value, whatever its role. */
  value: string | null;
  /** True only when this name may be used as the order owner. */
  isOrderOwner: boolean;
  /** True when the customer just answered the order-name question. */
  answeredNow: boolean;
}

export function resolveOrderOwnerName(input: OrderOwnerNameInput): OrderOwnerNameResult {
  const value = String(input.value ?? "").trim() || null;
  const settled = input.stage === "confirmed" || input.stage === "committed";
  const answeredNow =
    assistantAskedOrderName(input.lastAssistantText) &&
    customerAnsweredWithName(input.lastCustomerText);
  return { value, isOrderOwner: Boolean(value) && (settled || answeredNow), answeredNow };
}
