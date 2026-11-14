-- Database schema for StudySpot.
-- Run this in the Supabase SQL editor to set up a new project.

create table if not exists public.study_spots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  building text,
  address text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

-- Every rating is 1 to 5, where 5 is best for studying:
-- quiet, fast WiFi, plenty of outlets, plenty of free seats.
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  study_spot_id uuid not null references public.study_spots (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  noise_rating smallint not null check (noise_rating between 1 and 5),
  wifi_rating smallint not null check (wifi_rating between 1 and 5),
  outlet_rating smallint not null check (outlet_rating between 1 and 5),
  crowd_rating smallint not null check (crowd_rating between 1 and 5),
  comment text check (char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  -- One review per person per spot. Rows with a null user_id are not affected.
  unique (study_spot_id, user_id)
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  study_spot_id uuid not null references public.study_spots (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  image_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists reviews_study_spot_id_idx on public.reviews (study_spot_id);
create index if not exists photos_study_spot_id_idx on public.photos (study_spot_id);

-- Row level security: anyone can read, signed-in users manage their own rows.

alter table public.study_spots enable row level security;
alter table public.reviews enable row level security;
alter table public.photos enable row level security;

create policy "Study spots are public"
  on public.study_spots for select
  using (true);

create policy "Reviews are public"
  on public.reviews for select
  using (true);

create policy "Users can add their own reviews"
  on public.reviews for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can edit their own reviews"
  on public.reviews for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own reviews"
  on public.reviews for delete to authenticated
  using (auth.uid() = user_id);

create policy "Photos are public"
  on public.photos for select
  using (true);

create policy "Users can add their own photos"
  on public.photos for insert to authenticated
  with check (auth.uid() = user_id);

-- Storage: a public bucket for photos. Uploads go to <spot id>/<user id>/<file>.

insert into storage.buckets (id, name, public)
values ('study-spot-photos', 'study-spot-photos', true)
on conflict (id) do nothing;

create policy "Users can upload photos to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'study-spot-photos'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "Users can remove their own photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'study-spot-photos'
    and (storage.foldername(name))[2] = auth.uid()::text
  );
