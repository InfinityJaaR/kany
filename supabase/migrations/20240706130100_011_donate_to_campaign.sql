-- Simulated donation: increment campaign totals for authenticated users

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
    and status is distinct from 'success';

  if not found then
    raise exception 'Campaign not found or already completed';
  end if;
end;
$$;

grant execute on function public.donate_to_campaign(bigint, numeric) to authenticated;
