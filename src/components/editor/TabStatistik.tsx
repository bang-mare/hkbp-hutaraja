import React, { useEffect, useState } from 'react';
import { getSupabaseClient } from '../../lib/supabase';
import type { DailyClick, LinkItem } from '../../lib/types';

interface TabStatistikProps {
  links: LinkItem[];
  onRefreshClicks?: () => void;
}

type StatsRange = '7' | '30' | 'all';

function formatShortDate(dateStr: string): string {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return dateStr;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export const TabStatistik: React.FC<TabStatistikProps> = ({ links }) => {
  const [range, setRange] = useState<StatsRange>('7');
  const [daily, setDaily] = useState<DailyClick[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    const loadDaily = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const days = range === '7' ? 7 : 30;
      const { data, error } = await supabase.rpc('daily_clicks', {
        p_days: days,
      });
      if (!cancelled) {
        if (!error && Array.isArray(data)) {
          setDaily(
            data.map((row) => ({
              day: String(row.day),
              clicks: Number(row.clicks || 0),
            }))
          );
        } else {
          setDaily([]);
        }
        setLoading(false);
      }
    };
    loadDaily();
    return () => {
      cancelled = true;
    };
  }, [range]);

  const activeCount = links.filter((l) => l.on && l.title.trim()).length;
  const totalLinksCount = links.length;
  const allTimeClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
  const rangeDailyClicks = daily.reduce((sum, d) => sum + d.clicks, 0);
  const displayTotalClicks =
    range === 'all' ? allTimeClicks : rangeDailyClicks;

  const sortedLinks = [...links].sort((a, b) => b.clicks - a.clicks);
  const topLink =
    sortedLinks.length > 0 && sortedLinks[0].clicks > 0
      ? sortedLinks[0]
      : null;

  const maxDaily = Math.max(1, ...daily.map((d) => d.clicks));
  const maxLinkClicks = Math.max(1, ...sortedLinks.map((l) => l.clicks));

  return (
    <div>
      <section className="mare-card" aria-labelledby="card-stats-title">
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
            id="card-stats-title"
            className="font-display"
            style={{ margin: 0, fontSize: 18, fontWeight: 800 }}
          >
            Statistik klik
          </h2>

          <div className="mare-segmented">
            {(
              [
                { id: '7', label: '7 hari' },
                { id: '30', label: '30 hari' },
                { id: 'all', label: 'Semua' },
              ] as Array<{ id: StatsRange; label: string }>
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                className="mare-segmented-item"
                aria-pressed={range === opt.id}
                onClick={() => setRange(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dua tile utama */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              borderRadius: 20,
              padding: 16,
              background: 'var(--grad)',
              color: 'var(--ac-ink)',
              boxShadow: 'var(--shadow-btn)',
            }}
          >
            <div style={{ fontSize: 12.5, fontWeight: 600, opacity: 0.9 }}>
              Total klik
            </div>
            <div
              className="font-display tabular-nums"
              style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.15, marginTop: 6 }}
            >
              {displayTotalClicks.toLocaleString('id-ID')}
            </div>
          </div>

          <div
            style={{
              borderRadius: 20,
              padding: 16,
              background: 'var(--sf2)',
              border: '1px solid var(--ln)',
              color: 'var(--ink)',
            }}
          >
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--mu)' }}>
              Link tampil
            </div>
            <div
              className="font-display tabular-nums"
              style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.15, marginTop: 6 }}
            >
              {activeCount}/{totalLinksCount}
            </div>
          </div>
        </div>

        {topLink && (
          <div className="mare-chip-note" style={{ marginBottom: 16 }}>
            Paling sering diklik: <strong>{topLink.title || 'Tanpa judul'}</strong>
          </div>
        )}

        {allTimeClicks === 0 && rangeDailyClicks === 0 && !loading ? (
          <div
            style={{
              borderRadius: 18,
              border: '1.5px dashed var(--ln)',
              padding: '24px 16px',
              textAlign: 'center',
              color: 'var(--mu)',
              fontSize: 14,
              lineHeight: 1.55,
            }}
          >
            Belum ada klik tercatat. Klik dari pengunjung pada halaman publik kamu akan muncul di sini.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 18 }}>
            {/* Grafik batang vertikal klik per hari */}
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--mu)',
                  marginBottom: 10,
                }}
              >
                {range === '7'
                  ? 'Klik harian (7 hari terakhir)'
                  : range === '30'
                  ? 'Klik harian (30 hari terakhir)'
                  : 'Aktivitas harian (30 hari terakhir)'}
              </div>

              {loading ? (
                <div
                  style={{
                    height: 140,
                    borderRadius: 16,
                    background: 'var(--sf2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    color: 'var(--mu)',
                  }}
                >
                  Memuat grafik...
                </div>
              ) : (
                <div
                  style={{
                    background: 'var(--sf2)',
                    borderRadius: 18,
                    padding: '16px 12px 12px',
                    border: '1px solid var(--ln)',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${Math.max(1, daily.length)}, minmax(0, 1fr))`,
                      gap: daily.length > 14 ? 3 : 8,
                      alignItems: 'end',
                      height: 120,
                    }}
                  >
                    {daily.map((d) => {
                      const pct =
                        d.clicks > 0
                          ? Math.max(12, Math.round((d.clicks / maxDaily) * 100))
                          : 6;
                      return (
                        <div
                          key={d.day}
                          title={`${formatShortDate(d.day)}: ${d.clicks.toLocaleString('id-ID')} klik`}
                          style={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                          }}
                        >
                          <div
                            style={{
                              width: '100%',
                              height: `${pct}%`,
                              borderRadius: 6,
                              background:
                                d.clicks > 0 ? 'var(--grad)' : 'var(--ln)',
                              opacity: d.clicks > 0 ? 1 : 0.7,
                              transition: 'height 200ms ease',
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {daily.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: 8,
                        fontSize: 11,
                        color: 'var(--mu)',
                        fontWeight: 500,
                      }}
                    >
                      <span>{formatShortDate(daily[0].day)}</span>
                      {daily.length > 2 && (
                        <span>
                          {formatShortDate(daily[Math.floor(daily.length / 2)].day)}
                        </span>
                      )}
                      <span>{formatShortDate(daily[daily.length - 1].day)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Daftar batang horizontal per link */}
            {sortedLinks.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--mu)',
                    marginBottom: 10,
                  }}
                >
                  Performa per link
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
                  {sortedLinks.map((item) => {
                    const widthPct =
                      item.clicks > 0
                        ? Math.max(2, Math.round((item.clicks / maxLinkClicks) * 100))
                        : 2;
                    return (
                      <div key={item.id}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            gap: 10,
                            marginBottom: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13.5,
                              fontWeight: 600,
                              minWidth: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.title || 'Link tanpa judul'}
                          </span>
                          <span
                            className="tabular-nums"
                            style={{
                              fontSize: 12.5,
                              fontWeight: 700,
                              color: 'var(--mu)',
                              flexShrink: 0,
                            }}
                          >
                            {item.clicks.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: 12,
                            borderRadius: 999,
                            background: 'var(--sf2)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${widthPct}%`,
                              height: '100%',
                              borderRadius: 999,
                              background: 'var(--grad)',
                              opacity: item.clicks > 0 ? 1 : 0.35,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
