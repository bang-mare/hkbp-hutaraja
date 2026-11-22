-- Tambahkan kolom deskripsi singkat pada tabel links
alter table public.links
  add column if not exists description text not null default '';

alter table public.links
  drop constraint if exists links_description_check;

alter table public.links
  add constraint links_description_check check (char_length(description) <= 120);
