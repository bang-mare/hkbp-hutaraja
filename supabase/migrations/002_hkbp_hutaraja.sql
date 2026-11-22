-- Migrasi lanjutan untuk database yang sudah menjalankan 001_init.sql
alter table public.profiles
  alter column footer set default '{"on":true,"text":"Dibuat dengan HKBP Hutaraja","logo":true,"url":"","style":"teks"}'::jsonb;

alter table public.profiles
  drop constraint if exists username_not_reserved;

alter table public.profiles
  add constraint username_not_reserved check (
    username not in (
      'admin','app','api','login','logout','signup','auth','r',
      'dashboard','settings','static','assets','hkbp','hkbp-hutaraja',
      'support','help','www','null','undefined'
    )
  );
