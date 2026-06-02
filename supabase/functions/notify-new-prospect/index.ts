// supabase/functions/notify-new-prospect/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const NOTIFY_TO = Deno.env.get("NOTIFY_TO") ?? "juan@ambarestate.do";
const FROM = Deno.env.get("NOTIFY_FROM") ?? "AMBAR <notifications@ambarestate.do>";
const CRM_URL = Deno.env.get("CRM_URL") ?? "https://crm.ambarestate.do";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

serve(async (req) => {
  try {
    const body = await req.json();
    const record = body.record;

    if (!record || !record.data) {
      return new Response("Skipped: no data", { status: 200 });
    }

    const c = record.data;
    const isWizardSubmission =
      c.source === "Web Wizard" || c.source === "Web Wizard - Exclusive";

    if (!isWizardSubmission) {
      return new Response("Skipped: not wizard", { status: 200 });
    }

    const isExclusive = c.source === "Web Wizard - Exclusive";
    const w = c.wizardSubmission || {};
    const pay = w.payment || {};
    const path = w.ownershipPath === "revenue"
      ? "Estate Revenue Program (70/30 · 16 wks personal use)"
      : "Personal Sanctuary (Unlimited Use)";

    const submittedLocal = new Date(c.createdAt).toLocaleString("en-US", {
      timeZone: "America/Santo_Domingo",
      dateStyle: "medium",
      timeStyle: "short",
    });

    const closingSummary = pay.closing?.path === "amber_financing"
      ? `Option B · ${pay.closing?.financingTermYears} yrs · est. ${fmt(pay.closing?.estimatedMonthly || 0)}/mo`
      : `Option A · ${fmt(pay.closing?.optionAAmount || 0)} independent`;

    const cadenceSummary = pay.phase3
      ? `${pay.phase3.cadence === "monthly" ? "Monthly" : "Quarterly"} · ${fmt(pay.phase3.installment)} × ${pay.phase3.numInstallments}`
      : "—";

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:#F5F1E8;">
  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 640px; margin: 0 auto; color: #1A2342; background: #F5F1E8; padding: 32px 28px;">

    <!-- Brand header -->
    <div style="text-align: center; padding-bottom: 22px; border-bottom: 1px solid #D4A24C;">
      ${isExclusive ? `
        <div style="display: inline-block; padding: 4px 14px; margin-bottom: 12px; background: #1A2342; letter-spacing: 0.32em; font-size: 9px; color: #D4A24C; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: 600;">
          The Reserve Collection · By Invitation
        </div>
      ` : ""}
      <div style="letter-spacing: 0.22em; font-size: 24px; font-weight: 600; margin-bottom: 4px;">AMBAR</div>
      <div style="font-family: Arial, sans-serif; letter-spacing: 0.3em; font-size: 10px; color: ${isExclusive ? "#B58938" : "#4A6FA5"}; text-transform: uppercase; font-weight: ${isExclusive ? "600" : "400"};">
        ${isExclusive ? "Priority Prospect · Exclusive Channel" : "New Prospect · Public Wizard"}
      </div>
    </div>

    <!-- Title -->
    <h2 style="font-family: Georgia, serif; color: #1A2342; margin-top: 26px; margin-bottom: 18px; font-weight: 500; font-size: 26px;">
      ${c.fullName}
    </h2>

    <!-- Contact -->
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr>
        <td style="padding: 10px 0; color: #4A6FA5; width: 38%; border-bottom: 1px solid rgba(26,35,66,0.08);">Email</td>
        <td style="padding: 10px 0; border-bottom: 1px solid rgba(26,35,66,0.08);">
          <a href="mailto:${c.email}" style="color: #1A2342; text-decoration: none;">${c.email}</a>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #4A6FA5; border-bottom: 1px solid rgba(26,35,66,0.08);">Phone</td>
        <td style="padding: 10px 0; border-bottom: 1px solid rgba(26,35,66,0.08);">${c.phone || "—"}</td>
      </tr>
      ${isExclusive && w.invitationCode ? `
      <tr>
        <td style="padding: 10px 0; color: #4A6FA5; border-bottom: 1px solid rgba(26,35,66,0.08);">Invitation Code</td>
        <td style="padding: 10px 0; border-bottom: 1px solid rgba(26,35,66,0.08); font-weight: 600; color: #B58938;">${w.invitationCode}</td>
      </tr>
      ` : ""}
      <tr>
        <td style="padding: 10px 0; color: #4A6FA5; border-bottom: 1px solid rgba(26,35,66,0.08);">Submitted</td>
        <td style="padding: 10px 0; border-bottom: 1px solid rgba(26,35,66,0.08);">${submittedLocal}</td>
      </tr>
    </table>

    <!-- Plan summary -->
    <div style="margin-top: 28px; padding: 22px; background: #EBE4D4; border: 1px solid rgba(26,35,66,0.08);">
      <div style="font-family: Arial, sans-serif; font-size: 10px; letter-spacing: 0.2em; color: #4A6FA5; text-transform: uppercase; margin-bottom: 14px; font-weight: 500;">
        Path to Ownership — Complete Villa (${fmt(w.villaPrice || 0)})
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #4A6FA5; border-bottom: 1px solid rgba(26,35,66,0.08);">Reserve</td>
          <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid rgba(26,35,66,0.08); font-weight: 500;">${fmt(pay.reserve || 10000)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #4A6FA5; border-bottom: 1px solid rgba(26,35,66,0.08);">Down Payment (30 days)</td>
          <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid rgba(26,35,66,0.08); font-weight: 500;">${fmt(pay.downPaymentDue || 0)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #4A6FA5; border-bottom: 1px solid rgba(26,35,66,0.08);">18-Month Phase</td>
          <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid rgba(26,35,66,0.08); font-weight: 500;">${cadenceSummary}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #4A6FA5; border-bottom: 1px solid rgba(26,35,66,0.08);">At Closing</td>
          <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid rgba(26,35,66,0.08); font-weight: 500;">${closingSummary}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #4A6FA5;">Lifestyle Path</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 500;">${path}</td>
        </tr>
      </table>
    </div>

    <!-- CTA -->
    <div style="margin-top: 28px; padding: 20px; background: #FFFFFF; border: 1px solid ${isExclusive ? "#1A2342" : "#D4A24C"}; text-align: center;">
      <div style="font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 0.2em; color: ${isExclusive ? "#B58938" : "#4A6FA5"}; text-transform: uppercase; margin-bottom: 10px; font-weight: 600;">
        ${isExclusive ? "Priority Follow-Up" : "Recommended Next Step"}
      </div>
      <div style="font-size: 14px; color: #1A2342; margin-bottom: 16px; line-height: 1.5;">
        ${isExclusive
          ? "Contact within <strong>24 hours</strong> — this is a priority invitation-only prospect."
          : "Contact within 48 hours to convert this prospect."}
      </div>
      <a href="${CRM_URL}" style="display: inline-block; padding: 12px 28px; background: #1A2342; color: #F5F1E8; text-decoration: none; font-family: Arial, sans-serif; letter-spacing: 0.18em; font-size: 11px; text-transform: uppercase; font-weight: 600;">
        Open in CRM →
      </a>
    </div>

    <!-- Footer -->
    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(26,35,66,0.1); text-align: center; font-family: Arial, sans-serif; font-size: 10px; letter-spacing: 0.3em; color: rgba(26,35,66,0.45); text-transform: uppercase;">
      AMBAR Longevity Estate · Santiago, Dominican Republic
    </div>
  </div>
</body>
</html>
    `;

    const subject = isExclusive
      ? `🔒 PRIORITY · Reserve Collection — ${c.fullName}`
      : `New AMBAR Prospect — ${c.fullName}`;

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: NOTIFY_TO.split(",").map((s) => s.trim()),
        subject,
        html,
        reply_to: c.email,
      }),
    });

    if (!r.ok) {
      const err = await r.text();
      console.error("Resend error:", err);
      return new Response(`Resend failed: ${err}`, { status: 500 });
    }

    return new Response("OK", { status: 200 });
  } catch (e) {
    console.error("Function error:", e);
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
});