import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useCity } from '../context/CityContext';
import { catalogueService } from '../services/catalogueService';
import { DateStrip } from '../components/booking/DateStrip';
import { ShowtimeList } from '../components/booking/ShowtimeList';
import { EmptyState } from '../components/common/StateBlocks';
import { formatDuration } from '../utils/formatters';
import type { FormatType } from '../types/catalogue';

type TimeBand = 'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';

export function ShowSelectionPage() {
  const { movieId } = useParams<{ movieId: string }>();
  const { selectedCity, openCityModal } = useCity();

  const [dateOffset, setDateOffset] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<FormatType | ''>('');
  const [timeBand, setTimeBand] = useState<TimeBand>('ALL');

  const movie = useMemo(
    () => (movieId ? catalogueService.getMovieById(movieId) : undefined),
    [movieId]
  );

  const genres = useMemo(
    () => (movie ? catalogueService.getGenresForMovie(movie) : []),
    [movie]
  );

  const theatreGroups = useMemo(() => {
    if (!movie) return [];
    return catalogueService.getGroupedShowsForMovie({
      movieId: movie.id,
      cityId: selectedCity.id,
      dateOffsetDays: dateOffset,
      language: selectedLanguage || undefined,
      format: selectedFormat,
      timeBand,
    });
  }, [movie, selectedCity.id, dateOffset, selectedLanguage, selectedFormat, timeBand]);

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          title="Movie not found"
          description="We could not locate showtimes for this film."
          action={
            <Link
              to="/movies"
              className="inline-flex items-center px-6 py-2.5 text-sm font-semibold rounded-full neu-btn-primary"
            >
              Browse Movies
            </Link>
          }
        />
      </div>
    );
  }

  const totalShowsCount = theatreGroups.reduce((sum, g) => sum + g.shows.length, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-7">
      <Link
        to={`/movies/${movie.id}`}
        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full neu-btn text-[#394A43]"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to {movie.title}</span>
      </Link>

      {/* Raised Movie & City Header Panel */}
      <div className="neu-card rounded-[30px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <p className="text-xs font-semibold text-[#567360]">Theatre & Showtime Selection</p>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-[#394A43] tracking-tight mt-1">
            {movie.title}
          </h1>
          <p className="text-sm text-[#5A6D65] mt-1.5">
            {movie.certification} · {formatDuration(movie.durationMins)} ·{' '}
            {genres.map((g) => g.name).join(' / ')}
          </p>
        </div>

        <button
          type="button"
          onClick={openCityModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full neu-btn-mint text-sm font-bold text-[#394A43] self-start md:self-auto cursor-pointer whitespace-nowrap"
        >
          <MapPin className="w-4 h-4" />
          <span>{selectedCity.name}</span>
          <span className="text-xs font-normal opacity-80">· Change</span>
        </button>
      </div>

      {/* Date Strip & Show Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <DateStrip selectedOffset={dateOffset} onSelectOffset={setDateOffset} />

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            aria-label="Filter shows by language"
            className="px-4 py-2.5 text-sm rounded-full neu-input cursor-pointer"
          >
            <option value="">All Languages</option>
            {movie.languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value as FormatType | '')}
            aria-label="Filter shows by format"
            className="px-4 py-2.5 text-sm rounded-full neu-input cursor-pointer"
          >
            <option value="">All Formats</option>
            {movie.formats.map((fmt) => (
              <option key={fmt} value={fmt}>
                {fmt}
              </option>
            ))}
          </select>

          <select
            value={timeBand}
            onChange={(e) => setTimeBand(e.target.value as TimeBand)}
            aria-label="Filter shows by time of day"
            className="px-4 py-2.5 text-sm rounded-full neu-input cursor-pointer"
          >
            <option value="ALL">Any Time</option>
            <option value="MORNING">Morning (Before 12 PM)</option>
            <option value="AFTERNOON">Afternoon (12 PM – 4 PM)</option>
            <option value="EVENING">Evening (4 PM – 8 PM)</option>
            <option value="NIGHT">Night (After 8 PM)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[#5A6D65] px-1">
        <span className="tabular-nums font-medium">
          {theatreGroups.length} {theatreGroups.length === 1 ? 'theatre' : 'theatres'} ·{' '}
          {totalShowsCount} {totalShowsCount === 1 ? 'showtime' : 'showtimes'}
        </span>
        <span>Select a showtime pill to open the seat map</span>
      </div>

      {theatreGroups.length === 0 ? (
        <EmptyState
          title="No matching showtimes"
          description={`There are no screenings matching your selected filters for ${movie.title} in ${selectedCity.name} on this date.`}
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedLanguage('');
                  setSelectedFormat('');
                  setTimeBand('ALL');
                }}
                className="px-6 py-2.5 text-sm font-semibold rounded-full neu-btn-primary cursor-pointer"
              >
                Reset Show Filters
              </button>
              <button
                type="button"
                onClick={openCityModal}
                className="px-5 py-2.5 text-sm font-semibold rounded-full neu-btn cursor-pointer"
              >
                Switch City
              </button>
            </div>
          }
        />
      ) : (
        <ShowtimeList groups={theatreGroups} />
      )}
    </div>
  );
}
