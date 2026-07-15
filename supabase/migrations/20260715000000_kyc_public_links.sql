-- KYC public links: lets a client fill their own KYC form via a shareable link.
--
-- Security model: the anon role gets NO policies on either table, so the public
-- anon key (which ships in the JS bundle) can read and write nothing here. The
-- kyc-form Edge Function is the only public door in; it uses the service role
-- key, which never leaves the server, and validates the token itself.
-- Submissions land in kyc_submissions for staff review — they never write
-- directly into clients.

-- ---------------------------------------------------------------- kyc_tokens
create table if not exists public.kyc_tokens (
  token        uuid primary key,
  client_id    text not null references public.clients(id) on delete cascade,
  created_at   timestamptz not null default now(),
  created_by   uuid references auth.users(id),
  expires_at   timestamptz not null,
  revoked_at   timestamptz,
  submitted_at timestamptz
);

create index if not exists kyc_tokens_client_id_idx on public.kyc_tokens (client_id);

comment on table public.kyc_tokens is
  'Bearer tokens for public KYC form links. Anyone holding a token is treated as that client, so tokens expire and can be revoked.';

-- ----------------------------------------------------------- kyc_submissions
create table if not exists public.kyc_submissions (
  id           uuid primary key default gen_random_uuid(),
  client_id    text not null references public.clients(id) on delete cascade,
  token        uuid references public.kyc_tokens(token) on delete set null,
  data         jsonb not null,
  submitted_at timestamptz not null default now(),
  status       text not null default 'pending'
                 check (status in ('pending', 'merged', 'dismissed')),
  reviewed_by  uuid references auth.users(id),
  reviewed_at  timestamptz
);

create index if not exists kyc_submissions_client_status_idx
  on public.kyc_submissions (client_id, status);

comment on table public.kyc_submissions is
  'Raw KYC data as submitted by clients via public link. Staff review and merge into clients; this stays as the audit trail of what the client actually declared.';

-- ------------------------------------------------------------------- RLS
alter table public.kyc_tokens      enable row level security;
alter table public.kyc_submissions enable row level security;

-- Authenticated staff only. No anon policies anywhere in this file — that is
-- deliberate: RLS with no matching policy denies by default.
drop policy if exists "staff manage kyc tokens" on public.kyc_tokens;
create policy "staff manage kyc tokens"
  on public.kyc_tokens for all
  to authenticated
  using (true) with check (true);

drop policy if exists "staff read kyc submissions" on public.kyc_submissions;
create policy "staff read kyc submissions"
  on public.kyc_submissions for select
  to authenticated
  using (true);

drop policy if exists "staff review kyc submissions" on public.kyc_submissions;
create policy "staff review kyc submissions"
  on public.kyc_submissions for update
  to authenticated
  using (true) with check (true);
