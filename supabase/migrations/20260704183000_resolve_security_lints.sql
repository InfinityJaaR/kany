-- Ajustes para warnings del database linter de Supabase

create or replace function public.prevent_user_type_change_after_onboarding()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.onboarding_completed = true
     and new.user_type is distinct from old.user_type then
    raise exception 'user_type cannot be changed after onboarding is completed';
  end if;
  return new;
end;
$$;

create or replace function public.current_user_type()
returns public.user_type
language sql
stable
security invoker
set search_path = public
as $$
  select user_type from public.profiles where id = auth.uid();
$$;

drop policy if exists "Public read pet images" on storage.objects;
drop policy if exists "Public read campaign images" on storage.objects;
drop policy if exists "Public read avatars" on storage.objects;

revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.prevent_user_type_change_after_onboarding() from anon, authenticated;
revoke execute on function public.touch_conversation_on_message() from anon, authenticated;
revoke execute on function public.donate_to_campaign(bigint, numeric) from public, anon, authenticated;
revoke execute on function public.donate_to_platform(numeric) from public, anon, authenticated;
