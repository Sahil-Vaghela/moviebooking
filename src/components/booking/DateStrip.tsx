import { formatDateLabel } from '../../utils/formatters';

interface DateStripProps {
  selectedOffset: number;
  onSelectOffset: (offset: number) => void;
  daysCount?: number;
}

export function DateStrip({
  selectedOffset,
  onSelectOffset,
  daysCount = 4,
}: DateStripProps) {
  const offsets = Array.from({ length: daysCount }, (_, i) => i);

  return (
    <div
      className="flex items-center gap-3 overflow-x-auto py-2 px-1"
      role="tablist"
      aria-label="Select show date"
    >
      {offsets.map((offset) => {
        const meta = formatDateLabel(offset);
        const active = offset === selectedOffset;
        return (
          <button
            key={offset}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelectOffset(offset)}
            className={`min-w-[92px] px-5 py-3 rounded-2xl text-center transition-all shrink-0 cursor-pointer ${
              active ? 'neu-btn-primary' : 'neu-btn'
            }`}
          >
            <div
              className={`text-[11px] font-semibold ${
                active ? 'text-[#FFFCF5]/85' : 'text-[#5A6D65]'
              }`}
            >
              {meta.relative}
            </div>
            <div className="font-display text-base font-bold tabular-nums leading-tight mt-0.5">
              {meta.dayNum} {meta.monthShort}
            </div>
          </button>
        );
      })}
    </div>
  );
}
