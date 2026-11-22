import React, { useEffect, useRef, useState } from 'react';
import { UiIcon, WaveLogoIcon } from '../lib/icons';
import type { SaveStatus } from '../lib/types';

interface HeaderProps {
  saveStatus: SaveStatus;
  hasUnsavedChanges: boolean;
  onSaveNow: () => void;
  onRetrySave: () => void;
  username: string;
  name: string;
  avatar: string;
  onViewPage: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  saveStatus,
  hasUnsavedChanges,
  onSaveNow,
  onRetrySave,
  username,
  name,
  avatar,
  onViewPage,
  onSignOut,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const initial = (name.trim()[0] || username.trim()[0] || 'H').toUpperCase();

  return (
    <header className="mare-header">
      <div className="mare-brand">
        <div className="mare-logo" aria-hidden="true">
          <WaveLogoIcon size={22} />
        </div>
        <span className="mare-wordmark">
          HKBP <span className="mare-wordmark-accent">Hutaraja</span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {saveStatus === 'error' ? (
          <div className="mare-status-pill" role="status" aria-live="polite">
            <span
              className="mare-status-dot mare-status-dot--error"
              aria-hidden="true"
            />
            <span>Gagal menyimpan</span>
            <button
              type="button"
              onClick={onRetrySave}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--ac)',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                padding: '0 2px',
                textDecoration: 'underline',
              }}
            >
              Coba lagi
            </button>
          </div>
        ) : saveStatus === 'saving' ? (
          <div className="mare-status-pill" role="status" aria-live="polite">
            <span
              className="mare-status-dot mare-status-dot--saving"
              aria-hidden="true"
            />
            <span>Menyimpan...</span>
          </div>
        ) : hasUnsavedChanges ? (
          <button
            type="button"
            className="mare-btn-primary mare-btn-sm"
            onClick={onSaveNow}
            aria-label="Simpan perubahan"
          >
            <UiIcon name="check" size={16} />
            <span>Simpan</span>
          </button>
        ) : (
          <div className="mare-status-pill" role="status" aria-live="polite">
            <span
              className="mare-status-dot mare-status-dot--saved"
              aria-hidden="true"
            />
            <span>Tersimpan</span>
          </div>
        )}

        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            aria-label="Menu akun"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((prev) => !prev)}
            style={{
              width: 42,
              height: 42,
              borderRadius: 999,
              border: '2px solid var(--ln)',
              background: 'var(--sf)',
              padding: 0,
              overflow: 'hidden',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--ink)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            {avatar ? (
              <img
                src={avatar}
                alt={name || username}
                referrerPolicy="no-referrer"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span>{initial}</span>
            )}
          </button>

          {menuOpen && (
            <div
              role="menu"
              style={{
                position: 'absolute',
                right: 0,
                top: 48,
                minWidth: 185,
                background: 'var(--sf)',
                border: '1px solid var(--ln)',
                borderRadius: 18,
                padding: 6,
                boxShadow: 'var(--shadow-bar)',
                zIndex: 50,
              }}
            >
              <div
                style={{
                  padding: '8px 10px 6px',
                  fontSize: 12,
                  color: 'var(--mu)',
                  fontWeight: 600,
                  borderBottom: '1px solid var(--ln)',
                  marginBottom: 4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                @{username}
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onViewPage();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  padding: '10px 10px',
                  border: 'none',
                  borderRadius: 12,
                  background: 'transparent',
                  color: 'var(--ink)',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <UiIcon name="external" size={16} />
                <span>Lihat halaman</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onSignOut();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  padding: '10px 10px',
                  border: 'none',
                  borderRadius: 12,
                  background: 'transparent',
                  color: 'var(--dg)',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <UiIcon name="logout" size={16} />
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
