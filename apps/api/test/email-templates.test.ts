import { describe, expect, it } from "vitest";
import {
  getOrderStatusEmailHtml,
  getShippingNoticeEmailHtml,
  getWelcomeEmailHtml,
} from "../src/lib/email/templates.js";

describe("transactional email templates", () => {
  it("renders the welcome invitation with shared branding and plain text", () => {
    const template = getWelcomeEmailHtml({ name: "Taylor Morgan" });

    expect(template.subject).toBe("You're invited to GoldDistro");
    expect(template.html).toContain("Gold<span");
    expect(template.html).toContain("Welcome, Taylor Morgan");
    expect(template.text).toContain("Hi Taylor Morgan");
  });

  it("renders a submitted order summary", () => {
    const template = getOrderStatusEmailHtml({
      customerName: "Taylor Morgan",
      orderNumber: "GD-1042",
      status: "submitted",
      items: [{ name: "Cold Brew Case", quantity: 2, price: "$48.00" }],
      totalAmount: "$48.00",
    });

    expect(template.subject).toBe("Order #GD-1042: Submitted");
    expect(template.html).toContain("Cold Brew Case");
    expect(template.html).toContain("Qty 2");
    expect(template.text).toContain("We received your order");
  });

  it("uses human-readable, status-specific order copy", () => {
    const template = getOrderStatusEmailHtml({
      orderNumber: "GD-1042",
      status: "partially_fulfilled",
    });

    expect(template.subject).toBe("Order #GD-1042: Partially fulfilled");
    expect(template.html).toContain("remaining items are still being fulfilled");
  });

  it("escapes dynamic values before inserting them into HTML", () => {
    const template = getOrderStatusEmailHtml({
      customerName: "<script>alert('x')</script>",
      orderNumber: "1042",
      status: "submitted",
      items: [{ name: "<img src=x onerror=alert(1)>", quantity: 1, price: "$1.00" }],
    });

    expect(template.html).not.toContain("<script>");
    expect(template.html).not.toContain("<img src=x");
    expect(template.html).toContain("&lt;script&gt;");
    expect(template.html).toContain("&lt;img src=x onerror=alert(1)&gt;");
  });

  it("only renders a tracking button for HTTP or HTTPS URLs", () => {
    const safeTemplate = getShippingNoticeEmailHtml({
      orderNumber: "GD-1042",
      trackingNumber: "TRACK123",
      carrier: "UPS",
      trackingUrl: "https://example.com/track/TRACK123",
    });
    const unsafeTemplate = getShippingNoticeEmailHtml({
      orderNumber: "GD-1042",
      trackingNumber: "TRACK123",
      carrier: "UPS",
      trackingUrl: "javascript:alert(1)",
    });

    expect(safeTemplate.html).toContain("Track shipment");
    expect(unsafeTemplate.html).not.toContain("Track shipment");
    expect(unsafeTemplate.html).not.toContain("javascript:");
  });
});
