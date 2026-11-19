import { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { useCity } from '../context/CityContext';
import { catalogueService } from '../services/catalogueService';
import { useMovieFilters } from '../hooks/useMovieFilters';
import { MovieFiltersBar } from '../components/movies/MovieFiltersBar';
import { MovieCard } from '../components/movies/MovieCard';
import { EmptyState } from '../components/common/StateBlocks';

export function MoviesPage() {
  const { selectedCity, openCityModal } = useCity();
  const {
    query,
    genreId,
    language,
    format,
    status,
    movies,
    hasActiveFilters,
    setQuery,
    setGenreId,
    setLanguage,
    setFormat,
    setStatus,
    resetFilters,
  } = useMovieFilters(selectedCity.id);

  const genres = useMemo(() => catalogueService.getGenres(), []);
  const languages = useMemo(
    () => catalogueService.getAvailableLanguagesForCity(selectedCity.id),
    [selectedCity.id]
  );
  const formats = useMemo(
    () => catalogueService.getAvailableFormatsForCity(selectedCity.id),
    [selectedCity.id]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold text-[#567360]">
            Catalogue · {selectedCity.name} ({selectedCity.code})
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#394A43] tracking-tight mt-1">
            Movies in {selectedCity.name}
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-[#5A6D65]">
          <span className="tabular-nums font-medium">
            {movies.length} {movies.length === 1 ? 'title' : 'titles'}
          </span>
          <button
            type="button"
            onClick={openCityModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full neu-btn-mint cursor-pointer whitespace-nowrap"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Change city</span>
          </button>
        </div>
      </div>

      <div className="mb-10">
        <MovieFiltersBar
          query={query}
          onQueryChange={setQuery}
          status={status}
          onStatusChange={setStatus}
          genreId={genreId}
          onGenreChange={setGenreId}
          language={language}
          onLanguageChange={setLanguage}
          format={format}
          onFormatChange={setFormat}
          genres={genres}
          languages={languages}
          formats={formats}
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
        />
      </div>

      {movies.length === 0 ? (
        <EmptyState
          title="No movies match your filters"
          description={`We could not find any films in ${selectedCity.name} matching your current search or filter criteria.`}
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-6 py-2.5 text-sm font-semibold rounded-full neu-btn-primary cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
              <button
                type="button"
                onClick={openCityModal}
                className="px-5 py-2.5 text-sm font-semibold rounded-full neu-btn cursor-pointer"
              >
                Try Another City
              </button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
