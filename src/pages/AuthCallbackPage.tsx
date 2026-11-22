import React, { useEffect, useState } from 'react';
import { WaveLogoIcon } from '../lib/icons';
import { navigate } from '../lib/router';
import { getSupabaseClient } from '../lib/supabase';

export const AuthCallbackPage: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseClient();
    if (!supabase) {
      navigate('/login', true);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('error_description') || params.get('error');
    if (oauthError) {
      setErrorMsg('Proses masuk dibatalkan atau gagal. Silakan coba lagi.');
      return;
    }

    const { data: authSub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        navigate('/app', true);
      }
    });

    const finishAuth = async () => {
      const code = params.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!active) return;
        if (error) {
          setErrorMsg('Tautan masuk tidak valid atau sudah kedaluwarsa.');
          return;
        }
        navigate('/app', true);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (data.session) {
        navigate('/app', true);
      } else {
        setErrorMsg('Sesi tidak ditemukan. Silakan coba masuk kembali.');
      }
    };

    finishAuth();

    return () => {
      active = false;
      authSub.subscription.unsubscribe();
    };
  }, []);

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
      <div className="mare-card" style={{ maxWidth: 380, width: '100%', textAlign: 'center', padding: 24 }}>
        <div className="mare-logo" style={{ margin: '0 auto 14px' }} aria-hidden="true">
          <WaveLogoIcon size={22} />
        </div>
        {errorMsg ? (
          <>
            <h1 className="font-display" style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>
              Gagal masuk
            </h1>
            <p style={{ margin: '0 0 18px', fontSize: 13.5, color: 'var(--mu)' }}>
              {errorMsg}
            </p>
            <button
              type="button"
              className="mare-btn-primary"
              style={{ width: '100%' }}
              onClick={() => navigate('/login', true)}
            >
              Kembali ke halaman masuk
            </button>
          </>
        ) : (
          <>
            <h1 className="font-display" style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800 }}>
              Memverifikasi sesi...
            </h1>
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--mu)' }}>
              Mohon tunggu sebentar, mengarahkan ke editor.
            </p>
          </>
        )}
      </div>
    </main>
  );
};
