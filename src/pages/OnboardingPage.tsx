import React, { useEffect, useState } from 'react';
import { WaveLogoIcon } from '../lib/icons';
import { getSiteHost, getSupabaseClient } from '../lib/supabase';
import {
  DEFAULT_FOOTER,
  DEFAULT_STYLE,
  isValidUsername,
  sanitizeUsernameInput,
} from '../lib/theme';

interface OnboardingPageProps {
  userId: string;
  initialName: string;
  onComplete: () => void;
  onSignOut: () => void;
}

type AvailabilityStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  userId,
  initialName,
  onComplete,
  onSignOut,
}) => {
  const [username, setUsername] = useState('');
  const [availability, setAvailability] = useState<AvailabilityStatus>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!username) {
      setAvailability('idle');
      return;
    }
    if (!isValidUsername(username)) {
      setAvailability('invalid');
      return;
    }

    setAvailability('checking');
    const timer = window.setTimeout(async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      const { data, error } = await supabase.rpc('username_available', {
        p_username: username,
      });
      if (error) {
        setAvailability('invalid');
      } else {
        setAvailability(data ? 'available' : 'taken');
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (availability !== 'available' || submitting) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setSubmitting(true);
    setErrorMsg('');

    const { error } = await supabase.from('profiles').insert({
      id: userId,
      username,
      name: initialName.slice(0, 40),
      bio: '',
      social: {},
      style: DEFAULT_STYLE,
      footer: DEFAULT_FOOTER,
      is_published: true,
    });

    setSubmitting(false);
    if (error) {
      if (error.code === '23505') {
        setAvailability('taken');
        setErrorMsg('Username sudah dipakai. Silakan pilih yang lain.');
      } else {
        setErrorMsg('Gagal menyimpan profil. Coba lagi.');
      }
      return;
    }

    onComplete();
  };

  const statusText =
    availability === 'checking'
      ? 'Memeriksa...'
      : availability === 'available'
      ? 'Tersedia'
      : availability === 'taken'
      ? 'Sudah dipakai'
      : availability === 'invalid'
      ? 'Tidak valid'
      : '';

  const statusColor =
    availability === 'available'
      ? '#10B981'
      : availability === 'taken' || availability === 'invalid'
      ? 'var(--dg)'
      : 'var(--mu)';

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div className="mare-card" style={{ width: '100%', maxWidth: 430, padding: 24 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div className="mare-logo" aria-hidden="true">
              <WaveLogoIcon size={22} />
            </div>
            <span className="mare-wordmark">
              HKBP <span className="mare-wordmark-accent">Hutaraja</span>
            </span>
          </div>

          <button
            type="button"
            className="mare-btn-ghost mare-btn-sm"
            onClick={onSignOut}
          >
            Keluar
          </button>
        </div>

        <h1
          className="font-display"
          style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800 }}
        >
          Pilih username kamu
        </h1>
        <p style={{ margin: '0 0 18px', fontSize: 14, color: 'var(--mu)', lineHeight: 1.55 }}>
          Alamat ini akan menjadi tautan publik halamanmu dan tidak dapat diubah setelah dibuat.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
          <div>
            <label
              htmlFor="onboarding-username"
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
                {getSiteHost()}/
              </span>
              <input
                id="onboarding-username"
                type="text"
                autoFocus
                maxLength={30}
                placeholder="namakamu"
                value={username}
                onChange={(e) => setUsername(sanitizeUsernameInput(e.target.value))}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--ink)',
                  fontSize: 14,
                  fontWeight: 600,
                  width: '100%',
                  outline: 'none',
                  padding: '10px 0',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 6,
                minHeight: 18,
                fontSize: 12.5,
              }}
            >
              <span style={{ color: 'var(--mu)' }}>
                3–30 karakter: huruf kecil, angka, . _ -
              </span>
              {statusText && (
                <span style={{ fontWeight: 700, color: statusColor }}>
                  {statusText}
                </span>
              )}
            </div>
          </div>

          {errorMsg && (
            <div
              role="alert"
              style={{
                borderRadius: 14,
                padding: '10px 12px',
                fontSize: 13,
                fontWeight: 600,
                background: 'rgba(194, 65, 12, 0.12)',
                color: 'var(--dg)',
              }}
            >
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="mare-btn-primary"
            disabled={availability !== 'available' || submitting}
            style={{ width: '100%' }}
          >
            {submitting ? 'Membuat halaman...' : 'Lanjut'}
          </button>
        </form>
      </div>
    </main>
  );
};
