import type {
  ButtonFill,
  ButtonShape,
  EditorState,
  FooterConfig,
  FooterStyle,
  IconId,
  LinkItem,
  PageFont,
  SocialLinks,
  StyleConfig,
  ThemeId,
} from './types';

export interface ThemePreset {
  id: ThemeId;
  name: string;
  bg: string;
  fg: string;
  card: string;
  cf: string;
  ac: string;
}

export const THEMES: ThemePreset[] = [
  {
    id: 'laut',
    name: 'Laut',
    bg: 'linear-gradient(160deg,#0B5563,#0E8F7E)',
    fg: '#FFFFFF',
    card: '#FFFFFF',
    cf: '#0B3B44',
    ac: '#FFD66B',
  },
  {
    id: 'senja',
    name: 'Senja',
    bg: 'linear-gradient(160deg,#E4583B,#B02F63)',
    fg: '#FFFFFF',
    card: '#FFF1E8',
    cf: '#5A1632',
    ac: '#FFE08A',
  },
  {
    id: 'hutan',
    name: 'Hutan',
    bg: '#1F3D2B',
    fg: '#EAF4E4',
    card: '#CFE8B8',
    cf: '#12301F',
    ac: '#CFE8B8',
  },
  {
    id: 'malam',
    name: 'Malam',
    bg: '#0E1116',
    fg: '#F2F4F8',
    card: '#1D2430',
    cf: '#F2F4F8',
    ac: '#5EEAD4',
  },
  {
    id: 'kertas',
    name: 'Kertas',
    bg: '#F2F3F0',
    fg: '#161816',
    card: '#161816',
    cf: '#F2F3F0',
    ac: '#161816',
  },
  {
    id: 'kuning',
    name: 'Kuning',
    bg: '#FFDD3C',
    fg: '#111111',
    card: '#111111',
    cf: '#FFFFFF',
    ac: '#111111',
  },
  {
    id: 'navy-emas',
    name: 'Navy Emas',
    bg: 'linear-gradient(135deg,#07182E,#0A2342)',
    fg: '#FFFFFF',
    card: '#FFFFFF',
    cf: '#07182E',
    ac: '#FFB900',
  },
  {
    id: 'navy-biru',
    name: 'Navy Biru',
    bg: 'linear-gradient(135deg,#07182E,#0A2342)',
    fg: '#FFFFFF',
    card: '#12335C',
    cf: '#FFFFFF',
    ac: '#FFB900',
  },
  {
    id: 'kartu-emas',
    name: 'Kartu Emas',
    bg: '#0A2342',
    fg: '#FFFFFF',
    card: '#FFB900',
    cf: '#07182E',
    ac: '#FFD230',
  },
  {
    id: 'emas-cerah',
    name: 'Emas Cerah',
    bg: 'linear-gradient(135deg,#FFB900,#FFD230)',
    fg: '#07182E',
    card: '#07182E',
    cf: '#FFFFFF',
    ac: '#0A2342',
  },
  {
    id: 'fajar',
    name: 'Fajar',
    bg: 'linear-gradient(160deg,#07182E,#0A2342 55%,#B07A00)',
    fg: '#FFFFFF',
    card: '#FFFFFF',
    cf: '#07182E',
    ac: '#FFB900',
  },
  {
    id: 'gading',
    name: 'Gading',
    bg: 'linear-gradient(160deg,#FFFFFF,#FFF1C2)',
    fg: '#07182E',
    card: '#07182E',
    cf: '#FFFFFF',
    ac: '#FFB900',
  },
];

export const LINK_COLOR_PRESETS: string[] = [
  '#FFFFFF',
  '#111111',
  '#FFB900',
  '#07182E',
  '#EF4444',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#14B8A6',
  '#3B82F6',
  '#6366F1',
  '#EC4899',
  '#25D366',
  '#E1306C',
];

export const BG_PRESETS: string[] = [
  '#07182E',
  '#0A2342',
  '#FFB900',
  '#FFFFFF',
  '#F2F3F0',
  '#FFDD3C',
  '#FF8A5B',
  '#F43F5E',
  '#3B82F6',
  '#0EA5A4',
  '#22C55E',
  '#1F3D2B',
  '#111827',
  '#0E1116',
  'linear-gradient(160deg,#0B5563,#0E8F7E)',
  'linear-gradient(160deg,#E4583B,#B02F63)',
  'linear-gradient(160deg,#2563EB,#7C3AED)',
  'linear-gradient(160deg,#F59E0B,#EF4444)',
  'linear-gradient(160deg,#10B981,#3B82F6)',
  'linear-gradient(160deg,#0F172A,#334155)',
  'linear-gradient(135deg,#07182E,#0A2342)',
  'linear-gradient(135deg,#FFB900,#FFD230)',
  'linear-gradient(160deg,#07182E,#0A2342 55%,#B07A00)',
];

export const CARD_PRESETS: string[] = [
  '#FFFFFF',
  '#07182E',
  '#12335C',
  '#FFB900',
  '#FFF1E8',
  '#F1F5F9',
  '#CFE8B8',
  '#FFE08A',
  '#FBCFE8',
  '#111111',
  '#1D2430',
  '#0B3B44',
];

export const ACCENT_PRESETS: string[] = [
  '#FFB900',
  '#FFD66B',
  '#5EEAD4',
  '#FF8A5B',
  '#F472B6',
  '#60A5FA',
  '#A3E635',
  '#FFFFFF',
  '#111111',
];

export const CARD_TEXT_BORDER_PRESETS: string[] = [
  '#FFFFFF',
  '#111111',
  '#07182E',
  '#FFB900',
  '#EF4444',
  '#22C55E',
  '#3B82F6',
  '#EC4899',
];

export const VALID_ICON_IDS: IconId[] = [
  'link',
  'instagram',
  'tiktok',
  'youtube',
  'whatsapp',
  'facebook',
  'x',
  'telegram',
  'mail',
  'phonec',
  'bag',
  'gift',
  'star',
  'heart',
  'fire',
  'sparkle',
  'book',
  'grad',
  'video',
  'music',
  'camera',
  'coffee',
  'brief',
  'calendar',
  'pin',
  'globe',
  'download',
  'chat',
  'code',
  'user',
];

export const RESERVED_USERNAMES = new Set([
  'admin',
  'app',
  'api',
  'login',
  'logout',
  'signup',
  'auth',
  'r',
  'dashboard',
  'settings',
  'static',
  'assets',
  'mare',
  'mare-id',
  'support',
  'help',
  'www',
  'null',
  'undefined',
]);

export const HEX6_RE = /^#[0-9a-fA-F]{6}$/;
export const SAFE_GRADIENT_RE =
  /^linear-gradient\(\s*\d{1,3}deg\s*(,\s*#[0-9a-fA-F]{6}(\s+\d{1,3}%)?\s*){2,4}\)$/;

export function isValidHex6(value: unknown): value is string {
  return typeof value === 'string' && HEX6_RE.test(value.trim());
}

export function isValidColorOrGradient(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return HEX6_RE.test(trimmed) || SAFE_GRADIENT_RE.test(trimmed);
}

export function validateHexColor(value: unknown): string {
  return isValidHex6(value) ? value.trim() : '';
}

export function validateBgColor(value: unknown): string {
  return isValidColorOrGradient(value) ? value.trim() : '';
}

export function validateIconId(value: unknown): IconId | '' {
  if (typeof value === 'string' && (VALID_ICON_IDS as string[]).includes(value)) {
    return value as IconId;
  }
  return '';
}

function hexLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Menghitung luminansi relatif rata-rata dari warna hex atau gradien.
 * Jika lebih dari 0,22 pakai #111111, selain itu #FFFFFF.
 */
export function autoContrastText(colorOrGradient: string): '#111111' | '#FFFFFF' {
  const hexes = colorOrGradient.match(/#[0-9a-fA-F]{6}/g);
  if (!hexes || hexes.length === 0) return '#FFFFFF';
  const avgLum =
    hexes.reduce((sum, h) => sum + hexLuminance(h), 0) / hexes.length;
  return avgLum > 0.22 ? '#111111' : '#FFFFFF';
}

export function getThemePreset(id: ThemeId): ThemePreset {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

export function sanitizeUsernameInput(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 30);
}

export function isValidUsername(username: string): boolean {
  return (
    /^[a-z0-9._-]{3,30}$/.test(username) &&
    !RESERVED_USERNAMES.has(username.toLowerCase())
  );
}

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return '#';
  }
  if (/^mailto:/i.test(trimmed)) {
    return trimmed;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return '#';
  }
  return `https://${trimmed}`;
}

export function sanitizeSafeHref(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '#';
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) {
    return trimmed;
  }
  return '#';
}

export function extractDomain(rawUrl: string): string {
  const normalized = normalizeUrl(rawUrl);
  if (!normalized || normalized === '#') return '';
  if (/^mailto:/i.test(normalized)) {
    return normalized.replace(/^mailto:/i, '').split('?')[0];
  }
  try {
    const parsed = new URL(normalized);
    return parsed.hostname.replace(/^www\./i, '');
  } catch {
    return '';
  }
}

export function normalizeWhatsappDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`;
  }
  return digits;
}

export function buildSocialUrl(
  network: keyof SocialLinks,
  raw: string
): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (network === 'whatsapp') {
    const digits = normalizeWhatsappDigits(value);
    return digits ? `https://wa.me/${digits}` : null;
  }
  const cleanHandle = value.replace(/^@+/, '').replace(/\s+/g, '');
  if (!cleanHandle) return null;
  if (network === 'instagram') return `https://instagram.com/${cleanHandle}`;
  if (network === 'tiktok') return `https://tiktok.com/@${cleanHandle}`;
  if (network === 'youtube') return `https://youtube.com/@${cleanHandle}`;
  return null;
}

export const DEFAULT_STYLE: StyleConfig = {
  theme: 'laut',
  shape: 'bulat',
  fill: 'solid',
  font: 'netral',
  bg: '',
  card: '',
  ac: '',
  tc: '',
  bc: '',
};

export const DEFAULT_FOOTER: FooterConfig = {
  on: true,
  text: 'Dibuat dengan MARE-ID',
  logo: true,
  url: '',
  style: 'teks',
};

export const SAMPLE_LINKS_DATA: Array<{ title: string; url: string }> = [
  {
    title: 'Template Carousel Instagram (Gratis)',
    url: 'https://example.com/carousel',
  },
  {
    title: 'Ebook Panduan Konten 30 Hari',
    url: 'https://example.com/ebook',
  },
  {
    title: 'Kelas Online Strategi Konten',
    url: 'https://example.com/kelas',
  },
  {
    title: 'Toko Produk Digital',
    url: 'https://example.com/toko',
  },
  {
    title: 'Chat untuk Kolaborasi',
    url: 'https://wa.me/628123456789',
  },
];

export function validateStyleConfig(raw: unknown): StyleConfig {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const validThemes: ThemeId[] = THEMES.map((t) => t.id);
  const validShapes: ButtonShape[] = ['bulat', 'sedang', 'kotak'];
  const validFills: ButtonFill[] = ['solid', 'garis'];
  const validFonts: PageFont[] = ['netral', 'tegas'];

  return {
    theme: validThemes.includes(obj.theme as ThemeId)
      ? (obj.theme as ThemeId)
      : 'laut',
    shape: validShapes.includes(obj.shape as ButtonShape)
      ? (obj.shape as ButtonShape)
      : 'bulat',
    fill: validFills.includes(obj.fill as ButtonFill)
      ? (obj.fill as ButtonFill)
      : 'solid',
    font: validFonts.includes(obj.font as PageFont)
      ? (obj.font as PageFont)
      : 'netral',
    bg: validateBgColor(obj.bg),
    card: validateHexColor(obj.card),
    ac: validateHexColor(obj.ac),
    tc: validateHexColor(obj.tc),
    bc: validateHexColor(obj.bc),
  };
}

export function validateFooterConfig(raw: unknown): FooterConfig {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const validStyles: FooterStyle[] = ['teks', 'pil', 'garis'];
  const rawUrl = typeof obj.url === 'string' ? obj.url.trim() : '';
  const safeUrl = rawUrl ? normalizeUrl(rawUrl) : '';

  return {
    on: typeof obj.on === 'boolean' ? obj.on : true,
    text:
      typeof obj.text === 'string'
        ? obj.text.slice(0, 60)
        : 'Dibuat dengan MARE-ID',
    logo: typeof obj.logo === 'boolean' ? obj.logo : true,
    url: safeUrl === '#' ? '' : safeUrl,
    style: validStyles.includes(obj.style as FooterStyle)
      ? (obj.style as FooterStyle)
      : 'teks',
  };
}

export function validateSocialLinks(raw: unknown): SocialLinks {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    instagram: typeof obj.instagram === 'string' ? obj.instagram.slice(0, 60) : '',
    tiktok: typeof obj.tiktok === 'string' ? obj.tiktok.slice(0, 60) : '',
    youtube: typeof obj.youtube === 'string' ? obj.youtube.slice(0, 60) : '',
    whatsapp: typeof obj.whatsapp === 'string' ? obj.whatsapp.slice(0, 30) : '',
  };
}

export function mapDbRowToLink(row: Record<string, unknown>): LinkItem {
  const rawUrl = typeof row.url === 'string' ? row.url : '';
  return {
    id: String(row.id || ''),
    title: typeof row.title === 'string' ? row.title.slice(0, 70) : '',
    url: sanitizeSafeHref(rawUrl),
    on: typeof row.is_active === 'boolean' ? row.is_active : true,
    clicks: typeof row.clicks_total === 'number' ? row.clicks_total : Number(row.clicks_total || 0),
    ic: validateIconId(row.icon),
    color: validateHexColor(row.color),
    tc: validateHexColor(row.text_color),
    bc: validateHexColor(row.border_color),
  };
}

export function createInitialEditorState(username = '', name = ''): EditorState {
  return {
    profile: {
      name: name.slice(0, 40),
      user: username,
      bio: '',
      avatar: '',
    },
    social: {
      instagram: '',
      tiktok: '',
      youtube: '',
      whatsapp: '',
    },
    links: [],
    style: { ...DEFAULT_STYLE },
    footer: { ...DEFAULT_FOOTER },
    is_published: true,
  };
}
