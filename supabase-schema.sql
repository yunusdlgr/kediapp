-- Animals tablosu
create table animals (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text check (type in ('cat', 'dog')) not null,
  color text default '',
  description text default '',
  photo_url text,
  lat double precision not null,
  lng double precision not null,
  health_status text check (health_status in ('healthy', 'sick', 'injured', 'unknown')) default 'unknown',
  is_vaccinated boolean default false,
  is_neutered boolean default false,
  last_seen_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Logs tablosu
create table animal_logs (
  id uuid default gen_random_uuid() primary key,
  animal_id uuid references animals(id) on delete cascade,
  log_type text check (log_type in ('feeding', 'health', 'vaccination', 'sighting', 'note')) not null,
  notes text default '',
  created_by text,
  created_at timestamptz default now()
);

-- Herkese okuma izni
alter table animals enable row level security;
alter table animal_logs enable row level security;

create policy "Herkes okuyabilir" on animals for select using (true);
create policy "Herkes ekleyebilir" on animals for insert with check (true);

create policy "Herkes okuyabilir" on animal_logs for select using (true);
create policy "Herkes ekleyebilir" on animal_logs for insert with check (true);

-- Storage bucket (Supabase dashboard'dan manuel oluşturun: animal-photos, public)
