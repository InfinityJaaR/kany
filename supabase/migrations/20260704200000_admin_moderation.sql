-- Admin moderation: is_admin(), campaign/vet revocation, admin delete policies

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- campaigns: audit columns for revocation
alter table public.campaigns
  add column if not exists revoked_at timestamptz,
  add column if not exists revoked_by uuid references public.profiles (id) on delete set null,
  add column if not exists revoke_reason text;

alter table public.campaigns
  drop constraint if exists campaigns_status_check;

alter table public.campaigns
  add constraint campaigns_status_check
  check (status in ('normal', 'urgent', 'success', 'revoked'));

-- vets: listing status for soft revocation
alter table public.vets
  add column if not exists listing_status text not null default 'active',
  add column if not exists revoked_at timestamptz,
  add column if not exists revoked_by uuid references public.profiles (id) on delete set null,
  add column if not exists revoke_reason text;

alter table public.vets
  drop constraint if exists vets_listing_status_check;

alter table public.vets
  add constraint vets_listing_status_check
  check (listing_status in ('active', 'revoked'));

create index if not exists vets_listing_status_idx on public.vets (listing_status);

-- RLS: admin moderation policies
create policy "Admins can update any campaign"
  on public.campaigns for update
  to authenticated
  using (public.is_admin());

create policy "Admins can update any vet listing"
  on public.vets for update
  to authenticated
  using (public.is_admin());

create policy "Admins can delete vet listings"
  on public.vets for delete
  to authenticated
  using (public.is_admin());

create policy "Admins can delete recovered lost pets"
  on public.lost_pets for delete
  to authenticated
  using (public.is_admin() and status = 'found');

-- Block donations to revoked campaigns
create or replace function public.donate_to_campaign(p_campaign_id bigint, p_amount numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Invalid amount';
  end if;

  update public.campaigns
  set
    current = current + p_amount,
    donors = donors + 1
  where id = p_campaign_id
    and status is distinct from 'success'
    and status is distinct from 'revoked';

  if not found then
    raise exception 'Campaign not found or not accepting donations';
  end if;
end;
$$;

grant execute on function public.donate_to_campaign(bigint, numeric) to authenticated;
