import { useState } from 'react';
import { Film } from 'lucide-react';

interface MediaImageProps {
  src: string;
  alt: string;
  title?: string;
  accentTone?: string;
  className?: string;
  aspectClassName?: string;
  loading?: 'eager' | 'lazy';
}

export function MediaImage({
  src,
  alt,
  title,
  className = '',
  aspectClassName = '',
  loading = 'lazy',
}: MediaImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center p-6 text-center text-[#394A43] select-none overflow-hidden bg-[#B9DAD3] ${aspectClassName} ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="w-12 h-12 rounded-2xl neu-card-white flex items-center justify-center mb-3">
          <Film className="w-6 h-6 text-[#567360]" strokeWidth={1.6} />
        </div>
        {title && (
          <span className="font-display text-base font-semibold tracking-tight text-[#394A43] leading-snug max-w-[18ch]">
            {title}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${aspectClassName} ${className}`}
    />
  );
}
