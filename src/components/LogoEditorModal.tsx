import React, { useEffect, useRef } from 'react';
import { ICON_OPTIONS, LineIcon, UiIcon, WaveLogoIcon } from '../lib/icons';
import { validateBrandLogo, validateIconId } from '../lib/theme';
import type { IconId } from '../lib/types';
import { BrandLogo, processBrandLogoFile } from './BrandLogo';

interface LogoEditorModalProps {
  open: boolean;
  brandLogo: string;
  uploading: boolean;
  onClose: () => void;
  onUploadLogo: (blob: Blob) => Promise<void>;
  onSelectIcon: (icon: IconId | '') => void;
  onRemoveLogo: () => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const LogoEditorModal: React.FC<LogoEditorModalProps> = ({
  open,
  brandLogo,
  uploading,
  onClose,
  onUploadLogo,
  onSelectIcon,
  onRemoveLogo,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const cleanLogo = validateBrandLogo(brandLogo);
  const selectedIcon = cleanLogo.startsWith('icon:')
    ? validateIconId(cleanLogo.slice(5))
    : '';
  const hasCustomImage = /^https?:\/\//i.test(cleanLogo);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const blob = await processBrandLogoFile(file);
      await onUploadLogo(blob);
    } catch {
      onShowToast('Gagal memproses gambar logo.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logo-modal-title"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(11, 26, 29, 0.52)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        className="mare-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 460,
          maxHeight: '88vh',
          overflowY: 'auto',
          padding: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <h2
            id="logo-modal-title"
            className="font-display"
            style={{ margin: 0, fontSize: 18, fontWeight: 800 }}
          >
            Ubah Logo Aplikasi
          </h2>
          <button
            type="button"
            className="mare-btn-icon"
            aria-label="Tutup"
            onClick={onClose}
          >
            <UiIcon name="close" size={18} />
          </button>
        </div>

        {/* Pratinjau & Unggah gambar */}
        <div
          className="mare-subcard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, flex: '1 1 auto' }}>
            <BrandLogo logo={cleanLogo} size={24} style={{ width: 52, height: 52, borderRadius: 16 }} />
            <div>
              <div className="mare-wordmark" style={{ fontSize: 18 }}>
                HKBP <span className="mare-wordmark-accent">Hutaraja</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--mu)', marginTop: 4 }}>
                {hasCustomImage
                  ? 'Menggunakan gambar logo khusus'
                  : selectedIcon
                  ? 'Menggunakan ikon pilihan'
                  : 'Logo gelombang bawaan'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="mare-btn-primary mare-btn-sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <UiIcon name="camera" size={15} />
              <span>{uploading ? 'Mengunggah...' : 'Unggah gambar'}</span>
            </button>
            {cleanLogo && (
              <button
                type="button"
                className="mare-btn-ghost mare-btn-sm"
                disabled={uploading}
                onClick={onRemoveLogo}
                style={{ color: 'var(--dg)' }}
              >
                Reset bawaan
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            aria-label="Pilih file logo"
          />
        </div>

        {/* Pilihan ikon bawaan */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
              gap: 8,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              Atau pilih ikon logo
            </span>
            <button
              type="button"
              className="mare-btn-ghost mare-btn-sm"
              onClick={() => onSelectIcon('')}
              style={{
                borderColor: cleanLogo === '' ? 'var(--ac)' : 'var(--ln)',
                background: cleanLogo === '' ? 'var(--acs)' : 'var(--sf)',
                color: cleanLogo === '' ? 'var(--acx)' : 'var(--ink)',
              }}
            >
              <WaveLogoIcon size={15} />
              <span>Gelombang</span>
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
              const active = selectedIcon === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  title={opt.label}
                  aria-label={opt.label}
                  aria-pressed={active}
                  className="mare-btn-icon"
                  onClick={() => onSelectIcon(opt.id)}
                  style={{
                    width: '100%',
                    borderColor: active ? 'var(--ac)' : 'var(--ln)',
                    background: active ? 'var(--acs)' : 'var(--sf)',
                    color: active ? 'var(--acx)' : 'var(--ink)',
                  }}
                >
                  <LineIcon name={opt.id} size={18} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
