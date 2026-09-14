import { describe, it, expect } from "vitest";
import {
  assistantAskedOrderName,
  customerAnsweredWithName,
  resolveOrderOwnerName,
} from "@/lib/order-owner-name";

describe("order owner name", () => {
  it("detects the order-name question", () => {
    expect(assistantAskedOrderName("الطلب هيتسجّل باسم مين يا فندم؟")).toBe(true);
    expect(assistantAskedOrderName("ممكن الاسم بالكامل يا فندم؟")).toBe(true);
    expect(assistantAskedOrderName("تحب تدفع إزاي؟")).toBe(false);
  });

  it("detects a name answer", () => {
    expect(customerAnsweredWithName("اسمي نور يوسف")).toBe(true);
    expect(customerAnsweredWithName("نور يوسف")).toBe(true);
    expect(customerAnsweredWithName("01012345678")).toBe(false);
  });

  it("a chat name is never the order owner on its own", () => {
    const r = resolveOrderOwnerName({
      value: "نور",
      stage: "extracted",
      lastAssistantText: "تمام، المقاس متوفر",
      lastCustomerText: "تمام",
    });
    expect(r.value).toBe("نور");
    expect(r.isOrderOwner).toBe(false);
  });

  it("becomes the order owner once the customer answers the order-name question", () => {
    const r = resolveOrderOwnerName({
      value: "نور يوسف",
      stage: "extracted",
      lastAssistantText: "الطلب هيتسجّل باسم مين؟",
      lastCustomerText: "نور يوسف",
    });
    expect(r.isOrderOwner).toBe(true);
    expect(r.answeredNow).toBe(true);
  });

  it("a confirmed or committed name is the order owner", () => {
    expect(resolveOrderOwnerName({ value: "نور يوسف", stage: "confirmed" }).isOrderOwner).toBe(true);
    expect(resolveOrderOwnerName({ value: "نور يوسف", stage: "committed" }).isOrderOwner).toBe(true);
  });
});
