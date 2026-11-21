import React from 'react';
import { LineIcon, UiIcon, WaveLogoIcon, detectIconFromUrl } from '../lib/icons';
import {
  autoContrastText,
  buildSocialUrl,
  extractDomain,
  getThemePreset,
  sanitizeSafeHref,
} from '../lib/theme';
import type { EditorState, IconId, SocialLinks } from '../lib/types';

interface PublicPageProps {
  data: EditorState;
  isPreview?: boolean;
  onPreviewBlocked?: () => void;
}

const SOCIAL_KEYS: Array<{ key: keyof SocialLinks; icon: IconId; label: string }> = [
  { key: 'instagram', icon: 'instagram', label: 'Instagram' },
  { key: 'tiktok', icon: 'tiktok', label: 'TikTok' },
  { key: 'youtube', icon: 'youtube', label: 'YouTube' },
  { key: 'whatsapp', icon: 'whatsapp', label: 'WhatsApp' },
];

export const PublicPage: React.FC<PublicPageProps> = ({
  data,
  isPreview = false,
  onPreviewBlocked,
}) => {
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

  const rootStyle: React.CSSProperties & Record<string, string | undefined> = {
    '--pbg': pbg,
    '--pfg': pfg,
    '--pcard': pcard,
    '--pcf': pcf,
    '--pac': pac,
    '--pr': pr,
    '--pfont': pfont,
    '--ptx': style.tc || undefined,
    '--pbd': style.bc || undefined,
  };

  const displayName = profile.name.trim() || `@${profile.user || 'kreator'}`;
  const initialChar = (
    profile.name.trim()[0] ||
    profile.user.trim()[0] ||
    'M'
  ).toUpperCase();

  const activeSocials = SOCIAL_KEYS.map((item) => ({
    ...item,
    href: buildSocialUrl(item.key, social[item.key] || ''),
  })).filter((item): item is { key: keyof SocialLinks; icon: IconId; label: string; href: string } =>
    Boolean(item.href)
  );

  const visibleLinks = links.filter(
    (item) => item.on && item.title.trim().length > 0
  );

  const isOutline = style.fill === 'garis';

  const handleBlockedClick = (e: React.MouseEvent) => {
    if (isPreview) {
      e.preventDefault();
      onPreviewBlocked?.();
    }
  };

  const renderFooter = () => {
    const trimmedText = footer.text.trim();
    if (!footer.on || (!trimmedText && !footer.logo)) return null;

    const footerClass = `mare-pub-footer mare-pub-footer--${footer.style}`;
    const footerContent = (
      <>
        {footer.logo && <WaveLogoIcon size={16} />}
        {trimmedText && <span>{trimmedText}</span>}
      </>
    );

    const safeFooterUrl = footer.url.trim()
      ? sanitizeSafeHref(footer.url)
      : '';

    if (safeFooterUrl && safeFooterUrl !== '#') {
      return (
        <div className="mare-pub-footer-wrap">
          <a
            href={safeFooterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={footerClass}
            onClick={handleBlockedClick}
          >
            {footerContent}
          </a>
        </div>
      );
    }

    return (
      <div className="mare-pub-footer-wrap">
        <div
          className={footerClass}
          onClick={isPreview ? handleBlockedClick : undefined}
        >
          {footerContent}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`mare-pub ${!isPreview ? 'mare-pub--animated' : ''}`}
      style={rootStyle}
    >
      <div className="mare-pub-orb mare-pub-orb--tr" aria-hidden="true" />
      <div className="mare-pub-orb mare-pub-orb--bl" aria-hidden="true" />

      <div className="mare-pub-inner">
        <div className={!isPreview ? 'mare-pub-head-anim' : undefined} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div className="mare-pub-avatar">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={displayName}
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="mare-pub-initial">{initialChar}</span>
            )}
          </div>

          <h1 className="mare-pub-name">{displayName}</h1>

          {profile.user && (
            <div className="mare-pub-handle">@{profile.user}</div>
          )}

          {profile.bio.trim() && (
            <p className="mare-pub-bio">{profile.bio}</p>
          )}

          {activeSocials.length > 0 && (
            <div className="mare-pub-socials" aria-label="Tautan media sosial">
              {activeSocials.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mare-pub-social-btn"
                  aria-label={item.label}
                  onClick={handleBlockedClick}
                >
                  <LineIcon name={item.icon} size={20} />
                </a>
              ))}
            </div>
          )}
        </div>

        {visibleLinks.length > 0 ? (
          <ul className="mare-pub-links">
            {visibleLinks.map((item, idx) => {
              const iconName: IconId =
                item.ic || detectIconFromUrl(item.url);
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

              const licBg = isOutline
                ? `color-mix(in srgb, ${lfg} 16%, transparent)`
                : `color-mix(in srgb, ${lfg} 13%, transparent)`;

              const arrowBg = isOutline ? 'transparent' : lfg;
              const arrowFg = isOutline ? lfg : item.color || pcard;
              const arrowBd = isOutline ? `1.5px solid ${lfg}` : 'none';

              const linkStyle: React.CSSProperties & Record<string, string> = {
                '--lbg': lbg,
                '--lfg': lfg,
                '--lbd': lbd,
                '--lic-bg': licBg,
                '--larrow-bg': arrowBg,
                '--larrow-fg': arrowFg,
                '--larrow-bd': arrowBd,
              };

              const liStyle: React.CSSProperties & Record<string, string> = !isPreview
                ? { '--delay': `${180 + idx * 70}ms` }
                : {};

              const href = isPreview
                ? sanitizeSafeHref(item.url)
                : `/r/${item.id}`;

              return (
                <li
                  key={item.id}
                  className={!isPreview ? 'mare-pub-link-item' : undefined}
                  style={liStyle}
                >
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mare-pub-link"
                    style={linkStyle}
                    onClick={handleBlockedClick}
                  >
                    <span className="mare-pub-link-ic">
                      <LineIcon name={iconName} size={20} />
                    </span>
                    <span className="mare-pub-link-body">
                      <span className="mare-pub-link-title" style={{ display: 'block' }}>
                        {item.title}
                      </span>
                      {domain && (
                        <span className="mare-pub-link-domain" style={{ display: 'block' }}>
                          {domain}
                        </span>
                      )}
                    </span>
                    <span className="mare-pub-link-arrow" aria-hidden="true">
                      <UiIcon name="arrowTr" size={16} />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mare-pub-empty">
            Belum ada link yang ditampilkan.
          </div>
        )}

        {renderFooter()}
      </div>
    </div>
  );
};
