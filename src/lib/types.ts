export type ThemeId =
  | 'laut'
  | 'senja'
  | 'hutan'
  | 'malam'
  | 'kertas'
  | 'kuning'
  | 'navy-emas'
  | 'navy-biru'
  | 'kartu-emas'
  | 'emas-cerah'
  | 'fajar'
  | 'gading';

export type ButtonShape = 'bulat' | 'sedang' | 'kotak';
export type ButtonFill = 'solid' | 'garis';
export type PageFont = 'netral' | 'tegas';
export type FooterStyle = 'teks' | 'pil' | 'garis';

export type IconId =
  | 'link'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'whatsapp'
  | 'facebook'
  | 'x'
  | 'telegram'
  | 'mail'
  | 'phonec'
  | 'bag'
  | 'gift'
  | 'star'
  | 'heart'
  | 'fire'
  | 'sparkle'
  | 'book'
  | 'grad'
  | 'video'
  | 'music'
  | 'camera'
  | 'coffee'
  | 'brief'
  | 'calendar'
  | 'pin'
  | 'globe'
  | 'download'
  | 'chat'
  | 'code'
  | 'user'
  | 'church'
  | 'cross'
  | 'users'
  | 'megaphone'
  | 'doc'
  | 'mic'
  | 'wallet'
  | 'clock'
  | 'bell'
  | 'image'
  | 'home'
  | 'info';

export interface ProfileInfo {
  name: string;
  user: string;
  bio: string;
  avatar: string;
}

export interface SocialLinks {
  instagram: string;
  tiktok: string;
  youtube: string;
  whatsapp: string;
}

export interface LinkItem {
  id: string;
  title: string;
  desc: string;
  url: string;
  on: boolean;
  clicks: number;
  ic: IconId | '';
  color: string;
  tc: string;
  bc: string;
}

export interface StyleConfig {
  theme: ThemeId;
  shape: ButtonShape;
  fill: ButtonFill;
  font: PageFont;
  bg: string;
  card: string;
  ac: string;
  tc: string;
  bc: string;
  brandLogo?: string;
}

export interface FooterConfig {
  on: boolean;
  text: string;
  logo: boolean;
  url: string;
  style: FooterStyle;
}

export interface EditorState {
  profile: ProfileInfo;
  social: SocialLinks;
  links: LinkItem[];
  style: StyleConfig;
  footer: FooterConfig;
  is_published: boolean;
}

export type SaveStatus = 'saved' | 'saving' | 'error';

export type EditorTab = 'link' | 'tampilan' | 'statistik' | 'bagikan' | 'pratinjau';

export interface DailyClick {
  day: string;
  clicks: number;
}
