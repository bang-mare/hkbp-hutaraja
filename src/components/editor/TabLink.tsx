import React, { useRef, useState } from 'react';
import { ICON_OPTIONS, LineIcon, UiIcon, detectIconFromUrl } from '../../lib/icons';
import { LINK_COLOR_PRESETS, normalizeUrl, normalizeWhatsappDigits } from '../../lib/theme';
import type { IconId, LinkItem, ProfileInfo, SocialLinks } from '../../lib/types';

interface TabLinkProps {
  profile: ProfileInfo;
  social: SocialLinks;
  links: LinkItem[];
  uploadingAvatar: boolean;
  onProfileChange: (patch: Partial<ProfileInfo>) => void;
  onUploadAvatar: (blob: Blob) => Promise<void>;
  onRemoveAvatar: () => Promise<void>;
  onSocialChange: (patch: Partial<SocialLinks>) => void;
  onAddLink: () => Promise<string | null>;
  onFillSampleLinks: () => Promise<void>;
  onUpdateLink: (id: string, patch: Partial<LinkItem>) => void;
  onDeleteLink: (id: string) => void;
  onMoveLink: (index: number, direction: -1 | 1) => void;
  onApplyColorsToAll: (color: string, tc: string, bc: string) => void;
  onShowToast: (message: string) => void;
}

type LinkPanelMode = 'icon' | 'color';

async function cropAndResizeAvatar(file: File): Promise<Blob> {
  const imageUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Gagal membaca gambar'));
      el.src = imageUrl;
    });

    const size = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - size) / 2;
    const sy = (img.naturalHeight - size) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = 192;
    canvas.height = 192;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas tidak tersedia');

    ctx.drawImage(img, sx, sy, size, size, 0, 0, 192, 192);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.82)
    );
    if (!blob) throw new Error('Gagal memproses JPEG');
    return blob;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export const TabLink: React.FC<TabLinkProps> = ({
  profile,
  social,
  links,
  uploadingAvatar,
  onProfileChange,
  onUploadAvatar,
  onRemoveAvatar,
  onSocialChange,
  onAddLink,
  onFillSampleLinks,
  onUpdateLink,
  onDeleteLink,
  onMoveLink,
  onApplyColorsToAll,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [openPanels, setOpenPanels] = useState<Record<string, LinkPanelMode | undefined>>({});

  const togglePanel = (linkId: string, mode: LinkPanelMode) => {
    setOpenPanels((prev) => ({
      ...prev,
      [linkId]: prev[linkId] === mode ? undefined : mode,
    }));
  };

  const handleAvatarSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const blob = await cropAndResizeAvatar(file);
      await onUploadAvatar(blob);
    } catch {
      onShowToast('Gagal memproses foto profil.');
    }
  };

  const handleAddAndFocus = async () => {
    const createdId = await onAddLink();
    if (createdId) {
      window.setTimeout(() => {
        titleRefs.current[createdId]?.focus();
      }, 40);
    }
  };

  const initialChar = (
    profile.name.trim()[0] ||
    profile.user.trim()[0] ||
    'M'
  ).toUpperCase();

  return (
    <div>
      {/* Kartu 1: Profil */}
      <section className="mare-card" aria-labelledby="card-profil-title">
        <h2
          id="card-profil-title"
          className="font-display"
          style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 800 }}
        >
          Profil
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              aria-label="Ubah foto profil"
              style={{
                width: 84,
                height: 84,
                borderRadius: 999,
                padding: 3,
                background: 'var(--grad)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 999,
                  overflow: 'hidden',
                  background: 'var(--sf)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 28,
                  color: 'var(--ink)',
                }}
              >
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name || profile.user}
                    referrerPolicy="no-referrer"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  initialChar
                )}
              </span>
            </button>
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: 28,
                height: 28,
                borderRadius: 999,
                background: 'var(--sf)',
                border: '1px solid var(--ln)',
                color: 'var(--ink)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.18)',
                pointerEvents: 'none',
              }}
            >
              <UiIcon name="camera" size={14} />
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarSelected}
              style={{ display: 'none' }}
              aria-label="Pilih file foto profil"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="mare-btn-ghost mare-btn-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? 'Mengunggah...' : 'Ganti foto'}
              </button>
              {profile.avatar && (
                <button
                  type="button"
                  className="mare-btn-ghost mare-btn-sm"
                  onClick={onRemoveAvatar}
                  disabled={uploadingAvatar}
                  style={{ color: 'var(--dg)' }}
                >
                  Hapus foto
                </button>
              )}
            </div>
            <span style={{ fontSize: 12, color: 'var(--mu)' }}>
              Otomatis dipotong persegi 192×192 px.
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <label
              htmlFor="profil-nama"
              style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
            >
              Nama
            </label>
            <input
              id="profil-nama"
              type="text"
              className="mare-input"
              maxLength={40}
              placeholder="Nama tampilan kamu"
              value={profile.name}
              onChange={(e) => onProfileChange({ name: e.target.value.slice(0, 40) })}
            />
          </div>

          <div>
            <label
              htmlFor="profil-username"
              style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
            >
              Username
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: 14,
                background: 'var(--sf2)',
                border: '1px solid var(--ln)',
                minHeight: 46,
                paddingLeft: 14,
                paddingRight: 14,
              }}
            >
              <span style={{ fontSize: 14, color: 'var(--mu)', fontWeight: 600, flexShrink: 0 }}>
                mare.id/
              </span>
              <input
                id="profil-username"
                type="text"
                readOnly
                maxLength={30}
                value={profile.user}
                aria-readonly="true"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--mu)',
                  fontSize: 14,
                  fontWeight: 600,
                  width: '100%',
                  outline: 'none',
                  padding: '10px 0',
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label htmlFor="profil-bio" style={{ fontSize: 13, fontWeight: 600 }}>
                Bio
              </label>
              <span className="tabular-nums" style={{ fontSize: 12, color: 'var(--mu)' }}>
                {profile.bio.length}/140
              </span>
            </div>
            <textarea
              id="profil-bio"
              className="mare-textarea"
              maxLength={140}
              placeholder="Ceritakan singkat tentang dirimu atau karyamu..."
              value={profile.bio}
              onChange={(e) => onProfileChange({ bio: e.target.value.slice(0, 140) })}
            />
          </div>
        </div>
      </section>

      {/* Kartu 2: Ikon sosial */}
      <section className="mare-card" aria-labelledby="card-sosial-title">
        <h2
          id="card-sosial-title"
          className="font-display"
          style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 800 }}
        >
          Ikon sosial
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 12,
          }}
        >
          <div>
            <label
              htmlFor="sosial-instagram"
              style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
            >
              Instagram
            </label>
            <input
              id="sosial-instagram"
              type="text"
              className="mare-input"
              placeholder="username tanpa @"
              value={social.instagram}
              onChange={(e) =>
                onSocialChange({ instagram: e.target.value.replace(/^@+/, '') })
              }
            />
          </div>

          <div>
            <label
              htmlFor="sosial-tiktok"
              style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
            >
              TikTok
            </label>
            <input
              id="sosial-tiktok"
              type="text"
              className="mare-input"
              placeholder="username tanpa @"
              value={social.tiktok}
              onChange={(e) =>
                onSocialChange({ tiktok: e.target.value.replace(/^@+/, '') })
              }
            />
          </div>

          <div>
            <label
              htmlFor="sosial-youtube"
              style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
            >
              YouTube
            </label>
            <input
              id="sosial-youtube"
              type="text"
              className="mare-input"
              placeholder="handle tanpa @"
              value={social.youtube}
              onChange={(e) =>
                onSocialChange({ youtube: e.target.value.replace(/^@+/, '') })
              }
            />
          </div>

          <div>
            <label
              htmlFor="sosial-whatsapp"
              style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
            >
              WhatsApp
            </label>
            <input
              id="sosial-whatsapp"
              type="tel"
              inputMode="numeric"
              className="mare-input"
              placeholder="08123456789"
              value={social.whatsapp}
              onChange={(e) => onSocialChange({ whatsapp: e.target.value })}
              onBlur={(e) => {
                const digits = normalizeWhatsappDigits(e.target.value);
                if (digits !== e.target.value) {
                  onSocialChange({ whatsapp: digits });
                }
              }}
            />
          </div>
        </div>
      </section>

      {/* Kartu 3: Link */}
      <section className="mare-card" aria-labelledby="card-link-title">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 14,
            flexWrap: 'wrap',
          }}
        >
          <h2
            id="card-link-title"
            className="font-display"
            style={{ margin: 0, fontSize: 18, fontWeight: 800 }}
          >
            Link
          </h2>
          <button
            type="button"
            className="mare-btn-primary mare-btn-sm"
            onClick={handleAddAndFocus}
          >
            <UiIcon name="plus" size={16} />
            <span>Tambah link</span>
          </button>
        </div>

        {links.length === 0 ? (
          <div style={{ display: 'grid', gap: 10 }}>
            <div>
              <button
                type="button"
                className="mare-btn-ghost mare-btn-sm"
                onClick={onFillSampleLinks}
              >
                Isi dengan contoh
              </button>
            </div>
            <div
              style={{
                border: '1.5px dashed var(--ln)',
                borderRadius: 20,
                padding: '26px 16px',
                textAlign: 'center',
                color: 'var(--mu)',
                fontSize: 14,
              }}
            >
              Belum ada link. Tekan Tambah link untuk mulai.
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {links.map((item, idx) => {
              const effectiveIcon: IconId = item.ic || detectIconFromUrl(item.url);
              const panelMode = openPanels[item.id];
              const hasCustomColor = Boolean(item.color || item.tc || item.bc);

              return (
                <div key={item.id} className="mare-subcard">
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <button
                      type="button"
                      aria-label={`Pilih ikon untuk ${item.title || 'link'}`}
                      aria-expanded={panelMode === 'icon'}
                      onClick={() => togglePanel(item.id, 'icon')}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 16,
                        border: 'none',
                        background: 'var(--grad)',
                        color: '#FFFFFF',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        cursor: 'pointer',
                      }}
                    >
                      <LineIcon name={effectiveIcon} size={22} />
                    </button>

                    <div style={{ flex: '1 1 auto', minWidth: 0, display: 'grid', gap: 8 }}>
                      <div>
                        <label
                          htmlFor={`link-title-${item.id}`}
                          className="sr-only"
                        >
                          Judul link
                        </label>
                        <input
                          ref={(el) => {
                            titleRefs.current[item.id] = el;
                          }}
                          id={`link-title-${item.id}`}
                          type="text"
                          className="mare-input"
                          maxLength={70}
                          placeholder="Judul link"
                          value={item.title}
                          style={{ background: 'var(--sf)' }}
                          onChange={(e) =>
                            onUpdateLink(item.id, {
                              title: e.target.value.slice(0, 70),
                            })
                          }
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`link-url-${item.id}`}
                          className="sr-only"
                        >
                          URL tujuan
                        </label>
                        <input
                          id={`link-url-${item.id}`}
                          type="url"
                          inputMode="url"
                          className="mare-input"
                          placeholder="https://contoh.com"
                          value={item.url}
                          style={{ background: 'var(--sf)' }}
                          onChange={(e) =>
                            onUpdateLink(item.id, { url: e.target.value })
                          }
                          onBlur={(e) => {
                            const normalized = normalizeUrl(e.target.value);
                            if (normalized !== e.target.value) {
                              onUpdateLink(item.id, { url: normalized });
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Baris kontrol */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      marginTop: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <span className="mare-toggle">
                          <input
                            type="checkbox"
                            checked={item.on}
                            aria-label={`Tampilkan link ${item.title || idx + 1}`}
                            onChange={(e) =>
                              onUpdateLink(item.id, { on: e.target.checked })
                            }
                          />
                          <span className="mare-toggle-track">
                            <span className="mare-toggle-thumb" />
                          </span>
                        </span>
                        <span>Tampil</span>
                      </label>

                      <button
                        type="button"
                        className="mare-btn-icon"
                        aria-label="Atur warna link"
                        aria-expanded={panelMode === 'color'}
                        onClick={() => togglePanel(item.id, 'color')}
                      >
                        <UiIcon name="palette" size={18} />
                        {hasCustomColor && (
                          <span
                            aria-hidden="true"
                            style={{
                              position: 'absolute',
                              top: 6,
                              right: 6,
                              width: 8,
                              height: 8,
                              borderRadius: 999,
                              background: item.color || item.tc || item.bc,
                              border: '1.5px solid var(--sf)',
                            }}
                          />
                        )}
                      </button>

                      <button
                        type="button"
                        className="mare-btn-icon"
                        aria-label="Pindah ke atas"
                        disabled={idx === 0}
                        onClick={() => onMoveLink(idx, -1)}
                      >
                        <UiIcon name="arrowUp" size={18} />
                      </button>

                      <button
                        type="button"
                        className="mare-btn-icon"
                        aria-label="Pindah ke bawah"
                        disabled={idx === links.length - 1}
                        onClick={() => onMoveLink(idx, 1)}
                      >
                        <UiIcon name="arrowDown" size={18} />
                      </button>

                      <button
                        type="button"
                        className="mare-btn-icon"
                        aria-label="Hapus link"
                        onClick={() => onDeleteLink(item.id)}
                        style={{ color: 'var(--dg)' }}
                      >
                        <UiIcon name="trash" size={18} />
                      </button>
                    </div>

                    <span
                      className="tabular-nums"
                      style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: 'var(--mu)',
                        padding: '5px 10px',
                        borderRadius: 999,
                        background: 'var(--sf)',
                        border: '1px solid var(--ln)',
                      }}
                    >
                      {item.clicks.toLocaleString('id-ID')} klik
                    </span>
                  </div>

                  {/* Pemilih ikon */}
                  {panelMode === 'icon' && (
                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: '1px solid var(--ln)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--mu)' }}>
                          Pilih ikon
                        </span>
                        <button
                          type="button"
                          className="mare-btn-ghost mare-btn-sm"
                          onClick={() => {
                            onUpdateLink(item.id, { ic: '' });
                            setOpenPanels((p) => ({ ...p, [item.id]: undefined }));
                          }}
                          style={{
                            borderColor: item.ic === '' ? 'var(--ac)' : 'var(--ln)',
                            background: item.ic === '' ? 'var(--acs)' : 'var(--sf)',
                            color: item.ic === '' ? 'var(--acx)' : 'var(--ink)',
                          }}
                        >
                          Otomatis
                        </button>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(42px, 1fr))',
                          gap: 8,
                        }}
                      >
                        {ICON_OPTIONS.map((opt) => {
                          const selected = item.ic === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              aria-label={opt.label}
                              aria-pressed={selected}
                              onClick={() => {
                                onUpdateLink(item.id, { ic: opt.id });
                                setOpenPanels((p) => ({ ...p, [item.id]: undefined }));
                              }}
                              className="mare-btn-icon"
                              style={{
                                width: '100%',
                                borderColor: selected ? 'var(--ac)' : 'var(--ln)',
                                background: selected ? 'var(--acs)' : 'var(--sf)',
                                color: selected ? 'var(--acx)' : 'var(--ink)',
                              }}
                            >
                              <LineIcon name={opt.id} size={18} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Panel warna link */}
                  {panelMode === 'color' && (
                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: '1px solid var(--ln)',
                        display: 'grid',
                        gap: 12,
                      }}
                    >
                      {(
                        [
                          { label: 'Kotak', field: 'color' as const, value: item.color },
                          { label: 'Teks', field: 'tc' as const, value: item.tc },
                          { label: 'Garis', field: 'bc' as const, value: item.bc },
                        ] as const
                      ).map((row) => (
                        <div key={row.field}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--mu)', marginBottom: 8 }}>
                            {row.label}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                            <button
                              type="button"
                              className="mare-swatch mare-swatch-auto"
                              aria-label={`${row.label} ikuti tema`}
                              aria-pressed={row.value === ''}
                              onClick={() => onUpdateLink(item.id, { [row.field]: '' })}
                            />
                            {LINK_COLOR_PRESETS.map((hex) => (
                              <button
                                key={hex}
                                type="button"
                                className="mare-swatch"
                                aria-label={`${row.label} ${hex}`}
                                aria-pressed={row.value.toUpperCase() === hex.toUpperCase()}
                                style={{ backgroundColor: hex }}
                                onClick={() => onUpdateLink(item.id, { [row.field]: hex })}
                              />
                            ))}
                            <label
                              className="mare-swatch mare-swatch-rainbow"
                              aria-label={`${row.label} warna bebas`}
                              aria-pressed={
                                Boolean(row.value) &&
                                !LINK_COLOR_PRESETS.some(
                                  (p) => p.toUpperCase() === row.value.toUpperCase()
                                )
                              }
                            >
                              <input
                                type="color"
                                value={row.value || '#0A8683'}
                                onChange={(e) =>
                                  onUpdateLink(item.id, {
                                    [row.field]: e.target.value.toUpperCase(),
                                  })
                                }
                              />
                            </label>
                          </div>
                        </div>
                      ))}

                      <div>
                        <button
                          type="button"
                          className="mare-btn-ghost mare-btn-sm"
                          onClick={() =>
                            onApplyColorsToAll(item.color, item.tc, item.bc)
                          }
                        >
                          Pakai warna ini di semua link
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
