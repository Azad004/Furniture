import React, { useEffect, useState } from 'react';
import { Armchair } from 'lucide-react';
import { resolveAssetUrl } from '../../utils/security';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({ src, alt, className = '' }) => {
  const safeSrc = resolveAssetUrl(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [safeSrc]);

  if (!safeSrc || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-[var(--color-bg-surface-alt)] text-[var(--color-text-muted)] ${className}`}
        role="img"
        aria-label={alt}
      >
        <Armchair className="w-7 h-7 opacity-45" strokeWidth={1.5} />
        <span className="text-xs font-medium px-4 text-center line-clamp-2 opacity-75">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={safeSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
