-- Row Level Security por tipo de usuario

create or replace function public.current_user_type()
returns public.user_type
language sql
stable
security definer
set search_path = public
as $$
  select user_type from public.profiles where id = auth.uid();
$$;

-- profiles
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- lost_pets
alter table public.lost_pets enable row level security;

create policy "Lost pets are publicly readable"
  on public.lost_pets for select
  using (true);

create policy "Authenticated users can report lost pets"
  on public.lost_pets for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "Reporters can update own lost pet reports"
  on public.lost_pets for update
  to authenticated
  using (reported_by = auth.uid());

-- found_pets
alter table public.found_pets enable row level security;

create policy "Found pets are publicly readable"
  on public.found_pets for select
  using (true);

create policy "Authenticated users can report found pets"
  on public.found_pets for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "Reporters can update own found pet reports"
  on public.found_pets for update
  to authenticated
  using (reported_by = auth.uid());

-- campaigns
alter table public.campaigns enable row level security;

create policy "Campaigns are publicly readable"
  on public.campaigns for select
  using (true);

create policy "Foundations can create campaigns"
  on public.campaigns for insert
  to authenticated
  with check (public.current_user_type() = 'foundation');

create policy "Foundations can update own campaigns"
  on public.campaigns for update
  to authenticated
  using (
    public.current_user_type() = 'foundation'
    and creator_id = auth.uid()
  );

-- food_prices
alter table public.food_prices enable row level security;

create policy "Food prices are publicly readable"
  on public.food_prices for select
  using (true);

-- vets
alter table public.vets enable row level security;

create policy "Vets are publicly readable"
  on public.vets for select
  using (true);

create policy "Vet users can create their clinic listing"
  on public.vets for insert
  to authenticated
  with check (
    public.current_user_type() = 'vet'
    and owner_id = auth.uid()
  );

create policy "Vet users can update own clinic listing"
  on public.vets for update
  to authenticated
  using (
    public.current_user_type() = 'vet'
    and owner_id = auth.uid()
  );
