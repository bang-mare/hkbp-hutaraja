import React, { useEffect, useState } from 'react';
import { LineIcon, WaveLogoIcon } from '../lib/icons';
import { getStoredBrandLogo, validateBrandLogo, validateIconId } from '../lib/theme';

interface BrandLogoProps {
  logo?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export async function processBrandLogoFile(file: File): Promise<Blob> {
  const imageUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Gagal membaca gambar logo'));
      el.src = imageUrl;
    });

    const target = 256;
    const scale = Math.min(target / img.naturalWidth, target / img.naturalHeight, 1);
    const drawW = Math.max(1, Math.round(img.naturalWidth * scale));
    const drawH = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvasSize = Math.max(drawW, drawH);
    const dx = Math.round((canvasSize - drawW) / 2);
    const dy = Math.round((canvasSize - drawH) / 2);

    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas tidak tersedia');

    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.drawImage(img, dx, dy, drawW, drawH);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png')
    );
    if (!blob) throw new Error('Gagal memproses gambar logo');
    return blob;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  logo,
  size = 22,
  className = '',
  style,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const resolved = validateBrandLogo(
    logo !== undefined ? logo : getStoredBrandLogo()
  );

  useEffect(() => {
    setImgFailed(false);
  }, [resolved]);

  if (resolved && /^https?:\/\//i.test(resolved) && !imgFailed) {
    return (
      <div
        className={`mare-logo ${className}`.trim()}
        aria-hidden="true"
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--ln)',
          padding: 3,
          overflow: 'hidden',
          ...style,
        }}
      >
        <img
          src={resolved}
          alt="Logo HKBP Hutaraja"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: 10,
            display: 'block',
          }}
        />
      </div>
    );
  }

  if (resolved.startsWith('icon:')) {
    const iconId = validateIconId(resolved.slice(5));
    if (iconId) {
      return (
        <div
          className={`mare-logo ${className}`.trim()}
          aria-hidden="true"
          style={style}
        >
          <LineIcon name={iconId} size={size} />
        </div>
      );
    }
  }

  return (
    <div
      className={`mare-logo ${className}`.trim()}
      aria-hidden="true"
      style={style}
    >
      <WaveLogoIcon size={size} />
    </div>
  );
};
