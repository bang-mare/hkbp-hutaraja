# MARE-ID

Pembuat halaman link-in-bio untuk kreator Indonesia. Setiap kreator dapat masuk, mengatur profil dan daftar tautan di editor, memantau statistik klik nyata, serta membagikan halaman publik `mare.id/username`.

> **Catatan Arsitektur (React + Vite):** Karena lingkungan pembuatan aplikasi ini menggunakan **React + Vite + Express**, halaman publik pada rute `/:username` dirender di browser (SPA) dan pencatatan klik + redirect `/r/:id` berjalan di server Express (`server.ts`). Untuk kebutuhan SEO penuh, `generateMetadata` dinamis, dan pratinjau tautan media sosial (OpenGraph/Twitter card) di sisi server, proyek ini perlu dipindahkan ke **Next.js (App Router)**.

## Fitur Utama

- **Editor Mobile-First & Pratinjau Langsung:** 5 tab (`Link`, `Tampilan`, `Statistik`, `Bagikan`, `Pratinjau` di ponsel) dengan komponen `PublicPage` yang sama persis antara pratinjau dan halaman publik.
- **Kustomisasi Lengkap:** 12 tema siap pakai, pemilih warna kustom dengan penyesuaian kontras luminansi otomatis, 30 ikon garis SVG + deteksi ikon otomatis dari URL, bentuk tombol, jenis huruf, dan pengaturan footer.
- **Pencatatan Klik Nyata:** Rute server `GET /r/:id` memanggil RPC Supabase `record_click` (menyaring bot/crawler, mendeteksi perangkat dan negara), mencatat ke `click_events`, menaikkan `clicks_total`, lalu melakukan redirect `302`.
- **Statistik & Ekspor HTML:** Grafik klik harian (`daily_clicks`) dan ekspor halaman HTML statis mandiri.

## Variabel Lingkungan

Salin `.env.example` menjadi `.env` dan isi nilainya:

```env
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY"
NEXT_PUBLIC_SITE_URL="https://mare.id"
```

Jangan pernah menaruh atau memakai `service_role` key di kode browser maupun repositori.

## Langkah Deploy

1. **Supabase:** Buat proyek baru di Supabase, buka SQL Editor (atau gunakan Supabase CLI), lalu jalankan isi berkas `supabase/migrations/001_init.sql`. Aktifkan provider **Google** di **Authentication > Providers** (isi Client ID dan Client Secret dari Google Cloud Console), serta aktifkan login **Email** (Magic Link / OTP). Pastikan tidak ada tabel tanpa RLS melalui Security Advisor Supabase.
2. **Authentication > URL Configuration:** Isi **Site URL** dengan alamat produksi (misalnya `https://mare.id`), lalu tambahkan **Redirect URLs**:
   - `https://DOMAIN/auth/callback`
   - `http://localhost:3000/auth/callback`
   Di Google Cloud Console, tambahkan **Authorized redirect URI** dari Supabase (`https://PROJECT-REF.supabase.co/auth/v1/callback`).
3. **GitHub:** Dorong seluruh kode proyek ini ke repositori GitHub.
4. **Vercel:** Impor repositori ke Vercel, isi ketiga variabel lingkungan di atas (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`) untuk lingkungan **Production** dan **Preview**, lalu lakukan deploy. Setiap push ke branch utama akan men-deploy otomatis dan setiap pull request mendapat alamat pratinjau.
5. **Domain:** Tambahkan domain kustom (misalnya `mare.id`) di **Vercel > Domains** dan atur DNS sesuai petunjuk Vercel. Perbarui `NEXT_PUBLIC_SITE_URL` di Vercel serta **Site URL** di Supabase ke domain tersebut, lalu deploy ulang.
6. **Uji Akhir di Produksi:** Buka aplikasi, masuk menggunakan Google atau email, pilih username unik, tambahkan link, buka `https://DOMAIN/username` di jendela samaran (incognito), klik salah satu link, lalu pastikan angka klik bertambah di tab **Statistik**.

## Catatan

Paket gratis Vercel Hobby ditujukan untuk penggunaan non-komersial dan proyek Supabase gratis bisa dijeda bila lama tidak aktif, jadi periksa ketentuan terbaru sebelum dipakai untuk usaha.
