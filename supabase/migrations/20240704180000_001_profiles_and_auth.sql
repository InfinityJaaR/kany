-- Perfiles y tipos de usuario vinculados a Supabase Auth

create type public.user_type as enum ('person', 'foundation', 'vet');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  user_type public.user_type not null default 'person',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, user_type, full_name)
  values (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data->>'user_type')::public.user_type, 'person'),
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
