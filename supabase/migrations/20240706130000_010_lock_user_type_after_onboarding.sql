-- Prevent user_type changes after onboarding is completed

create or replace function public.prevent_user_type_change_after_onboarding()
returns trigger
language plpgsql
as $$
begin
  if old.onboarding_completed = true
     and new.user_type is distinct from old.user_type then
    raise exception 'user_type cannot be changed after onboarding is completed';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_lock_user_type on public.profiles;

create trigger profiles_lock_user_type
  before update on public.profiles
  for each row
  execute function public.prevent_user_type_change_after_onboarding();
