import React, { useEffect, useState } from 'react';
import { PublicPage } from '../components/PublicPage';
import { getSupabaseClient } from '../lib/supabase';
import {
  mapDbRowToLink,
  validateFooterConfig,
  validateSocialLinks,
  validateStyleConfig,
} from '../lib/theme';
import type { EditorState } from '../lib/types';
import { NotFoundPage } from './NotFoundPage';

interface PublicProfilePageProps {
  username: string;
}

export const PublicProfilePage: React.FC<PublicProfilePageProps> = ({
  username,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EditorState | null>(null);

  useEffect(() => {
    let active = true;
    const loadPublic = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        if (active) {
          setData(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('id, username, name, bio, avatar_url, social, style, footer, is_published')
        .eq('username', username.toLowerCase())
        .eq('is_published', true)
        .maybeSingle();

      if (!active) return;

      if (profileErr || !profile) {
        setData(null);
        setLoading(false);
        return;
      }

      let { data: linkRows, error: linksErr } = await supabase
        .from('links')
        .select('id, title, description, url, icon, color, text_color, border_color, is_active, position, clicks_total')
        .eq('profile_id', profile.id)
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (
        linksErr &&
        (linksErr.code === '42703' ||
          linksErr.code === 'PGRST204' ||
          String(linksErr.message || '').toLowerCase().includes('description'))
      ) {
        const fallback = await supabase
          .from('links')
          .select('id, title, url, icon, color, text_color, border_color, is_active, position, clicks_total')
          .eq('profile_id', profile.id)
          .eq('is_active', true)
          .order('position', { ascending: true });
        linkRows = fallback.data as typeof linkRows;
      }

      if (!active) return;

      const state: EditorState = {
        profile: {
          name: profile.name || '',
          user: profile.username || '',
          bio: profile.bio || '',
          avatar: profile.avatar_url || '',
        },
        social: validateSocialLinks(profile.social),
        links: Array.isArray(linkRows) ? linkRows.map(mapDbRowToLink) : [],
        style: validateStyleConfig(profile.style),
        footer: validateFooterConfig(profile.footer),
        is_published: Boolean(profile.is_published),
      };

      document.title = state.profile.name.trim() || `@${state.profile.user}`;
      setData(state);
      setLoading(false);
    };

    loadPublic();
    return () => {
      active = false;
    };
  }, [username]);

  if (loading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          color: 'var(--mu)',
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        Memuat halaman...
      </main>
    );
  }

  if (!data) {
    return <NotFoundPage />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicPage data={data} isPreview={false} />
    </div>
  );
};
