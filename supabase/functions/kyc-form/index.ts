// supabase/functions/kyc-form/index.ts
//
// Public endpoint backing the shareable KYC link. This is the ONLY door the
// anon world has into KYC data: the clients table has no anon RLS policies, and
// the service role key used here never leaves the server.
//
// GET  ?token=<uuid>  -> validates the token, returns branding + minimal prefill
// POST { token, data } -> validates, sanitizes, stores in kyc_submissions
//
// Two rules this file exists to enforce:
//   1. Never echo back client PII. A link can be forwarded or sit in a shared
//      inbox, so the holder learns only the name already known to whoever the
//      link was sent to.
//   2. Never trust submitted data. Everything is run through a strict field
//      allowlist with length caps before it is stored, so a hostile submitter
//      cannot reach fields like pricing, status, riskLevel or kycComplete.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const cors = {
  "Access-Control-Allow-Origin": Deno.env.get("KYC_ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

// ---------------------------------------------------------------- sanitizing

const MAX_STR = 300;
const MAX_TEXT = 2000;
const MAX_UBOS = 10;

const str = (v: unknown, max = MAX_STR): string => {
  if (typeof v === "number" || typeof v === "boolean") v = String(v);
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
};

// Fields the client is allowed to declare about themselves. Anything not listed
// here is dropped on the floor — notably pricing, status, stage, payments,
// paymentPlan, commission, riskLevel, kycComplete, lotNumber and villaModel,
// which are ours to set, not theirs.
const INDIVIDUAL_FIELDS = [
  "fullName", "nationality", "idType", "idNumber", "countryOfIssue",
  "idExpiration", "taxId", "dateOfBirth", "placeOfBirth", "maritalStatus",
  "spouseName", "spouseId", "profession", "employer", "position",
];

const ENTITY_FIELDS = [
  "companyName", "rnc", "businessTaxId", "incorporationDate",
  "incorporationCountry", "businessActivity", "website", "legalRepName",
  "legalRepNationality", "legalRepId", "legalRepPosition",
];

const CONTACT_FIELDS = ["email", "phone", "phoneSecondary"];
const PEP_FIELDS = ["pepName", "pepPosition", "pepRelationship"];

function sanitizeSubmission(raw: unknown, type: string) {
  const input = (raw ?? {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  const allowed = type === "entity" ? ENTITY_FIELDS : INDIVIDUAL_FIELDS;
  for (const f of [...allowed, ...CONTACT_FIELDS, ...PEP_FIELDS]) {
    const v = str(input[f]);
    if (v) out[f] = v;
  }

  // Longer free-text fields
  const address = str(input.address, MAX_TEXT);
  if (address) out.address = address;
  const sourceOfFunds = str(input.sourceOfFunds, MAX_TEXT);
  if (sourceOfFunds) out.sourceOfFunds = sourceOfFunds;

  // isPep is a real boolean; anything else is treated as "not declared"
  if (typeof input.isPep === "boolean") out.isPep = input.isPep;

  if (Array.isArray(input.ubos)) {
    const ubos = input.ubos.slice(0, MAX_UBOS).map((u) => {
      const o = (u ?? {}) as Record<string, unknown>;
      return {
        name: str(o.name),
        nationality: str(o.nationality),
        idNumber: str(o.idNumber),
        percentage: str(o.percentage, 10),
      };
    }).filter((u) => u.name || u.idNumber);
    if (ubos.length) out.ubos = ubos;
  }

  return out;
}

// ------------------------------------------------------------ token handling

type TokenRow = {
  token: string;
  client_id: string;
  expires_at: string;
  revoked_at: string | null;
};

async function resolveToken(token: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
    return { error: "invalid" as const };
  }
  const { data, error } = await admin
    .from("kyc_tokens")
    .select("token, client_id, expires_at, revoked_at")
    .eq("token", token)
    .maybeSingle();

  if (error) {
    console.error("Token lookup failed:", error.message);
    return { error: "server" as const };
  }
  if (!data) return { error: "invalid" as const };

  const row = data as TokenRow;
  if (row.revoked_at) return { error: "revoked" as const };
  if (new Date(row.expires_at).getTime() < Date.now()) return { error: "expired" as const };
  return { row };
}

// Brand identity is not sensitive — it is on the public website already — and
// the form looks wrong without it, since the settings table needs auth to read.
async function loadBranding() {
  const { data } = await admin.from("settings").select("data").eq("id", 1).maybeSingle();
  const s = (data?.data ?? {}) as Record<string, any>;
  return {
    branding: s.branding ?? {},
    company: {
      legalName: s.company?.legalName ?? "",
      website: s.company?.website ?? "",
      email: s.company?.email ?? "",
    },
  };
}

// ------------------------------------------------------------------- handler

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    if (req.method === "GET") {
      const token = new URL(req.url).searchParams.get("token") ?? "";
      const res = await resolveToken(token);
      if ("error" in res) return json({ error: res.error }, res.error === "server" ? 500 : 404);

      const { data: clientRow } = await admin
        .from("clients").select("data").eq("id", res.row.client_id).maybeSingle();
      const c = (clientRow?.data ?? {}) as Record<string, any>;

      // Deliberately minimal: a greeting name and which variant of the form to
      // render. No passport, no tax ID, no address.
      const { branding, company } = await loadBranding();
      return json({
        ok: true,
        clientName: c.type === "entity" ? (c.companyName ?? "") : (c.fullName ?? ""),
        type: c.type === "entity" ? "entity" : "individual",
        expiresAt: res.row.expires_at,
        branding,
        company,
      });
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const token = str(body?.token, 64);
      const res = await resolveToken(token);
      if ("error" in res) return json({ error: res.error }, res.error === "server" ? 500 : 404);

      const { data: clientRow } = await admin
        .from("clients").select("data").eq("id", res.row.client_id).maybeSingle();
      const type = (clientRow?.data as any)?.type === "entity" ? "entity" : "individual";

      const clean = sanitizeSubmission(body?.data, type);
      if (Object.keys(clean).length === 0) return json({ error: "empty" }, 400);

      const { error: insErr } = await admin.from("kyc_submissions").insert({
        client_id: res.row.client_id,
        token: res.row.token,
        data: clean,
      });
      if (insErr) {
        console.error("Submission insert failed:", insErr.message);
        return json({ error: "server" }, 500);
      }

      // Leave the token usable until staff merges (they revoke it then) so the
      // client can correct a mistake without needing a fresh link.
      await admin.from("kyc_tokens")
        .update({ submitted_at: new Date().toISOString() })
        .eq("token", res.row.token);

      return json({ ok: true });
    }

    return json({ error: "method_not_allowed" }, 405);
  } catch (e) {
    console.error("kyc-form error:", e);
    return json({ error: "server" }, 500);
  }
});
