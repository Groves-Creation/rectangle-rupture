export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface WelcomeEmailParams {
  name: string;
}

export interface OrderStatusEmailParams {
  customerName?: string;
  orderNumber: string;
  status: string;
  items?: Array<{ name: string; quantity: number; price: string }>;
  totalAmount?: string;
}

export interface ShippingNoticeEmailParams {
  customerName?: string;
  orderNumber: string;
  trackingNumber: string;
  carrier: string;
  trackingUrl?: string;
}

const BRAND = {
  name: "GoldDistro",
  navy: "#111827",
  gold: "#D5A33F",
  canvas: "#F5F3EE",
  card: "#FFFFFF",
  text: "#202735",
  muted: "#667085",
  border: "#E6E2D9",
} as const;

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  approved: "Approved",
  inventory_allocated: "Inventory allocated",
  picking: "Picking",
  partially_fulfilled: "Partially fulfilled",
  picked: "Picked",
  packed: "Packed",
  route_assigned: "Route assigned",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  receiving_required: "Receiving required",
  completed: "Completed",
  backordered: "Backordered",
  cancelled: "Cancelled",
  rejected: "Rejected",
  delivery_failed: "Delivery failed",
};

const STATUS_MESSAGES: Record<string, string> = {
  submitted: "We received your order and sent it to the distribution team for review.",
  under_review: "The distribution team is reviewing your order.",
  approved: "Your order has been approved and is moving into fulfillment.",
  inventory_allocated: "Inventory has been reserved for your order.",
  picking: "The warehouse team is picking the items in your order.",
  partially_fulfilled: "Part of your order is ready while the remaining items are still being fulfilled.",
  picked: "All available items have been picked for your order.",
  packed: "Your order has been packed and is being prepared for dispatch.",
  route_assigned: "Your order has been assigned to a delivery route.",
  out_for_delivery: "Your order is on its way to your location.",
  delivered: "Your order has been delivered.",
  receiving_required: "Your delivery is ready to be checked in and received.",
  completed: "Your order is complete. Thank you for choosing GoldDistro.",
  backordered: "One or more items are backordered. The distribution team will keep you updated.",
  cancelled: "This order has been cancelled.",
  rejected: "This order could not be approved. Contact your distribution team if you have questions.",
  delivery_failed: "We could not complete this delivery. The distribution team will follow up with next steps.",
};

function escapeHtml(value: string | number): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeSubject(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function safeHttpUrl(value?: string): string | undefined {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function readableStatus(status: string): string {
  const normalized = status.trim().toLowerCase();
  return (
    STATUS_LABELS[normalized] ??
    normalized
      .replace(/[_-]+/g, " ")
      .replace(/^./, (character) => character.toUpperCase())
  );
}

function statusMessage(status: string): string {
  const normalized = status.trim().toLowerCase();
  return STATUS_MESSAGES[normalized] ?? "Your order status has changed.";
}

function statusColors(status: string): { background: string; foreground: string; border: string } {
  const normalized = status.trim().toLowerCase();

  if (["approved", "delivered", "completed"].includes(normalized)) {
    return { background: "#ECFDF3", foreground: "#027A48", border: "#ABEFC6" };
  }
  if (["rejected", "cancelled", "delivery_failed"].includes(normalized)) {
    return { background: "#FEF3F2", foreground: "#B42318", border: "#FECDCA" };
  }
  if (["backordered", "partially_fulfilled", "receiving_required"].includes(normalized)) {
    return { background: "#FFFAEB", foreground: "#B54708", border: "#FEDF89" };
  }
  return { background: "#EFF4FF", foreground: "#3538CD", border: "#C7D7FE" };
}

function renderButton(label: string, href: string): string {
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 24px 0 0;">
      <tr>
        <td bgcolor="${BRAND.navy}" style="border-radius: 7px;">
          <a href="${escapeHtml(href)}" target="_blank" style="display: inline-block; padding: 13px 22px; border: 1px solid ${BRAND.navy}; border-radius: 7px; color: #FFFFFF; font-size: 15px; font-weight: 700; line-height: 20px; text-decoration: none;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>`;
}

function renderLayout({
  preview,
  eyebrow,
  title,
  intro,
  content,
  footerNote,
}: {
  preview: string;
  eyebrow: string;
  title: string;
  intro: string;
  content: string;
  footerNote: string;
}): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="color-scheme" content="light">
    <title>${escapeHtml(title)}</title>
    <style>
      @media only screen and (max-width: 620px) {
        .email-shell { width: 100% !important; }
        .email-content { padding: 30px 22px !important; }
        .email-header { padding: 24px 22px !important; }
        .mobile-stack { display: block !important; width: 100% !important; }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: ${BRAND.canvas}; color: ${BRAND.text};">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">${escapeHtml(preview)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; background-color: ${BRAND.canvas};">
      <tr>
        <td align="center" style="padding: 32px 12px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" class="email-shell" style="width: 600px; max-width: 600px; background-color: ${BRAND.card}; border: 1px solid ${BRAND.border}; border-radius: 12px;">
            <tr>
              <td class="email-header" style="padding: 26px 36px; background-color: ${BRAND.navy}; border-radius: 11px 11px 0 0;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td valign="middle">
                      <div style="font-family: Arial, Helvetica, sans-serif; font-size: 21px; font-weight: 800; line-height: 26px; letter-spacing: -0.3px; color: #FFFFFF;">Gold<span style="color: ${BRAND.gold};">Distro</span></div>
                    </td>
                    <td align="right" valign="middle" style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; font-weight: 700; line-height: 16px; letter-spacing: 1.2px; text-transform: uppercase; color: #D0D5DD;">Distribution, simplified</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="email-content" style="padding: 38px 36px 36px; font-family: Arial, Helvetica, sans-serif;">
                <div style="margin: 0 0 10px; color: #9A6B12; font-size: 12px; font-weight: 800; line-height: 18px; letter-spacing: 1.3px; text-transform: uppercase;">${escapeHtml(eyebrow)}</div>
                <h1 style="margin: 0; color: ${BRAND.navy}; font-size: 30px; font-weight: 750; line-height: 37px; letter-spacing: -0.7px;">${escapeHtml(title)}</h1>
                <p style="margin: 18px 0 0; color: ${BRAND.text}; font-size: 16px; line-height: 25px;">${escapeHtml(intro)}</p>
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding: 22px 36px 26px; border-top: 1px solid ${BRAND.border}; font-family: Arial, Helvetica, sans-serif;">
                <p style="margin: 0; color: ${BRAND.muted}; font-size: 12px; line-height: 18px;">${escapeHtml(footerNote)}</p>
                <p style="margin: 8px 0 0; color: #98A2B3; font-size: 11px; line-height: 17px;">&copy; ${new Date().getFullYear()} ${BRAND.name}. This is an automated transactional email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function getWelcomeEmailHtml({ name }: WelcomeEmailParams): EmailTemplate {
  const recipientName = name.trim() || "there";
  const subject = "You're invited to GoldDistro";
  const text = [
    `Hi ${recipientName},`,
    "",
    "You've been invited to GoldDistro, the ordering and fulfillment workspace that keeps your store connected with its distribution team.",
    "",
    "Your account invitation has been created. Your administrator will let you know when access is ready.",
    "",
    "GoldDistro",
  ].join("\n");

  const content = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 26px; background-color: #FFFAEB; border: 1px solid #F4D99A; border-radius: 9px;">
      <tr>
        <td style="padding: 18px 20px;">
          <p style="margin: 0; color: #7A5310; font-size: 14px; font-weight: 700; line-height: 21px;">What happens next</p>
          <p style="margin: 5px 0 0; color: #7A5310; font-size: 14px; line-height: 21px;">Your account invitation has been created. Your administrator will let you know when access is ready.</p>
        </td>
      </tr>
    </table>
    <p style="margin: 24px 0 0; color: ${BRAND.muted}; font-size: 14px; line-height: 22px;">Once activated, you can browse the catalog, place orders, and follow fulfillment updates from one place.</p>`;

  return {
    subject,
    text,
    html: renderLayout({
      preview: `Welcome to GoldDistro, ${recipientName}.`,
      eyebrow: "Account invitation",
      title: `Welcome, ${recipientName}`,
      intro:
        "You've been invited to GoldDistro, the ordering and fulfillment workspace that keeps your store connected with its distribution team.",
      content,
      footerNote: "You received this email because a GoldDistro administrator invited you.",
    }),
  };
}

export function getOrderStatusEmailHtml({
  customerName = "Valued customer",
  orderNumber,
  status,
  items = [],
  totalAmount,
}: OrderStatusEmailParams): EmailTemplate {
  const recipientName = customerName.trim() || "Valued customer";
  const cleanOrderNumber = sanitizeSubject(orderNumber);
  const label = readableStatus(status);
  const message = statusMessage(status);
  const colors = statusColors(status);
  const subject = `Order #${cleanOrderNumber}: ${label}`;

  const itemLines = items.map(
    (item) => `- ${item.name} x${item.quantity}: ${item.price}`,
  );
  const text = [
    `Hi ${recipientName},`,
    "",
    `Order #${cleanOrderNumber} is now ${label}.`,
    message,
    ...(itemLines.length > 0 ? ["", "Order summary", ...itemLines] : []),
    ...(totalAmount ? ["", `Total: ${totalAmount}`] : []),
    "",
    "GoldDistro",
  ].join("\n");

  const itemsHtml =
    items.length > 0
      ? `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 28px; border: 1px solid ${BRAND.border}; border-radius: 9px; border-collapse: separate; border-spacing: 0;">
          <tr>
            <td colspan="3" style="padding: 15px 18px; background-color: #F9FAFB; border-bottom: 1px solid ${BRAND.border}; color: ${BRAND.navy}; font-size: 13px; font-weight: 800; line-height: 18px; letter-spacing: 0.4px; text-transform: uppercase;">Order summary</td>
          </tr>
          ${items
            .map(
              (item, index) => `
                <tr>
                  <td style="padding: 14px 18px;${index < items.length - 1 ? ` border-bottom: 1px solid ${BRAND.border};` : ""} color: ${BRAND.text}; font-size: 14px; line-height: 20px;">${escapeHtml(item.name)}</td>
                  <td align="center" style="padding: 14px 8px;${index < items.length - 1 ? ` border-bottom: 1px solid ${BRAND.border};` : ""} color: ${BRAND.muted}; font-size: 14px; line-height: 20px; white-space: nowrap;">Qty ${escapeHtml(item.quantity)}</td>
                  <td align="right" style="padding: 14px 18px 14px 8px;${index < items.length - 1 ? ` border-bottom: 1px solid ${BRAND.border};` : ""} color: ${BRAND.navy}; font-size: 14px; font-weight: 700; line-height: 20px; white-space: nowrap;">${escapeHtml(item.price)}</td>
                </tr>`,
            )
            .join("")}
          ${
            totalAmount
              ? `<tr>
                  <td colspan="2" align="right" style="padding: 16px 8px 16px 18px; border-top: 1px solid ${BRAND.border}; color: ${BRAND.muted}; font-size: 14px; font-weight: 700; line-height: 20px;">Total</td>
                  <td align="right" style="padding: 16px 18px 16px 8px; border-top: 1px solid ${BRAND.border}; color: ${BRAND.navy}; font-size: 16px; font-weight: 800; line-height: 20px; white-space: nowrap;">${escapeHtml(totalAmount)}</td>
                </tr>`
              : ""
          }
        </table>`
      : totalAmount
        ? `<p style="margin: 24px 0 0; color: ${BRAND.navy}; font-size: 15px; line-height: 22px;"><strong>Total:</strong> ${escapeHtml(totalAmount)}</p>`
        : "";

  const content = `
    <p style="margin: 20px 0 0; color: ${BRAND.text}; font-size: 15px; line-height: 23px;">Hi ${escapeHtml(recipientName)},</p>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 22px; background-color: ${colors.background}; border: 1px solid ${colors.border}; border-radius: 9px;">
      <tr>
        <td style="padding: 18px 20px;">
          <div style="color: ${colors.foreground}; font-size: 12px; font-weight: 800; line-height: 18px; letter-spacing: 1px; text-transform: uppercase;">${escapeHtml(label)}</div>
          <p style="margin: 6px 0 0; color: ${colors.foreground}; font-size: 14px; line-height: 22px;">${escapeHtml(message)}</p>
        </td>
      </tr>
    </table>
    ${itemsHtml}`;

  return {
    subject,
    text,
    html: renderLayout({
      preview: `Order #${cleanOrderNumber} is now ${label}.`,
      eyebrow: "Order update",
      title: `Order #${cleanOrderNumber}`,
      intro: `Your order status is now ${label}.`,
      content,
      footerNote: "You received this email because you placed or manage this order.",
    }),
  };
}

export function getShippingNoticeEmailHtml({
  customerName = "Valued customer",
  orderNumber,
  trackingNumber,
  carrier,
  trackingUrl,
}: ShippingNoticeEmailParams): EmailTemplate {
  const recipientName = customerName.trim() || "Valued customer";
  const cleanOrderNumber = sanitizeSubject(orderNumber);
  const safeTrackingUrl = safeHttpUrl(trackingUrl);
  const subject = `Order #${cleanOrderNumber} is on its way`;
  const text = [
    `Hi ${recipientName},`,
    "",
    `Order #${cleanOrderNumber} has shipped with ${carrier}.`,
    `Tracking number: ${trackingNumber}`,
    ...(safeTrackingUrl ? [`Track your shipment: ${safeTrackingUrl}`] : []),
    "",
    "GoldDistro",
  ].join("\n");

  const content = `
    <p style="margin: 20px 0 0; color: ${BRAND.text}; font-size: 15px; line-height: 23px;">Hi ${escapeHtml(recipientName)}, your order has left the warehouse and is headed your way.</p>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 24px; background-color: #F9FAFB; border: 1px solid ${BRAND.border}; border-radius: 9px;">
      <tr>
        <td class="mobile-stack" width="42%" style="padding: 18px 20px; border-bottom: 1px solid ${BRAND.border}; color: ${BRAND.muted}; font-size: 12px; font-weight: 800; line-height: 18px; letter-spacing: 0.7px; text-transform: uppercase;">Carrier</td>
        <td class="mobile-stack" align="right" style="padding: 18px 20px; border-bottom: 1px solid ${BRAND.border}; color: ${BRAND.navy}; font-size: 15px; font-weight: 700; line-height: 20px;">${escapeHtml(carrier)}</td>
      </tr>
      <tr>
        <td class="mobile-stack" width="42%" style="padding: 18px 20px; color: ${BRAND.muted}; font-size: 12px; font-weight: 800; line-height: 18px; letter-spacing: 0.7px; text-transform: uppercase;">Tracking number</td>
        <td class="mobile-stack" align="right" style="padding: 18px 20px; color: ${BRAND.navy}; font-family: Consolas, Monaco, monospace; font-size: 14px; font-weight: 700; line-height: 20px; word-break: break-all;">${escapeHtml(trackingNumber)}</td>
      </tr>
    </table>
    ${safeTrackingUrl ? renderButton("Track shipment", safeTrackingUrl) : ""}`;

  return {
    subject,
    text,
    html: renderLayout({
      preview: `Order #${cleanOrderNumber} has shipped with ${carrier}.`,
      eyebrow: "Shipping notice",
      title: "Your order is on the way",
      intro: `Order #${cleanOrderNumber} has shipped.`,
      content,
      footerNote: "Tracking updates are provided by the carrier and may take time to appear.",
    }),
  };
}
