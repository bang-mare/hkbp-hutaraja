import { useEffect } from 'react';
import { navigate, usePathname } from './lib/router';
import { getSupabaseClient, isSupabaseConfigured } from './lib/supabase';
import { RESERVED_USERNAMES } from './lib/theme';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { EditorPage } from './pages/EditorPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PublicProfilePage } from './pages/PublicProfilePage';

export default function App() {
  const pathname = usePathname();
  const cleanPath = pathname.replace(/\/+$/, '') || '/';

  // Redirect pengguna yang sudah login dari /login ke /app, atau / ke /app atau /login
  useEffect(() => {
    if (cleanPath !== '/' && cleanPath !== '/login') return;
    if (!isSupabaseConfigured) {
      if (cleanPath === '/') navigate('/login', true);
      return;
    }
    const supabase = getSupabaseClient();
    if (!supabase) {
      if (cleanPath === '/') navigate('/login', true);
      return;
    }

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session?.user) {
        navigate('/app', true);
      } else if (cleanPath === '/') {
        navigate('/login', true);
      }
    });
    return () => {
      active = false;
    };
  }, [cleanPath]);

  if (cleanPath === '/login' || cleanPath === '/') {
    return <LoginPage />;
  }

  if (cleanPath === '/auth/callback') {
    return <AuthCallbackPage />;
  }

  if (cleanPath === '/app') {
    return <EditorPage />;
  }

  const segments = cleanPath.slice(1).split('/');
  if (segments.length === 1 && segments[0]) {
    const candidate = segments[0].toLowerCase();
    if (
      /^[a-z0-9._-]{3,30}$/.test(candidate) &&
      !RESERVED_USERNAMES.has(candidate)
    ) {
      return <PublicProfilePage username={candidate} />;
    }
  }

  return <NotFoundPage />;
}
