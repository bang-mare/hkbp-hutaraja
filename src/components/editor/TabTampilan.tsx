import React from 'react';
import {
  ACCENT_PRESETS,
  BG_PRESETS,
  CARD_PRESETS,
  CARD_TEXT_BORDER_PRESETS,
  DEFAULT_FOOTER,
  THEMES,
} from '../../lib/theme';
import type {
  ButtonFill,
  ButtonShape,
  FooterConfig,
  FooterStyle,
  PageFont,
  StyleConfig,
  ThemeId,
} from '../../lib/types';

interface TabTampilanProps {
  styleConfig: StyleConfig;
  footer: FooterConfig;
  onSelectTheme: (themeId: ThemeId) => void;
  onStyleChange: (patch: Partial<StyleConfig>) => void;
  onResetColors: () => void;
  onFooterChange: (patch: Partial<FooterConfig>) => void;
}

export const TabTampilan: React.FC<TabTampilanProps> = ({
  styleConfig,
  footer,
  onSelectTheme,
  onStyleChange,
  onResetColors,
  onFooterChange,
}) => {
  const renderSwatchGroup = (
    label: string,
    field: 'bg' | 'card' | 'ac' | 'tc' | 'bc',
    presets: string[],
    currentValue: string,
    allowGradient = false
  ) => {
    const isCustomPickerActive =
      Boolean(currentValue) &&
      !presets.some((p) => p.toLowerCase() === currentValue.toLowerCase());

    return (
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          {label}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, alignItems: 'center' }}>
          <button
            type="button"
            className="mare-swatch mare-swatch-auto"
            aria-label={`${label} ikuti tema`}
            aria-pressed={currentValue === ''}
            onClick={() => onStyleChange({ [field]: '' })}
          />
          {presets.map((val) => (
            <button
              key={val}
              type="button"
              className="mare-swatch"
              aria-label={`${label} ${val}`}
              aria-pressed={currentValue.toLowerCase() === val.toLowerCase()}
              style={{
                background: allowGradient ? val : undefined,
                backgroundColor: allowGradient ? undefined : val,
              }}
              onClick={() => onStyleChange({ [field]: val })}
            />
          ))}
          <label
            className="mare-swatch mare-swatch-rainbow"
            aria-label={`${label} warna bebas`}
            aria-pressed={isCustomPickerActive}
          >
            <input
              type="color"
              value={
                currentValue.startsWith('#') ? currentValue : '#0A8683'
              }
              onChange={(e) =>
                onStyleChange({ [field]: e.target.value.toUpperCase() })
              }
            />
          </label>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Kartu Tema */}
      <section className="mare-card" aria-labelledby="card-tema-title">
        <h2
          id="card-tema-title"
          className="font-display"
          style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 800 }}
        >
          Tema
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 10,
          }}
        >
          {THEMES.map((theme) => {
            const active = styleConfig.theme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                aria-pressed={active}
                onClick={() => onSelectTheme(theme.id)}
                style={{
                  border: active ? '2px solid var(--ac)' : '1px solid var(--ln)',
                  boxShadow: active ? '0 0 0 3px var(--acs)' : 'none',
                  borderRadius: 18,
                  padding: 8,
                  background: 'var(--sf2)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 7,
                  color: 'var(--ink)',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: 64,
                    borderRadius: 12,
                    background: theme.bg,
                    padding: '12px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 6,
                    border: '1px solid rgba(11,26,29,0.08)',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      height: 11,
                      borderRadius: 999,
                      background: theme.card,
                    }}
                  />
                  <span
                    style={{
                      display: 'block',
                      height: 11,
                      borderRadius: 999,
                      background: theme.card,
                      opacity: 0.85,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  {theme.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Kartu Warna */}
      <section className="mare-card" aria-labelledby="card-warna-title">
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
            id="card-warna-title"
            className="font-display"
            style={{ margin: 0, fontSize: 18, fontWeight: 800 }}
          >
            Warna
          </h2>
          <button
            type="button"
            className="mare-btn-ghost mare-btn-sm"
            onClick={onResetColors}
          >
            Ikuti tema
          </button>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          {renderSwatchGroup('Latar', 'bg', BG_PRESETS, styleConfig.bg, true)}
          {renderSwatchGroup('Kartu', 'card', CARD_PRESETS, styleConfig.card)}
          {renderSwatchGroup('Aksen', 'ac', ACCENT_PRESETS, styleConfig.ac)}
          {renderSwatchGroup(
            'Teks kartu',
            'tc',
            CARD_TEXT_BORDER_PRESETS,
            styleConfig.tc
          )}
          {renderSwatchGroup(
            'Garis kartu',
            'bc',
            CARD_TEXT_BORDER_PRESETS,
            styleConfig.bc
          )}
        </div>

        <p style={{ margin: '14px 0 0', fontSize: 12, color: 'var(--mu)', lineHeight: 1.5 }}>
          Warna teks otomatis menyesuaikan kontras latar atau kartu, kecuali Teks kartu dipilih manual.
        </p>
      </section>

      {/* Kartu Tombol */}
      <section className="mare-card" aria-labelledby="card-tombol-title">
        <h2
          id="card-tombol-title"
          className="font-display"
          style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 800 }}
        >
          Tombol
        </h2>

        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Bentuk
            </div>
            <div className="mare-segmented" style={{ width: '100%' }}>
              {(
                [
                  { id: 'bulat', label: 'Bulat' },
                  { id: 'sedang', label: 'Sedang' },
                  { id: 'kotak', label: 'Kotak' },
                ] as Array<{ id: ButtonShape; label: string }>
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="mare-segmented-item"
                  aria-pressed={styleConfig.shape === opt.id}
                  onClick={() => onStyleChange({ shape: opt.id })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Gaya
            </div>
            <div className="mare-segmented" style={{ width: '100%' }}>
              {(
                [
                  { id: 'solid', label: 'Isi' },
                  { id: 'garis', label: 'Garis' },
                ] as Array<{ id: ButtonFill; label: string }>
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="mare-segmented-item"
                  aria-pressed={styleConfig.fill === opt.id}
                  onClick={() => onStyleChange({ fill: opt.id })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Huruf
            </div>
            <div className="mare-segmented" style={{ width: '100%' }}>
              {(
                [
                  { id: 'netral', label: 'Netral' },
                  { id: 'tegas', label: 'Tegas' },
                ] as Array<{ id: PageFont; label: string }>
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="mare-segmented-item"
                  aria-pressed={styleConfig.font === opt.id}
                  onClick={() => onStyleChange({ font: opt.id })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Kartu Footer */}
      <section className="mare-card" aria-labelledby="card-footer-title">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: footer.on ? 14 : 8,
          }}
        >
          <h2
            id="card-footer-title"
            className="font-display"
            style={{ margin: 0, fontSize: 18, fontWeight: 800 }}
          >
            Footer
          </h2>

          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span className="mare-toggle">
              <input
                type="checkbox"
                checked={footer.on}
                aria-label="Tampilkan footer"
                onChange={(e) => onFooterChange({ on: e.target.checked })}
              />
              <span className="mare-toggle-track">
                <span className="mare-toggle-thumb" />
              </span>
            </span>
            <span>Tampil</span>
          </label>
        </div>

        {!footer.on ? (
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--mu)' }}>
            Footer disembunyikan dari halaman.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <label
                htmlFor="footer-teks"
                style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
              >
                Teks
              </label>
              <input
                id="footer-teks"
                type="text"
                className="mare-input"
                maxLength={60}
                placeholder="Dibuat dengan MARE-ID"
                value={footer.text}
                onChange={(e) =>
                  onFooterChange({ text: e.target.value.slice(0, 60) })
                }
              />
            </div>

            <div>
              <label
                htmlFor="footer-url"
                style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
              >
                Tautan opsional
              </label>
              <input
                id="footer-url"
                type="url"
                inputMode="url"
                className="mare-input"
                placeholder="https://mare.id"
                value={footer.url}
                onChange={(e) => onFooterChange({ url: e.target.value })}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '4px 0',
              }}
            >
              <label
                htmlFor="footer-logo-toggle"
                style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Logo gelombang
              </label>
              <span className="mare-toggle">
                <input
                  id="footer-logo-toggle"
                  type="checkbox"
                  checked={footer.logo}
                  onChange={(e) => onFooterChange({ logo: e.target.checked })}
                />
                <span className="mare-toggle-track">
                  <span className="mare-toggle-thumb" />
                </span>
              </span>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                Gaya
              </div>
              <div className="mare-segmented" style={{ width: '100%' }}>
                {(
                  [
                    { id: 'teks', label: 'Teks' },
                    { id: 'pil', label: 'Pil' },
                    { id: 'garis', label: 'Garis' },
                  ] as Array<{ id: FooterStyle; label: string }>
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className="mare-segmented-item"
                    aria-pressed={footer.style === opt.id}
                    onClick={() => onFooterChange({ style: opt.id })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <button
                type="button"
                className="mare-btn-ghost mare-btn-sm"
                onClick={() =>
                  onFooterChange({ text: DEFAULT_FOOTER.text })
                }
              >
                Pulihkan teks bawaan
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
