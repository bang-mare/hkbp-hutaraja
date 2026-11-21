import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LineIcon, UiIcon, WaveLogoIcon, detectIconFromUrl } from './icons';
import {
  autoContrastText,
  buildSocialUrl,
  extractDomain,
  getThemePreset,
  sanitizeSafeHref,
} from './theme';
import type { EditorState, IconId, SocialLinks } from './types';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const SOCIAL_KEYS: Array<{ key: keyof SocialLinks; icon: IconId; label: string }> = [
  { key: 'instagram', icon: 'instagram', label: 'Instagram' },
  { key: 'tiktok', icon: 'tiktok', label: 'TikTok' },
  { key: 'youtube', icon: 'youtube', label: 'YouTube' },
  { key: 'whatsapp', icon: 'whatsapp', label: 'WhatsApp' },
];

export function generateStaticPublicHtml(data: EditorState): string {
  const { profile, social, links, style, footer } = data;
  const preset = getThemePreset(style.theme);

  const pbg = style.bg || preset.bg;
  const pfg = style.bg ? autoContrastText(style.bg) : preset.fg;
  const pcard = style.card || preset.card;
  const pcf = style.card ? autoContrastText(style.card) : preset.cf;
  const pac = style.ac || preset.ac;
  const pr =
    style.shape === 'bulat'
      ? '999px'
      : style.shape === 'sedang'
      ? '16px'
      : '3px';
  const pfont =
    style.font === 'tegas'
      ? "'Bricolage Grotesque', system-ui, sans-serif"
      : "'Inter', system-ui, sans-serif";

  const displayName = profile.name.trim() || `@${profile.user || 'kreator'}`;
  const initialChar = (
    profile.name.trim()[0] ||
    profile.user.trim()[0] ||
    'M'
  ).toUpperCase();

  const isOutline = style.fill === 'garis';

  const activeSocials = SOCIAL_KEYS.map((item) => ({
    ...item,
    href: buildSocialUrl(item.key, social[item.key] || ''),
  })).filter((item): item is { key: keyof SocialLinks; icon: IconId; label: string; href: string } =>
    Boolean(item.href)
  );

  const visibleLinks = links.filter(
    (item) => item.on && item.title.trim().length > 0
  );

  const avatarMarkup = profile.avatar
    ? `<img src="${escapeHtml(sanitizeSafeHref(profile.avatar))}" alt="${escapeHtml(displayName)}" referrerpolicy="no-referrer" />`
    : `<span class="mare-pub-initial">${escapeHtml(initialChar)}</span>`;

  const socialMarkup =
    activeSocials.length > 0
      ? `<div class="mare-pub-socials" aria-label="Tautan media sosial">${activeSocials
          .map(
            (item) =>
              `<a href="${escapeHtml(sanitizeSafeHref(item.href))}" target="_blank" rel="noopener noreferrer" class="mare-pub-social-btn" aria-label="${escapeHtml(item.label)}">${renderToStaticMarkup(React.createElement(LineIcon, { name: item.icon, size: 20 }))}</a>`
          )
          .join('')}</div>`
      : '';

  const linksMarkup =
    visibleLinks.length > 0
      ? `<ul class="mare-pub-links">${visibleLinks
          .map((item, idx) => {
            const iconName: IconId = item.ic || detectIconFromUrl(item.url);
            const domain = extractDomain(item.url);

            const lbg = item.color
              ? item.color
              : isOutline
              ? `color-mix(in srgb, ${pfg} 8%, transparent)`
              : pcard;

            const lfg = item.tc
              ? item.tc
              : style.tc
              ? style.tc
              : item.color
              ? autoContrastText(item.color)
              : isOutline
              ? pfg
              : pcf;

            const lbd = item.bc
              ? item.bc
              : style.bc
              ? style.bc
              : isOutline
              ? `color-mix(in srgb, ${pfg} 70%, transparent)`
              : 'transparent';

            const licBg = `color-mix(in srgb, ${lfg} ${isOutline ? '16%' : '13%'}, transparent)`;
            const arrowBg = isOutline ? 'transparent' : lfg;
            const arrowFg = isOutline ? lfg : item.color || pcard;
            const arrowBd = isOutline ? `1.5px solid ${lfg}` : 'none';

            const href = sanitizeSafeHref(item.url);
            const iconSvg = renderToStaticMarkup(React.createElement(LineIcon, { name: iconName, size: 20 }));
            const arrowSvg = renderToStaticMarkup(React.createElement(UiIcon, { name: 'arrowTr', size: 16 }));

            return `<li class="mare-pub-link-item" style="--delay:${180 + idx * 70}ms"><a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="mare-pub-link" style="--lbg:${escapeHtml(lbg)};--lfg:${escapeHtml(lfg)};--lbd:${escapeHtml(lbd)};--lic-bg:${escapeHtml(licBg)};--larrow-bg:${escapeHtml(arrowBg)};--larrow-fg:${escapeHtml(arrowFg)};--larrow-bd:${escapeHtml(arrowBd)}"><span class="mare-pub-link-ic">${iconSvg}</span><span class="mare-pub-link-body"><span class="mare-pub-link-title">${escapeHtml(item.title)}</span>${
              domain
                ? `<span class="mare-pub-link-domain">${escapeHtml(domain)}</span>`
                : ''
            }</span><span class="mare-pub-link-arrow" aria-hidden="true">${arrowSvg}</span></a></li>`;
          })
          .join('')}</ul>`
      : `<div class="mare-pub-empty">Belum ada link yang ditampilkan.</div>`;

  const trimmedFooter = footer.text.trim();
  let footerMarkup = '';
  if (footer.on && (trimmedFooter || footer.logo)) {
    const waveSvg = footer.logo
      ? renderToStaticMarkup(React.createElement(WaveLogoIcon, { size: 16 }))
      : '';
    const inner = `${waveSvg}${trimmedFooter ? `<span>${escapeHtml(trimmedFooter)}</span>` : ''}`;
    const cls = `mare-pub-footer mare-pub-footer--${escapeHtml(footer.style)}`;
    const safeUrl = footer.url.trim() ? sanitizeSafeHref(footer.url) : '';
    footerMarkup =
      safeUrl && safeUrl !== '#'
        ? `<div class="mare-pub-footer-wrap"><a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" class="${cls}">${inner}</a></div>`
        : `<div class="mare-pub-footer-wrap"><div class="${cls}">${inner}</div></div>`;
  }

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(displayName)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    html,body{height:100%} body{margin:0}
    *,*::before,*::after{box-sizing:border-box}
    .mare-pub{position:relative;min-height:100%;width:100%;background:var(--pbg);color:var(--pfg);font-family:var(--pfont,'Inter',system-ui,sans-serif);padding:50px 20px 26px;display:flex;flex-direction:column;align-items:center;text-align:center;overflow-x:hidden}
    .mare-pub-orb{position:absolute;border-radius:999px;background:var(--pac);filter:blur(64px);pointer-events:none;z-index:0}
    .mare-pub-orb--tr{width:260px;height:260px;top:-70px;right:-70px;opacity:.3}
    .mare-pub-orb--bl{width:230px;height:230px;bottom:-60px;left:-60px;opacity:.2}
    .mare-pub-inner{position:relative;z-index:1;width:100%;max-width:440px;min-height:100%;flex:1 1 auto;display:flex;flex-direction:column;align-items:center}
    .mare-pub-avatar{width:96px;height:96px;border-radius:999px;border:3px solid var(--pac);box-shadow:0 0 0 7px color-mix(in srgb,var(--pac) 26%,transparent),0 14px 28px -12px rgba(0,0,0,.45);overflow:hidden;display:flex;align-items:center;justify-content:center;background:var(--pcard);color:var(--pcf);margin-bottom:16px;flex-shrink:0}
    .mare-pub-avatar img{width:100%;height:100%;object-fit:cover;display:block}
    .mare-pub-initial{font-family:'Bricolage Grotesque',system-ui,sans-serif;font-size:38px;font-weight:800;line-height:1}
    .mare-pub-name{margin:0;font-family:'Bricolage Grotesque',system-ui,sans-serif;font-size:25px;font-weight:800;line-height:1.2;letter-spacing:-0.02em;word-break:break-word}
    .mare-pub-handle{margin-top:8px;display:inline-flex;align-items:center;padding:4px 12px;border-radius:999px;font-size:13px;font-weight:600;background:color-mix(in srgb,var(--pfg) 14%,transparent);border:1px solid color-mix(in srgb,var(--pfg) 22%,transparent);color:var(--pfg);max-width:100%;word-break:break-word}
    .mare-pub-bio{margin:12px 0 0;font-size:14px;line-height:1.55;max-width:34ch;opacity:.92;word-break:break-word;white-space:pre-line}
    .mare-pub-socials{margin-top:18px;display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
    .mare-pub-social-btn{width:44px;height:44px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--pfg) 14%,transparent);border:1px solid color-mix(in srgb,var(--pfg) 26%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:var(--pfg);text-decoration:none;transition:transform 160ms ease,background-color 160ms ease,color 160ms ease,border-color 160ms ease}
    .mare-pub-social-btn:hover{transform:translateY(-2px) scale(1.06);background:var(--pcard);color:var(--pcf);border-color:transparent}
    .mare-pub-links{list-style:none;margin:24px 0 28px;padding:0;width:100%;display:flex;flex-direction:column;gap:12px}
    .mare-pub-link{min-height:64px;display:flex;align-items:center;gap:12px;padding:10px 12px 10px 10px;border-radius:var(--pr);background:var(--lbg,var(--pcard));color:var(--lfg,var(--ptx,var(--pcf)));border:2px solid var(--lbd,var(--pbd,transparent));box-shadow:0 14px 26px -14px rgba(0,0,0,.55);text-decoration:none;text-align:left;transition:transform 170ms cubic-bezier(.16,1,.3,1),box-shadow 170ms ease}
    .mare-pub-link:hover{transform:translateY(-3px);box-shadow:0 20px 34px -14px rgba(0,0,0,.65)}
    .mare-pub-link:active{transform:scale(.98)}
    .mare-pub-link-ic{width:44px;height:44px;flex-shrink:0;border-radius:calc(var(--pr) * 0.5);background:var(--lic-bg);display:inline-flex;align-items:center;justify-content:center}
    .mare-pub-link-body{flex:1 1 auto;min-width:0}
    .mare-pub-link-title{display:block;font-size:15px;font-weight:700;line-height:1.3;word-break:break-word}
    .mare-pub-link-domain{display:block;margin-top:2px;font-size:12px;opacity:.62;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .mare-pub-link-arrow{width:32px;height:32px;border-radius:999px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;background:var(--larrow-bg);color:var(--larrow-fg);border:var(--larrow-bd,none);transition:transform 170ms ease}
    .mare-pub-link:hover .mare-pub-link-arrow{transform:translate(2px,-2px)}
    .mare-pub-empty{width:100%;padding:20px 16px;border-radius:18px;border:1.5px dashed color-mix(in srgb,var(--pfg) 30%,transparent);font-size:13.5px;opacity:.8;margin:24px 0 28px}
    .mare-pub-footer-wrap{margin-top:auto;padding-top:12px;display:flex;justify-content:center}
    .mare-pub-footer{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:600;color:var(--pfg);text-decoration:none}
    .mare-pub-footer--teks{opacity:.8}
    .mare-pub-footer--pil{padding:8px 16px;border-radius:999px;background:color-mix(in srgb,var(--pfg) 14%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
    .mare-pub-footer--garis{padding:8px 16px;border-radius:999px;border:1.5px solid color-mix(in srgb,var(--pfg) 35%,transparent)}
    a.mare-pub-footer:hover{text-decoration:underline}
    @keyframes mareFadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    .mare-pub--animated .mare-pub-head-anim{animation:mareFadeUp .55s cubic-bezier(.16,1,.3,1) both}
    .mare-pub--animated .mare-pub-link-item{animation:mareFadeUp .55s cubic-bezier(.16,1,.3,1) both;animation-delay:var(--delay,180ms)}
    @media (prefers-reduced-motion:reduce){.mare-pub--animated .mare-pub-head-anim,.mare-pub--animated .mare-pub-link-item{animation:none!important}}
  </style>
</head>
<body>
  <div class="mare-pub mare-pub--animated" style="--pbg:${escapeHtml(pbg)};--pfg:${escapeHtml(pfg)};--pcard:${escapeHtml(pcard)};--pcf:${escapeHtml(pcf)};--pac:${escapeHtml(pac)};--pr:${escapeHtml(pr)};--pfont:${escapeHtml(pfont)}">
    <div class="mare-pub-orb mare-pub-orb--tr" aria-hidden="true"></div>
    <div class="mare-pub-orb mare-pub-orb--bl" aria-hidden="true"></div>
    <div class="mare-pub-inner">
      <div class="mare-pub-head-anim" style="display:flex;flex-direction:column;align-items:center;width:100%">
        <div class="mare-pub-avatar">${avatarMarkup}</div>
        <h1 class="mare-pub-name">${escapeHtml(displayName)}</h1>
        ${profile.user ? `<div class="mare-pub-handle">@${escapeHtml(profile.user)}</div>` : ''}
        ${profile.bio.trim() ? `<p class="mare-pub-bio">${escapeHtml(profile.bio)}</p>` : ''}
        ${socialMarkup}
      </div>
      ${linksMarkup}
      ${footerMarkup}
    </div>
  </div>
</body>
</html>`;
}
