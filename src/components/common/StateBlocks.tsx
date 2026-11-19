import type { ReactNode } from 'react';
import { AlertCircle, Film, Loader2 } from 'lucide-react';

export function LoadingState({ label = 'Loading catalogue...' }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="w-14 h-14 rounded-2xl neu-card-white flex items-center justify-center mb-4">
        <Loader2 className="w-6 h-6 text-[#567360] animate-spin" />
      </div>
      <p className="text-sm font-medium text-[#5A6D65]">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="neu-card-white rounded-[28px] py-16 px-6 sm:px-10 text-center max-w-2xl mx-auto">
      <div className="w-14 h-14 rounded-2xl neu-inset flex items-center justify-center mx-auto mb-5 text-[#567360]">
        <Film className="w-6 h-6" strokeWidth={1.75} />
      </div>
      <h2 className="text-lg font-bold text-[#394A43] mb-2">{title}</h2>
      <p className="text-sm text-[#5A6D65] max-w-md mx-auto leading-relaxed mb-7">
        {description}
      </p>
      {action}
    </div>
  );
}

export function ErrorState({
  title = 'Unable to load data',
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="neu-card-peach rounded-[24px] p-6 max-w-2xl mx-auto"
      role="alert"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-[#FFFCF5]/80 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-[#6D3F2F]" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-[#394A43] mb-1">{title}</h2>
          <p className="text-sm text-[#4F433C] leading-relaxed break-words">{description}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 px-5 py-2 text-xs font-semibold rounded-full neu-btn-primary cursor-pointer"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
