import type { IncomingMessage, ServerResponse } from 'http';
import { createClient } from '@supabase/supabase-js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BOT_REGEX = /(bot|crawler|spider|preview|facebookexternalhit|whatsapp|slurp|mediapartners)/i;
const MOBILE_REGEX = /(mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini)/i;

function isSafeRedirectUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed);
}

function redirect302(res: ServerResponse, location: string) {
  res.statusCode = 302;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Location', location);
  res.end();
}

function getHeader(req: IncomingMessage, name: string): string {
  const val = req.headers[name.toLowerCase()];
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
}

export default async function handler(
  req: IncomingMessage & { query?: Record<string, string | string[] | undefined> },
  res: ServerResponse
) {
  try {
    let linkId = '';
    const qId = req.query?.id;
    if (typeof qId === 'string') {
      linkId = qId;
    } else if (Array.isArray(qId) && qId[0]) {
      linkId = qId[0];
    } else if (req.url) {
      const parsed = new URL(req.url, 'http://localhost');
      linkId = parsed.searchParams.get('id') || '';
    }

    if (!UUID_REGEX.test(linkId)) {
      return redirect302(res, '/');
    }

    const supabaseUrl = (
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      ''
    ).trim();
    const supabaseKey = (
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      ''
    ).trim();

    if (!supabaseUrl || !supabaseKey) {
      return redirect302(res, '/');
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const ua = getHeader(req, 'user-agent');
    const isBot = BOT_REGEX.test(ua);

    if (isBot) {
      const { data } = await supabase
        .from('links')
        .select('url, is_active, profiles!inner(is_published)')
        .eq('id', linkId)
        .eq('is_active', true)
        .eq('profiles.is_published', true)
        .maybeSingle();

      if (isSafeRedirectUrl(data?.url)) {
        return redirect302(res, data.url.trim());
      }
      return redirect302(res, '/');
    }

    const device = MOBILE_REGEX.test(ua) ? 'mobile' : 'desktop';
    const referrer = getHeader(req, 'referer') || null;
    const country =
      getHeader(req, 'x-vercel-ip-country') ||
      getHeader(req, 'cf-ipcountry') ||
      null;

    const { data: targetUrl, error } = await supabase.rpc('record_click', {
      p_link_id: linkId,
      p_referrer: referrer,
      p_device: device,
      p_country: country,
    });

    if (!error && isSafeRedirectUrl(targetUrl)) {
      return redirect302(res, targetUrl.trim());
    }
    return redirect302(res, '/');
  } catch {
    return redirect302(res, '/');
  }
}
