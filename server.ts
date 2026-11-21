import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BOT_REGEX = /(bot|crawler|spider|preview|facebookexternalhit|whatsapp|slurp|mediapartners)/i;
const MOBILE_REGEX = /(mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini)/i;

function isSafeRedirectUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed);
}

function getServerSupabase() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    '';
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    '';
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');

  // Rute pencatatan klik & redirect 302: /r/:id
  app.get('/r/:id', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const linkId = req.params.id;
    if (!UUID_REGEX.test(linkId)) {
      return res.redirect(302, '/');
    }

    const supabase = getServerSupabase();
    if (!supabase) {
      return res.redirect(302, '/');
    }

    try {
      const ua = req.get('user-agent') || '';
      const isBot = BOT_REGEX.test(ua);

      if (isBot) {
        const { data } = await supabase
          .from('links')
          .select('url, is_active, profiles!inner(is_published)')
          .eq('id', linkId)
          .eq('is_active', true)
          .eq('profiles.is_published', true)
          .maybeSingle();

        const target = data?.url;
        if (isSafeRedirectUrl(target)) {
          return res.redirect(302, target.trim());
        }
        return res.redirect(302, '/');
      }

      const device = MOBILE_REGEX.test(ua) ? 'mobile' : 'desktop';
      const referrer = req.get('referer') || null;
      const country =
        req.get('x-vercel-ip-country') ||
        req.get('cf-ipcountry') ||
        null;

      const { data: targetUrl, error } = await supabase.rpc('record_click', {
        p_link_id: linkId,
        p_referrer: referrer,
        p_device: device,
        p_country: country,
      });

      if (!error && isSafeRedirectUrl(targetUrl)) {
        return res.redirect(302, targetUrl.trim());
      }
      return res.redirect(302, '/');
    } catch {
      return res.redirect(302, '/');
    }
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (_req, res) => {
      const indexHtml = path.join(distPath, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build belum tersedia.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MARE-ID berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer();
