create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  name text not null default '' check (char_length(name) <= 40),
  bio text not null default '' check (char_length(bio) <= 140),
  avatar_url text,
  social jsonb not null default '{}'::jsonb,
  style jsonb not null default '{"theme":"laut","shape":"bulat","fill":"solid","font":"netral","bg":"","card":"","ac":"","tc":"","bc":""}'::jsonb,
  footer jsonb not null default '{"on":true,"text":"Dibuat dengan HKBP Hutaraja","logo":true,"url":"","style":"teks"}'::jsonb,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9._-]{3,30}$'),
  constraint username_not_reserved check (username not in ('admin','app','api','login','logout','signup','auth','r','dashboard','settings','static','assets','hkbp','hkbp-hutaraja','support','help','www','null','undefined'))
);

create table public.links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 70),
  url text not null check (url ~* '^(https?://|mailto:)'),
  icon text,
  color text check (color is null or color ~ '^#[0-9a-fA-F]{6}$'),
  text_color text check (text_color is null or text_color ~ '^#[0-9a-fA-F]{6}$'),
  border_color text check (border_color is null or border_color ~ '^#[0-9a-fA-F]{6}$'),
  is_active boolean not null default true,
  position integer not null default 0,
  clicks_total bigint not null default 0,
  created_at timestamptz not null default now()
);

create index links_profile_position_idx on public.links (profile_id, position);

create table public.click_events (
  id bigint generated always as identity primary key,
  link_id uuid not null references public.links(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  clicked_at timestamptz not null default now(),
  referrer text,
  device text,
  country text
);

create index click_events_profile_time_idx on public.click_events (profile_id, clicked_at desc);
create index click_events_link_idx on public.click_events (link_id);

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

create trigger profiles_updated before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.links enable row level security;
alter table public.click_events enable row level security;

create policy profiles_read on public.profiles for select using (is_published or auth.uid() = id);
create policy profiles_insert on public.profiles for insert with check (auth.uid() = id);
create policy profiles_update on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy profiles_delete on public.profiles for delete using (auth.uid() = id);

create policy links_read on public.links for select using (
  auth.uid() = profile_id
  or (is_active and exists (select 1 from public.profiles p where p.id = profile_id and p.is_published))
);
create policy links_insert on public.links for insert with check (auth.uid() = profile_id);
create policy links_update on public.links for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy links_delete on public.links for delete using (auth.uid() = profile_id);

-- Hanya pemilik yang boleh membaca statistik. Tidak ada policy insert: klik dicatat lewat fungsi di bawah.
create policy clicks_owner_read on public.click_events for select using (auth.uid() = profile_id);

create or replace function public.record_click(p_link_id uuid, p_referrer text default null, p_device text default null, p_country text default null)
returns text language plpgsql security definer set search_path = public as $$
declare v_url text; v_profile uuid;
begin
  select l.url, l.profile_id into v_url, v_profile
  from links l join profiles p on p.id = l.profile_id
  where l.id = p_link_id and l.is_active and p.is_published;
  if v_url is null then return null; end if;
  insert into click_events (link_id, profile_id, referrer, device, country)
  values (p_link_id, v_profile, left(p_referrer, 200), left(p_device, 20), left(p_country, 2));
  update links set clicks_total = clicks_total + 1 where id = p_link_id;
  return v_url;
end $$;

revoke all on function public.record_click(uuid, text, text, text) from public;
grant execute on function public.record_click(uuid, text, text, text) to anon, authenticated;

create or replace function public.username_available(p_username text)
returns boolean language sql security definer set search_path = public stable as $$
  select not exists (select 1 from profiles where username = lower(p_username));
$$;

grant execute on function public.username_available(text) to anon, authenticated;

create or replace function public.daily_clicks(p_days integer default 30)
returns table(day date, clicks bigint) language sql security invoker stable as $$
  select d::date as day, coalesce(count(e.id), 0) as clicks
  from generate_series((current_date - (p_days - 1)), current_date, interval '1 day') d
  left join click_events e on e.profile_id = auth.uid() and e.clicked_at::date = d::date
  group by d order by d;
$$;

grant execute on function public.daily_clicks(integer) to authenticated;

-- Penyimpanan foto profil
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy avatars_read on storage.objects for select using (bucket_id = 'avatars');
create policy avatars_write on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_update on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_delete on storage.objects for delete to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
