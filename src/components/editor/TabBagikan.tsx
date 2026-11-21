import React from 'react';
import { copyToClipboard } from '../../lib/clipboard';
import { generateStaticPublicHtml } from '../../lib/exportHtml';
import { UiIcon } from '../../lib/icons';
import { getSiteUrl } from '../../lib/supabase';
import type { EditorState } from '../../lib/types';

interface TabBagikanProps {
  state: EditorState;
  onTogglePublished: (published: boolean) => void;
  onShowToast: (message: string) => void;
}

export const TabBagikan: React.FC<TabBagikanProps> = ({
  state,
  onTogglePublished,
  onShowToast,
}) => {
  const siteUrl = getSiteUrl();
  const publicUrl = `${siteUrl}/${state.profile.user}`;
  const localPreviewPath = `/${state.profile.user}`;

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(publicUrl);
    onShowToast(ok ? 'Tautan disalin' : 'Gagal menyalin tautan');
  };

  const handleCopyStaticHtml = async () => {
    const html = generateStaticPublicHtml(state);
    const ok = await copyToClipboard(html);
    onShowToast(ok ? 'Kode HTML disalin' : 'Gagal menyalin kode HTML');
  };

  return (
    <div>
      {/* Kartu Tautan kamu */}
      <section className="mare-card" aria-labelledby="card-tautan-title">
        <h2
          id="card-tautan-title"
          className="font-display"
          style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 800 }}
        >
          Tautan kamu
        </h2>

        <div style={{ display: 'grid', gap: 10 }}>
          <div>
            <label htmlFor="public-share-url" className="sr-only">
              Alamat halaman publik
            </label>
            <input
              id="public-share-url"
              type="text"
              readOnly
              className="mare-input"
              value={publicUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="mare-btn-primary"
              onClick={handleCopyLink}
              style={{ flex: '1 1 140px' }}
            >
              <UiIcon name="copy" size={17} />
              <span>Salin</span>
            </button>
            <a
              href={localPreviewPath}
              target="_blank"
              rel="noopener noreferrer"
              className="mare-btn-ghost"
              style={{ flex: '1 1 140px' }}
            >
              <UiIcon name="external" size={17} />
              <span>Buka halaman</span>
            </a>
          </div>
        </div>

        <ol
          style={{
            margin: '16px 0 0',
            paddingLeft: 18,
            fontSize: 13.5,
            lineHeight: 1.7,
            color: 'var(--mu)',
          }}
        >
          <li>Salin tautan.</li>
          <li>Tempel di kolom Link pada Edit profil Instagram dan TikTok.</li>
          <li>Bagikan ke WhatsApp atau Story.</li>
        </ol>
      </section>

      {/* Kartu Pengaturan halaman */}
      <section className="mare-card" aria-labelledby="card-pengaturan-title">
        <h2
          id="card-pengaturan-title"
          className="font-display"
          style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 800 }}
        >
          Pengaturan halaman
        </h2>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <label
              htmlFor="toggle-published"
              style={{ fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'block' }}
            >
              Halaman dipublikasikan
            </label>
            <span style={{ fontSize: 12.5, color: 'var(--mu)' }}>
              {state.is_published
                ? 'Pengunjung dapat membuka halaman publik kamu.'
                : 'Halaman menampilkan "Halaman ini belum tersedia" (404).'}
            </span>
          </div>

          <span className="mare-toggle">
            <input
              id="toggle-published"
              type="checkbox"
              checked={state.is_published}
              onChange={(e) => onTogglePublished(e.target.checked)}
            />
            <span className="mare-toggle-track">
              <span className="mare-toggle-thumb" />
            </span>
          </span>
        </div>
      </section>

      {/* Kartu Ekspor HTML statis */}
      <section className="mare-card" aria-labelledby="card-ekspor-title">
        <h2
          id="card-ekspor-title"
          className="font-display"
          style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800 }}
        >
          Ekspor HTML statis (opsional)
        </h2>
        <p style={{ margin: '0 0 14px', fontSize: 13.5, color: 'var(--mu)', lineHeight: 1.55 }}>
          Salin satu berkas HTML mandiri untuk di-hosting di mana saja. Catatan: versi statis tidak mencatat klik.
        </p>
        <button
          type="button"
          className="mare-btn-ghost"
          onClick={handleCopyStaticHtml}
        >
          <UiIcon name="copy" size={17} />
          <span>Salin kode</span>
        </button>
      </section>
    </div>
  );
};
