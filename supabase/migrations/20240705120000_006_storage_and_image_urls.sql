-- Columnas image_url, buckets de Storage y políticas RLS

alter table public.lost_pets add column if not exists image_url text;
alter table public.found_pets add column if not exists image_url text;
alter table public.campaigns add column if not exists image_url text;
alter table public.profiles add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
values
  ('pet-images', 'pet-images', true),
  ('campaign-images', 'campaign-images', true),
  ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

-- Lectura pública de imágenes
create policy "Public read pet images"
  on storage.objects for select
  to public
  using (bucket_id = 'pet-images');

create policy "Public read campaign images"
  on storage.objects for select
  to public
  using (bucket_id = 'campaign-images');

create policy "Public read avatars"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

-- Subida: mascotas (lost/{userId}/... o found/{userId}/...)
create policy "Authenticated users upload pet images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'pet-images'
    and auth.uid()::text = (storage.foldername(name))[2]
  );

create policy "Users delete own pet images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'pet-images'
    and auth.uid()::text = (storage.foldername(name))[2]
  );

-- Subida: campañas (solo fundaciones, path campaigns/{userId}/...)
create policy "Foundations upload campaign images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'campaign-images'
    and public.current_user_type() = 'foundation'
    and auth.uid()::text = (storage.foldername(name))[2]
  );

create policy "Foundations delete own campaign images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'campaign-images'
    and public.current_user_type() = 'foundation'
    and auth.uid()::text = (storage.foldername(name))[2]
  );

-- Avatares: path {userId}/...
create policy "Users upload own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users update own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users delete own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
