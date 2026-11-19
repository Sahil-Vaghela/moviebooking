import { RotateCcw, Search } from 'lucide-react';
import type { FormatType, Genre, ReleaseStatus } from '../../types/catalogue';

interface MovieFiltersBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  status: ReleaseStatus | 'ALL';
  onStatusChange: (value: ReleaseStatus | 'ALL') => void;
  genreId: string;
  onGenreChange: (value: string) => void;
  language: string;
  onLanguageChange: (value: string) => void;
  format: FormatType | '';
  onFormatChange: (value: string) => void;
  genres: Genre[];
  languages: string[];
  formats: FormatType[];
  hasActiveFilters: boolean;
  onReset: () => void;
}

export function MovieFiltersBar({
  query,
  onQueryChange,
  status,
  onStatusChange,
  genreId,
  onGenreChange,
  language,
  onLanguageChange,
  format,
  onFormatChange,
  genres,
  languages,
  formats,
  hasActiveFilters,
  onReset,
}: MovieFiltersBarProps) {
  return (
    <div className="neu-card rounded-[28px] p-5 sm:p-6 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Soft Inset Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#718F7B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search movies, directors, cast, or languages..."
            aria-label="Search movies"
            className="w-full pl-11 pr-4 py-3 text-sm rounded-full neu-input"
          />
        </div>

        {/* Recessed Segmented Control for Release Status */}
        <div
          className="inline-flex items-center p-1.5 neu-inset rounded-full shrink-0"
          role="group"
          aria-label="Release status filter"
        >
          {(
            [
              { value: 'ALL', label: 'All Titles' },
              { value: 'NOW_SHOWING', label: 'Now Showing' },
              { value: 'COMING_SOON', label: 'Coming Soon' },
            ] as const
          ).map((option) => {
            const active = status === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onStatusChange(option.value)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'neu-card-white text-[#394A43]'
                    : 'text-[#5A6D65] hover:text-[#394A43]'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          aria-label="Filter by language"
          className="px-4 py-2.5 text-sm rounded-full neu-input cursor-pointer"
        >
          <option value="">All Languages</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        <select
          value={genreId}
          onChange={(e) => onGenreChange(e.target.value)}
          aria-label="Filter by genre"
          className="px-4 py-2.5 text-sm rounded-full neu-input cursor-pointer"
        >
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <select
          value={format}
          onChange={(e) => onFormatChange(e.target.value)}
          aria-label="Filter by screening format"
          className="px-4 py-2.5 text-sm rounded-full neu-input cursor-pointer"
        >
          <option value="">All Formats</option>
          {formats.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-full neu-btn-peach whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
