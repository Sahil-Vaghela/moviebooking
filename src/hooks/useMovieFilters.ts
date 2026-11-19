import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { catalogueService } from '../services/catalogueService';
import type { FormatType, ReleaseStatus } from '../types/catalogue';

export function useMovieFilters(cityId: string) {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') ?? '';
  const genreId = searchParams.get('genre') ?? '';
  const language = searchParams.get('lang') ?? '';
  const format: FormatType | '' =
    (searchParams.get('format') as FormatType | null) ?? '';
  const statusParam = searchParams.get('status');
  const status: ReleaseStatus | 'ALL' =
    statusParam === 'NOW_SHOWING' || statusParam === 'COMING_SOON'
      ? statusParam
      : 'ALL';

  const updateParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams);
      if (!value || value === 'ALL') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const movies = useMemo(
    () =>
      catalogueService.filterMovies({
        cityId,
        query,
        genreId: genreId || undefined,
        language: language || undefined,
        format: format || '',
        status,
      }),
    [cityId, query, genreId, language, format, status]
  );

  const hasActiveFilters = Boolean(
    query.trim() || genreId || language || format || status !== 'ALL'
  );

  return {
    query,
    genreId,
    language,
    format,
    status,
    movies,
    hasActiveFilters,
    setQuery: (v: string) => updateParam('q', v),
    setGenreId: (v: string) => updateParam('genre', v),
    setLanguage: (v: string) => updateParam('lang', v),
    setFormat: (v: string) => updateParam('format', v),
    setStatus: (v: ReleaseStatus | 'ALL') => updateParam('status', v),
    resetFilters,
  };
}
