import React, { useState } from 'react';
import { WaveLogoIcon } from '../lib/icons';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [sentMessage, setSentMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleLogin = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    setErrorMessage('');
    setLoadingGoogle(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setErrorMessage('Gagal memulai masuk dengan Google. Coba lagi.');
      setLoadingGoogle(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMessage('Masukkan alamat email kamu terlebih dahulu.');
      return;
    }
    setErrorMessage('');
    setSentMessage('');
    setLoadingEmail(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoadingEmail(false);
    if (error) {
      setErrorMessage('Gagal mengirim tautan masuk. Periksa email dan coba lagi.');
    } else {
      setSentMessage(
        `Tautan masuk telah dikirim ke ${trimmed}. Periksa kotak masuk atau folder spam.`
      );
    }
  };

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
      <div
        className="mare-card"
        style={{
          width: '100%',
          maxWidth: 420,
          padding: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div className="mare-logo" aria-hidden="true">
            <WaveLogoIcon size={22} />
          </div>
          <span className="mare-wordmark">
            MARE<span className="mare-wordmark-accent">-ID</span>
          </span>
        </div>

        <h1
          className="font-display"
          style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800 }}
        >
          Masuk ke MARE-ID
        </h1>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--mu)', lineHeight: 1.55 }}>
          Atur halaman link-in-bio kamu dan bagikan tautan mare.id/username ke audiensmu.
        </p>

        {!isSupabaseConfigured ? (
          <div className="mare-chip-note" style={{ lineHeight: 1.6 }}>
            <strong>Konfigurasi Supabase belum diisi.</strong>
            <br />
            Tambahkan variabel lingkungan <code>NEXT_PUBLIC_SUPABASE_URL</code>,{' '}
            <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>, dan{' '}
            <code>NEXT_PUBLIC_SITE_URL</code> sesuai berkas <code>.env.example</code> lalu muat ulang halaman.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            <button
              type="button"
              className="mare-btn-primary"
              onClick={handleGoogleLogin}
              disabled={loadingGoogle || loadingEmail}
              style={{ width: '100%' }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4l3 3" />
              </svg>
              <span>
                {loadingGoogle ? 'Mengarahkan ke Google...' : 'Masuk dengan Google'}
              </span>
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: 'var(--mu)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <span style={{ flex: 1, height: 1, background: 'var(--ln)' }} />
              <span>atau pakai email</span>
              <span style={{ flex: 1, height: 1, background: 'var(--ln)' }} />
            </div>

            <form onSubmit={handleEmailLogin} style={{ display: 'grid', gap: 10 }}>
              <div>
                <label
                  htmlFor="login-email"
                  style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
                >
                  Alamat email
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mare-input"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="mare-btn-ghost"
                disabled={loadingEmail || loadingGoogle}
                style={{ width: '100%' }}
              >
                {loadingEmail ? 'Mengirim tautan...' : 'Kirim tautan masuk'}
              </button>
            </form>

            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--mu)', lineHeight: 1.5 }}>
              Masuk tanpa kata sandi. Kami akan mengirim tautan sekali klik ke email kamu.
            </p>

            {sentMessage && (
              <div className="mare-chip-note" role="status">
                {sentMessage}
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                style={{
                  borderRadius: 16,
                  padding: '10px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  background: 'rgba(194, 65, 12, 0.12)',
                  color: 'var(--dg)',
                }}
              >
                {errorMessage}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};
