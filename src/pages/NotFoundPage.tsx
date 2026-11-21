import React from 'react';
import { WaveLogoIcon } from '../lib/icons';
import { navigate } from '../lib/router';

export const NotFoundPage: React.FC = () => {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        className="mare-card"
        style={{
          width: '100%',
          maxWidth: 420,
          textAlign: 'center',
          padding: 28,
        }}
      >
        <div
          className="mare-logo"
          style={{ margin: '0 auto 16px' }}
          aria-hidden="true"
        >
          <WaveLogoIcon size={22} />
        </div>
        <h1
          className="font-display"
          style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800 }}
        >
          Halaman ini belum tersedia
        </h1>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--mu)', lineHeight: 1.55 }}>
          Alamat yang kamu buka tidak ditemukan atau belum dipublikasikan oleh pemiliknya.
        </p>
        <button
          type="button"
          className="mare-btn-primary"
          onClick={() => navigate('/login')}
          style={{ width: '100%' }}
        >
          Buat halaman di MARE-ID
        </button>
      </div>
    </main>
  );
};
