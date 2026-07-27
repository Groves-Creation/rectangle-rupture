import { Resend } from "resend";
import { env } from "../../env.js";
import {
  getWelcomeEmailHtml,
  getOrderStatusEmailHtml,
  getShippingNoticeEmailHtml,
  type WelcomeEmailParams,
  type OrderStatusEmailParams,
  type ShippingNoticeEmailParams,
} from "./templates.js";

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  // Tests must never create an external side effect, even when a developer's
  // local .env contains a valid Resend key.
  if (env.NODE_ENV === "test") {
    return null;
  }

  if (!resendClient && env.RESEND_API_KEY) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  const client = getResendClient();
  const from = env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (!client) {
    if (env.NODE_ENV !== "test") {
      console.log(`[Email Service - Simulated] To: ${to} | From: ${from} | Subject: ${subject}`);
    }
    return { success: true, id: `simulated-${Date.now()}` };
  }

  try {
    const { data, error } = await client.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error(`[Email Service Error] Failed to send email to ${to}:`, error);
      return { success: false, error: error.message };
    }

    console.log(`[Email Service] Sent email to ${to} (ID: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (error: unknown) {
    console.error(`[Email Service Exception] Exception sending email to ${to}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function sendWelcomeEmail(to: string, params: WelcomeEmailParams) {
  const { subject, html, text } = getWelcomeEmailHtml(params);
  return sendEmail({ to, subject, html, text });
}

export async function sendOrderStatusEmail(to: string, params: OrderStatusEmailParams) {
  const { subject, html, text } = getOrderStatusEmailHtml(params);
  return sendEmail({ to, subject, html, text });
}

export async function sendShippingNoticeEmail(to: string, params: ShippingNoticeEmailParams) {
  const { subject, html, text } = getShippingNoticeEmailHtml(params);
  return sendEmail({ to, subject, html, text });
}
