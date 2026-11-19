import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, Clock, Star } from 'lucide-react';
import { useCity } from '../context/CityContext';
import { catalogueService } from '../services/catalogueService';
import { MediaImage } from '../components/common/MediaImage';
import { MovieCard } from '../components/movies/MovieCard';
import { EmptyState } from '../components/common/StateBlocks';
import { formatDuration, formatReleaseDate, formatVotes } from '../utils/formatters';

export function MovieDetailsPage() {
  const { movieId } = useParams<{ movieId: string }>();
  const { selectedCity, openCityModal } = useCity();

  const movie = useMemo(
    () => (movieId ? catalogueService.getMovieById(movieId) : undefined),
    [movieId]
  );

  const genres = useMemo(
    () => (movie ? catalogueService.getGenresForMovie(movie) : []),
    [movie]
  );

  const availableInCity = Boolean(movie && movie.cityIds.includes(selectedCity.id));

  const relatedMovies = useMemo(() => {
    if (!movie) return [];
    return catalogueService
      .getMoviesByCity(selectedCity.id, 'NOW_SHOWING')
      .filter((m) => m.id !== movie.id)
      .slice(0, 4);
  }, [movie, selectedCity.id]);

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          title="Movie not found"
          description="The film you are looking for is not in our current catalogue."
          action={
            <Link
              to="/movies"
              className="inline-flex items-center px-6 py-2.5 text-sm font-semibold rounded-full neu-btn-primary"
            >
              Browse All Movies
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Back navigation */}
      <Link
        to="/movies"
        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full neu-btn text-[#394A43]"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Movies</span>
      </Link>

      {/* Elegant Pastel Hero Card with Raised Poster & Booking Controls */}
      <section className="relative neu-card rounded-[34px] p-6 sm:p-10 lg:p-12 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-14 w-60 h-60 rounded-[48%_52%_58%_42%/44%_50%_50%_56%] neu-shape-mint opacity-55"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 right-1/4 w-48 h-48 rounded-full neu-shape-peach opacity-55"
        />

        <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="md:col-span-4 lg:col-span-3 max-w-[270px] md:max-w-none">
            <div className="rounded-[26px] p-2.5 neu-floating">
              <div className="aspect-[3/4] rounded-[18px] overflow-hidden bg-[#ECE0CE]">
                <MediaImage
                  src={movie.posterUrl}
                  alt={`${movie.title} poster`}
                  title={movie.title}
                  loading="eager"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-8 lg:col-span-9 space-y-6">
            <div>
              <p className="text-xs font-semibold text-[#567360]">
                {movie.status === 'NOW_SHOWING' ? 'Now Showing' : 'Coming Soon'}
                <span className="mx-2" aria-hidden="true">
                  ·
                </span>
                {movie.certification}
                <span className="mx-2" aria-hidden="true">
                  ·
                </span>
                {genres.map((g) => g.name).join(' / ')}
              </p>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-[#394A43] mt-2">
                {movie.title}
              </h1>
              <p className="text-base text-[#5A6D65] mt-2">{movie.tagline}</p>
            </div>

            {/* Recessed Metrics Strip */}
            <div className="neu-inset-soft rounded-2xl px-5 py-3.5 inline-flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#394A43]">
              {movie.status === 'NOW_SHOWING' && (
                <span className="inline-flex items-center gap-1.5 font-bold tabular-nums">
                  <Star className="w-4 h-4 fill-[#718F7B] text-[#718F7B]" />
                  <span>{movie.rating.toFixed(1)} / 10</span>
                  <span className="text-[#5A6D65] font-normal">
                    ({formatVotes(movie.votesCount)} votes)
                  </span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-[#394A43] tabular-nums">
                <Clock className="w-4 h-4 text-[#718F7B]" />
                <span>{formatDuration(movie.durationMins)}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#394A43] tabular-nums">
                <Calendar className="w-4 h-4 text-[#718F7B]" />
                <span>{formatReleaseDate(movie.releaseDate)}</span>
              </span>
            </div>

            <div className="space-y-1.5 text-sm text-[#5A6D65]">
              <p>
                <span className="font-semibold text-[#394A43]">Languages:</span>{' '}
                {movie.languages.join(', ')}
              </p>
              <p>
                <span className="font-semibold text-[#394A43]">Formats:</span>{' '}
                {movie.formats.join(' · ')}
              </p>
              <p>
                <span className="font-semibold text-[#394A43]">Director:</span>{' '}
                {movie.director}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              {movie.status === 'NOW_SHOWING' && availableInCity ? (
                <Link
                  to={`/movies/${movie.id}/shows`}
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-full neu-btn-primary whitespace-nowrap"
                >
                  <span>Select Showtime in {selectedCity.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : movie.status === 'NOW_SHOWING' && !availableInCity ? (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-medium text-[#6D3F2F]">
                    Not currently scheduled in {selectedCity.name}.
                  </p>
                  <button
                    type="button"
                    onClick={openCityModal}
                    className="px-5 py-2.5 text-sm font-semibold rounded-full neu-btn-peach cursor-pointer"
                  >
                    Switch City
                  </button>
                </div>
              ) : (
                <div className="neu-card-peach rounded-2xl px-5 py-3 text-sm font-medium text-[#394A43]">
                  Scheduled theatrical release on {formatReleaseDate(movie.releaseDate)}. Showtimes
                  will open prior to release.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Synopsis & Cast Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 neu-card-white rounded-[28px] p-7 sm:p-8 space-y-4">
          <h2 className="font-display text-2xl font-bold text-[#394A43]">About the Film</h2>
          <p className="text-base text-[#5A6D65] leading-relaxed max-w-[66ch]">
            {movie.synopsis}
          </p>
        </div>

        <div className="lg:col-span-5 neu-card-white rounded-[28px] p-7 sm:p-8">
          <h2 className="font-display text-2xl font-bold text-[#394A43] mb-4">Cast & Crew</h2>
          <div className="divide-y divide-[#394A43]/10">
            <div className="py-3 flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-[#394A43]">{movie.director}</span>
              <span className="text-xs text-[#5A6D65]">Director</span>
            </div>
            {movie.cast.map((member) => (
              <div
                key={`${member.name}-${member.role}`}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-bold text-[#394A43]">{member.name}</p>
                  {member.character && (
                    <p className="text-xs text-[#5A6D65]">as {member.character}</p>
                  )}
                </div>
                <span className="text-xs text-[#5A6D65] shrink-0">{member.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Films */}
      {relatedMovies.length > 0 && (
        <section className="pt-4">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-semibold text-[#567360]">Continue Exploring</p>
              <h2 className="font-display text-2xl font-extrabold text-[#394A43] mt-1">
                Also Playing in {selectedCity.name}
              </h2>
            </div>
            <Link
              to="/movies"
              className="text-sm font-semibold text-[#567360] hover:text-[#394A43] whitespace-nowrap"
            >
              All movies
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
            {relatedMovies.map((item) => (
              <MovieCard key={item.id} movie={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
