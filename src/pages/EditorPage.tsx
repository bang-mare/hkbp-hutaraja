import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Header } from '../components/Header';
import { Toast, type ToastState } from '../components/Toast';
import { PhonePreview } from '../components/editor/PhonePreview';
import { TabBagikan } from '../components/editor/TabBagikan';
import { TabLink } from '../components/editor/TabLink';
import { TabPratinjau } from '../components/editor/TabPratinjau';
import { TabStatistik } from '../components/editor/TabStatistik';
import { TabTampilan } from '../components/editor/TabTampilan';
import { UiIcon } from '../lib/icons';
import { navigate } from '../lib/router';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import {
  DEFAULT_STYLE,
  SAMPLE_LINKS_DATA,
  createInitialEditorState,
  mapDbRowToLink,
  normalizeUrl,
  validateFooterConfig,
  validateSocialLinks,
  validateStyleConfig,
} from '../lib/theme';
import type {
  EditorState,
  EditorTab,
  FooterConfig,
  LinkItem,
  ProfileInfo,
  SaveStatus,
  SocialLinks,
  StyleConfig,
  ThemeId,
} from '../lib/types';
import { OnboardingPage } from './OnboardingPage';

const LAST_TAB_KEY = 'mare_editor_tab';

function getInitialTab(): EditorTab {
  try {
    const saved = window.localStorage.getItem(LAST_TAB_KEY);
    if (
      saved === 'link' ||
      saved === 'tampilan' ||
      saved === 'statistik' ||
      saved === 'bagikan' ||
      saved === 'pratinjau'
    ) {
      return saved;
    }
  } catch {
    // Abaikan jika localStorage diblokir
  }
  return 'link';
}

function isLinkValidForDb(link: LinkItem): boolean {
  const title = link.title.trim();
  if (title.length < 1 || title.length > 70) return false;
  const normalized = normalizeUrl(link.url);
  return /^(https?:\/\/|mailto:)/i.test(normalized);
}

export const EditorPage: React.FC = () => {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [state, setState] = useState<EditorState>(() => createInitialEditorState());
  const [activeTab, setActiveTab] = useState<EditorTab>(getInitialTab);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const persistedLinkIdsRef = useRef<Set<string>>(new Set());
  const profileTimerRef = useRef<number | null>(null);
  const linkTimersRef = useRef<Record<string, number>>({});
  const stateRef = useRef<EditorState>(state);
  stateRef.current = state;

  const showToast = useCallback((message: string, onUndo?: () => void) => {
    setToast({ id: Date.now() + Math.random(), message, onUndo });
  }, []);

  const handlePreviewBlocked = useCallback(() => {
    showToast('Di pratinjau, link tidak dibuka dan tidak dihitung.');
  }, [showToast]);

  const handleTabChange = (tab: EditorTab) => {
    setActiveTab(tab);
    try {
      window.localStorage.setItem(LAST_TAB_KEY, tab);
    } catch {
      // Abaikan
    }
  };

  const loadUserAndProfile = useCallback(async (currentUser: User) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data: profileRow, error: profileErr } = await supabase
      .from('profiles')
      .select('id, username, name, bio, avatar_url, social, style, footer, is_published')
      .eq('id', currentUser.id)
      .maybeSingle();

    if (profileErr) {
      setAuthLoading(false);
      return;
    }

    if (!profileRow) {
      setHasProfile(false);
      setAuthLoading(false);
      return;
    }

    const { data: linkRows } = await supabase
      .from('links')
      .select('id, title, url, icon, color, text_color, border_color, is_active, position, clicks_total')
      .eq('profile_id', currentUser.id)
      .order('position', { ascending: true });

    const mappedLinks = Array.isArray(linkRows) ? linkRows.map(mapDbRowToLink) : [];
    persistedLinkIdsRef.current = new Set(mappedLinks.map((l) => l.id));

    setState({
      profile: {
        name: profileRow.name || '',
        user: profileRow.username || '',
        bio: profileRow.bio || '',
        avatar: profileRow.avatar_url || '',
      },
      social: validateSocialLinks(profileRow.social),
      links: mappedLinks,
      style: validateStyleConfig(profileRow.style),
      footer: validateFooterConfig(profileRow.footer),
      is_published: Boolean(profileRow.is_published),
    });
    setHasProfile(true);
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      navigate('/login', true);
      return;
    }
    const supabase = getSupabaseClient();
    if (!supabase) {
      navigate('/login', true);
      return;
    }

    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data.session?.user) {
        navigate('/login', true);
        return;
      }
      setUser(data.session.user);
      await loadUserAndProfile(data.session.user);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session?.user) {
        navigate('/login', true);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loadUserAndProfile]);

  const persistProfileNow = useCallback(
    async (snapshot: EditorState) => {
      const supabase = getSupabaseClient();
      if (!supabase || !user) return;
      setSaveStatus('saving');
      const { error } = await supabase
        .from('profiles')
        .update({
          name: snapshot.profile.name.slice(0, 40),
          bio: snapshot.profile.bio.slice(0, 140),
          avatar_url: snapshot.profile.avatar || null,
          social: snapshot.social,
          style: snapshot.style,
          footer: {
            ...snapshot.footer,
            url: snapshot.footer.url.trim()
              ? normalizeUrl(snapshot.footer.url)
              : '',
          },
          is_published: snapshot.is_published,
        })
        .eq('id', user.id);

      if (error) {
        setSaveStatus('error');
        showToast('Gagal menyimpan. Coba lagi.');
        return false;
      } else {
        setSaveStatus('saved');
        setHasUnsavedChanges(false);
        return true;
      }
    },
    [user, showToast]
  );

  const scheduleProfileSave = useCallback(
    (nextState: EditorState) => {
      setHasUnsavedChanges(true);
      if (profileTimerRef.current) {
        window.clearTimeout(profileTimerRef.current);
      }
      profileTimerRef.current = window.setTimeout(() => {
        persistProfileNow(nextState);
      }, 600);
    },
    [persistProfileNow]
  );

  const persistSingleLinkNow = useCallback(
    async (link: LinkItem, position: number) => {
      const supabase = getSupabaseClient();
      if (!supabase || !user) return;
      if (!isLinkValidForDb(link)) {
        // Jika baru ditambah dan judul/URL belum lengkap, jangan tulis ke DB dulu
        if (!persistedLinkIdsRef.current.has(link.id)) {
          setSaveStatus('saved');
        }
        return;
      }

      setSaveStatus('saving');
      const normalizedUrl = normalizeUrl(link.url);
      const payload = {
        id: link.id,
        profile_id: user.id,
        title: link.title.trim().slice(0, 70),
        url: normalizedUrl,
        icon: link.ic || null,
        color: link.color || null,
        text_color: link.tc || null,
        border_color: link.bc || null,
        is_active: link.on,
        position,
      };

      let err;
      if (persistedLinkIdsRef.current.has(link.id)) {
        const res = await supabase
          .from('links')
          .update({
            title: payload.title,
            url: payload.url,
            icon: payload.icon,
            color: payload.color,
            text_color: payload.text_color,
            border_color: payload.border_color,
            is_active: payload.is_active,
            position: payload.position,
          })
          .eq('id', link.id)
          .eq('profile_id', user.id);
        err = res.error;
      } else {
        const res = await supabase.from('links').insert(payload);
        err = res.error;
        if (!err) {
          persistedLinkIdsRef.current.add(link.id);
        }
      }

      if (err) {
        setSaveStatus('error');
        showToast('Gagal menyimpan. Coba lagi.');
        return false;
      } else {
        setSaveStatus('saved');
        setHasUnsavedChanges(false);
        return true;
      }
    },
    [user, showToast]
  );

  const scheduleLinkSave = useCallback(
    (link: LinkItem, position: number) => {
      setHasUnsavedChanges(true);
      if (linkTimersRef.current[link.id]) {
        window.clearTimeout(linkTimersRef.current[link.id]);
      }
      if (!isLinkValidForDb(link) && !persistedLinkIdsRef.current.has(link.id)) {
        return;
      }
      linkTimersRef.current[link.id] = window.setTimeout(() => {
        persistSingleLinkNow(link, position);
      }, 600);
    },
    [persistSingleLinkNow]
  );

  const handleSaveNow = async (showSuccessToast = true) => {
    if (profileTimerRef.current) {
      window.clearTimeout(profileTimerRef.current);
      profileTimerRef.current = null;
    }
    Object.values(linkTimersRef.current).forEach((t) => window.clearTimeout(t));
    linkTimersRef.current = {};

    const profileOk = await persistProfileNow(stateRef.current);
    let allLinksOk = true;
    for (let i = 0; i < stateRef.current.links.length; i++) {
      const ok = await persistSingleLinkNow(stateRef.current.links[i], i);
      if (ok === false) allLinksOk = false;
    }

    if (profileOk && allLinksOk) {
      setHasUnsavedChanges(false);
      if (showSuccessToast) {
        showToast('Perubahan disimpan');
      }
    }
  };

  const handleRetrySave = async () => {
    await handleSaveNow(true);
  };

  const handleProfileChange = (patch: Partial<ProfileInfo>) => {
    setState((prev) => {
      const next = { ...prev, profile: { ...prev.profile, ...patch } };
      scheduleProfileSave(next);
      return next;
    });
  };

  const handleSocialChange = (patch: Partial<SocialLinks>) => {
    setState((prev) => {
      const next = { ...prev, social: { ...prev.social, ...patch } };
      scheduleProfileSave(next);
      return next;
    });
  };

  const handleStyleChange = (patch: Partial<StyleConfig>) => {
    setState((prev) => {
      const next = { ...prev, style: { ...prev.style, ...patch } };
      scheduleProfileSave(next);
      return next;
    });
  };

  const handleSelectTheme = (themeId: ThemeId) => {
    handleStyleChange({
      theme: themeId,
      bg: '',
      card: '',
      ac: '',
      tc: '',
      bc: '',
    });
  };

  const handleResetColors = () => {
    handleStyleChange({
      bg: DEFAULT_STYLE.bg,
      card: DEFAULT_STYLE.card,
      ac: DEFAULT_STYLE.ac,
      tc: DEFAULT_STYLE.tc,
      bc: DEFAULT_STYLE.bc,
    });
  };

  const handleFooterChange = (patch: Partial<FooterConfig>) => {
    setState((prev) => {
      const next = { ...prev, footer: { ...prev.footer, ...patch } };
      scheduleProfileSave(next);
      return next;
    });
  };

  const handleTogglePublished = (published: boolean) => {
    setState((prev) => {
      const next = { ...prev, is_published: published };
      scheduleProfileSave(next);
      return next;
    });
  };

  const handleUploadAvatar = async (blob: Blob) => {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;
    setUploadingAvatar(true);
    const objectPath = `${user.id}/avatar.jpg`;
    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(objectPath, blob, {
        upsert: true,
        contentType: 'image/jpeg',
      });

    if (uploadErr) {
      setUploadingAvatar(false);
      showToast('Gagal mengunggah foto.');
      return;
    }

    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(objectPath);
    const versionedUrl = `${pub.publicUrl}?v=${Date.now()}`;

    setUploadingAvatar(false);
    setState((prev) => {
      const next = {
        ...prev,
        profile: { ...prev.profile, avatar: versionedUrl },
      };
      persistProfileNow(next);
      return next;
    });
  };

  const handleRemoveAvatar = async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;
    setUploadingAvatar(true);
    await supabase.storage.from('avatars').remove([`${user.id}/avatar.jpg`]);
    setUploadingAvatar(false);
    setState((prev) => {
      const next = {
        ...prev,
        profile: { ...prev.profile, avatar: '' },
      };
      persistProfileNow(next);
      return next;
    });
  };

  const handleAddLink = async (): Promise<string | null> => {
    const newId = crypto.randomUUID();
    const newItem: LinkItem = {
      id: newId,
      title: '',
      url: '',
      on: true,
      clicks: 0,
      ic: '',
      color: '',
      tc: '',
      bc: '',
    };
    setState((prev) => ({
      ...prev,
      links: [...prev.links, newItem],
    }));
    return newId;
  };

  const handleFillSampleLinks = async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;

    const samples: LinkItem[] = SAMPLE_LINKS_DATA.map((s) => ({
      id: crypto.randomUUID(),
      title: s.title,
      url: s.url,
      on: true,
      clicks: 0,
      ic: '',
      color: '',
      tc: '',
      bc: '',
    }));

    setState((prev) => ({ ...prev, links: samples }));
    setSaveStatus('saving');

    const rows = samples.map((s, idx) => ({
      id: s.id,
      profile_id: user.id,
      title: s.title,
      url: s.url,
      icon: null,
      color: null,
      text_color: null,
      border_color: null,
      is_active: true,
      position: idx,
    }));

    const { error } = await supabase.from('links').insert(rows);
    if (error) {
      setSaveStatus('error');
      showToast('Gagal menyimpan. Coba lagi.');
    } else {
      samples.forEach((s) => persistedLinkIdsRef.current.add(s.id));
      setSaveStatus('saved');
    }
  };

  const handleUpdateLink = (id: string, patch: Partial<LinkItem>) => {
    setState((prev) => {
      const idx = prev.links.findIndex((l) => l.id === id);
      if (idx === -1) return prev;
      const updated = { ...prev.links[idx], ...patch };
      const nextLinks = [...prev.links];
      nextLinks[idx] = updated;
      scheduleLinkSave(updated, idx);
      return { ...prev, links: nextLinks };
    });
  };

  const handleDeleteLink = async (id: string) => {
    const prevLinks = stateRef.current.links;
    const index = prevLinks.findIndex((l) => l.id === id);
    if (index === -1) return;
    const removed = prevLinks[index];
    const wasPersisted = persistedLinkIdsRef.current.has(id);

    setState((prev) => ({
      ...prev,
      links: prev.links.filter((l) => l.id !== id),
    }));

    const supabase = getSupabaseClient();
    if (wasPersisted && supabase && user) {
      setSaveStatus('saving');
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id);
      if (error) {
        setSaveStatus('error');
        showToast('Gagal menyimpan. Coba lagi.');
        return;
      }
      persistedLinkIdsRef.current.delete(id);
      setSaveStatus('saved');
    }

    showToast('Link dihapus', async () => {
      setState((prev) => {
        const next = [...prev.links];
        const insertAt = Math.min(index, next.length);
        next.splice(insertAt, 0, removed);
        return { ...prev, links: next };
      });

      if (wasPersisted && supabase && user && isLinkValidForDb(removed)) {
        setSaveStatus('saving');
        const { error } = await supabase.from('links').insert({
          id: removed.id,
          profile_id: user.id,
          title: removed.title.trim().slice(0, 70),
          url: normalizeUrl(removed.url),
          icon: removed.ic || null,
          color: removed.color || null,
          text_color: removed.tc || null,
          border_color: removed.bc || null,
          is_active: removed.on,
          position: index,
          clicks_total: removed.clicks,
        });
        if (error) {
          setSaveStatus('error');
          showToast('Gagal menyimpan. Coba lagi.');
        } else {
          persistedLinkIdsRef.current.add(removed.id);
          setSaveStatus('saved');
        }
      }
    });
  };

  const handleMoveLink = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    const currentLinks = stateRef.current.links;
    if (targetIndex < 0 || targetIndex >= currentLinks.length) return;

    const swapped = [...currentLinks];
    const a = swapped[index];
    const b = swapped[targetIndex];
    swapped[index] = b;
    swapped[targetIndex] = a;

    setState((prev) => ({ ...prev, links: swapped }));

    const supabase = getSupabaseClient();
    if (!supabase || !user) return;

    const updates: Array<PromiseLike<unknown>> = [];
    if (persistedLinkIdsRef.current.has(a.id)) {
      updates.push(
        supabase
          .from('links')
          .update({ position: targetIndex })
          .eq('id', a.id)
          .eq('profile_id', user.id)
      );
    }
    if (persistedLinkIdsRef.current.has(b.id)) {
      updates.push(
        supabase
          .from('links')
          .update({ position: index })
          .eq('id', b.id)
          .eq('profile_id', user.id)
      );
    }

    if (updates.length > 0) {
      setSaveStatus('saving');
      try {
        await Promise.all(updates);
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
        showToast('Gagal menyimpan. Coba lagi.');
      }
    }
  };

  const handleApplyColorsToAll = async (color: string, tc: string, bc: string) => {
    const updatedLinks = stateRef.current.links.map((item) => ({
      ...item,
      color,
      tc,
      bc,
    }));

    setState((prev) => ({ ...prev, links: updatedLinks }));
    showToast('Warna diterapkan ke semua link');

    const supabase = getSupabaseClient();
    if (!supabase || !user) return;
    const persistedIds = updatedLinks
      .filter((l) => persistedLinkIdsRef.current.has(l.id))
      .map((l) => l.id);

    if (persistedIds.length > 0) {
      setSaveStatus('saving');
      const { error } = await supabase
        .from('links')
        .update({
          color: color || null,
          text_color: tc || null,
          border_color: bc || null,
        })
        .eq('profile_id', user.id)
        .in('id', persistedIds);
      if (error) {
        setSaveStatus('error');
        showToast('Gagal menyimpan. Coba lagi.');
      } else {
        setSaveStatus('saved');
      }
    }
  };

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    navigate('/login', true);
  };

  useEffect(() => {
    if (!user || !hasProfile) return;
    if (activeTab !== 'statistik' && activeTab !== 'link') return;

    const refreshClicks = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      const { data: rows } = await supabase
        .from('links')
        .select('id, clicks_total')
        .eq('profile_id', user.id);
      if (!Array.isArray(rows)) return;
      const clickMap = new Map(
        rows.map((r) => [String(r.id), Number(r.clicks_total || 0)])
      );
      setState((prev) => ({
        ...prev,
        links: prev.links.map((l) =>
          clickMap.has(l.id) ? { ...l, clicks: clickMap.get(l.id)! } : l
        ),
      }));
    };

    refreshClicks();
    window.addEventListener('focus', refreshClicks);
    return () => window.removeEventListener('focus', refreshClicks);
  }, [activeTab, user, hasProfile]);

  if (authLoading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--mu)',
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        Memuat editor...
      </main>
    );
  }

  if (user && !hasProfile) {
    const googleName = String(
      user.user_metadata?.full_name || user.user_metadata?.name || ''
    );
    return (
      <OnboardingPage
        userId={user.id}
        initialName={googleName}
        onComplete={() => loadUserAndProfile(user)}
        onSignOut={handleSignOut}
      />
    );
  }

  const desktopTab = activeTab === 'pratinjau' ? 'link' : activeTab;

  const tabs: Array<{
    id: EditorTab;
    label: string;
    icon: 'tabLink' | 'tabStyle' | 'tabStats' | 'tabShare' | 'tabPreview';
    desktopHidden?: boolean;
  }> = [
    { id: 'link', label: 'Link', icon: 'tabLink' },
    { id: 'tampilan', label: 'Tampilan', icon: 'tabStyle' },
    { id: 'statistik', label: 'Statistik', icon: 'tabStats' },
    { id: 'bagikan', label: 'Bagikan', icon: 'tabShare' },
    { id: 'pratinjau', label: 'Pratinjau', icon: 'tabPreview', desktopHidden: true },
  ];

  return (
    <div className="mare-shell">
      <Header
        saveStatus={saveStatus}
        hasUnsavedChanges={hasUnsavedChanges}
        onSaveNow={() => handleSaveNow(true)}
        onRetrySave={handleRetrySave}
        username={state.profile.user}
        name={state.profile.name}
        avatar={state.profile.avatar}
        onViewPage={() => window.open(`/${state.profile.user}`, '_blank', 'noopener,noreferrer')}
        onSignOut={handleSignOut}
      />

      {/* Desktop horizontal tabs */}
      <nav className="mare-tabs-desktop" aria-label="Navigasi editor">
        {tabs
          .filter((t) => !t.desktopHidden)
          .map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={desktopTab === t.id}
              className="mare-tab-desktop-btn"
              onClick={() => handleTabChange(t.id)}
            >
              <UiIcon name={t.icon} size={18} />
              <span>{t.label}</span>
            </button>
          ))}
      </nav>

      <div className="mare-layout">
        <main style={{ minWidth: 0 }}>
          {activeTab === 'link' && (
            <TabLink
              profile={state.profile}
              social={state.social}
              links={state.links}
              uploadingAvatar={uploadingAvatar}
              onProfileChange={handleProfileChange}
              onUploadAvatar={handleUploadAvatar}
              onRemoveAvatar={handleRemoveAvatar}
              onSocialChange={handleSocialChange}
              onAddLink={handleAddLink}
              onFillSampleLinks={handleFillSampleLinks}
              onUpdateLink={handleUpdateLink}
              onDeleteLink={handleDeleteLink}
              onMoveLink={handleMoveLink}
              onApplyColorsToAll={handleApplyColorsToAll}
              onShowToast={(msg) => showToast(msg)}
            />
          )}

          {activeTab === 'tampilan' && (
            <TabTampilan
              styleConfig={state.style}
              footer={state.footer}
              onSelectTheme={handleSelectTheme}
              onStyleChange={handleStyleChange}
              onResetColors={handleResetColors}
              onFooterChange={handleFooterChange}
            />
          )}

          {activeTab === 'statistik' && (
            <TabStatistik links={state.links} />
          )}

          {activeTab === 'bagikan' && (
            <TabBagikan
              state={state}
              onTogglePublished={handleTogglePublished}
              onShowToast={(msg) => showToast(msg)}
            />
          )}

          {activeTab === 'pratinjau' && (
            <TabPratinjau
              state={state}
              onPreviewBlocked={handlePreviewBlocked}
              onJumpToFooter={() => {
                handleTabChange('tampilan');
                window.setTimeout(() => {
                  const card = document.getElementById('card-footer-title');
                  card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  const input = document.getElementById('footer-teks') as HTMLInputElement | null;
                  input?.focus();
                  input?.select();
                }, 60);
              }}
            />
          )}

          {(activeTab === 'link' || activeTab === 'tampilan' || activeTab === 'bagikan') && (
            <div
              className="mare-card"
              style={{
                marginTop: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  className={`mare-status-dot mare-status-dot--${
                    saveStatus === 'error'
                      ? 'error'
                      : saveStatus === 'saving' || hasUnsavedChanges
                      ? 'saving'
                      : 'saved'
                  }`}
                  aria-hidden="true"
                />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--mu)' }}>
                  {saveStatus === 'error'
                    ? 'Gagal menyimpan perubahan'
                    : saveStatus === 'saving'
                    ? 'Menyimpan perubahan...'
                    : hasUnsavedChanges
                    ? 'Ada perubahan belum disimpan'
                    : 'Semua perubahan tersimpan'}
                </span>
              </div>
              <button
                type="button"
                className="mare-btn-primary"
                disabled={saveStatus === 'saving'}
                onClick={() => handleSaveNow(true)}
              >
                <UiIcon name="check" size={17} />
                <span>{saveStatus === 'saving' ? 'Menyimpan...' : 'Simpan'}</span>
              </button>
            </div>
          )}
        </main>

        <aside className="mare-preview-col" aria-label="Pratinjau ponsel">
          <PhonePreview
            data={state}
            onPreviewBlocked={handlePreviewBlocked}
          />
          <button
            type="button"
            className="mare-btn-ghost mare-btn-sm"
            style={{ marginTop: 12 }}
            onClick={() => {
              handleTabChange('tampilan');
              window.setTimeout(() => {
                const card = document.getElementById('card-footer-title');
                card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const input = document.getElementById('footer-teks') as HTMLInputElement | null;
                input?.focus();
                input?.select();
              }, 60);
            }}
          >
            Ubah teks footer
          </button>
        </aside>
      </div>

      {/* Mobile bottom floating tab bar */}
      <nav className="mare-tabs-mobile" aria-label="Navigasi editor ponsel">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={activeTab === t.id}
            className="mare-tab-mobile-btn"
            onClick={() => handleTabChange(t.id)}
          >
            <UiIcon name={t.icon} size={22} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};
