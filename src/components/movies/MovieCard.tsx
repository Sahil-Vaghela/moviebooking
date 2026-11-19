import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { MediaImage } from '../common/MediaImage';
import { catalogueService } from '../../services/catalogueService';
import { formatReleaseDate, formatVotes } from '../../utils/formatters';
import type { Movie } from '../../types/catalogue';

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const genres = catalogueService.getGenresForMovie(movie);
  const genreLine = genres.map((g) => g.name).join(' / ');
  const langLine = movie.languages.slice(0, 2).join(', ');

  return (
    <Link
      to={`/movies/${movie.id}`}
      className="group block rounded-[26px] p-3 neu-card-white transition-transform duration-200 ease-out hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#567360]"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[18px] bg-[#ECE0CE]">
        <MediaImage
          src={movie.posterUrl}
          alt={`${movie.title} theatrical poster`}
          title={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
      </div>

      <div className="pt-3.5 px-1 pb-1">
        <div className="flex items-center justify-between gap-2 text-xs text-[#5A6D65] mb-1">
          {movie.status === 'NOW_SHOWING' ? (
            <span className="inline-flex items-center gap-1 font-semibold text-[#394A43] tabular-nums">
              <Star className="w-3.5 h-3.5 fill-[#718F7B] text-[#718F7B]" />
              <span>{movie.rating.toFixed(1)}</span>
              <span className="font-normal text-[#5A6D65]">
                · {formatVotes(movie.votesCount)}
              </span>
            </span>
          ) : (
            <span className="font-semibold text-[#567360] tabular-nums">
              {formatReleaseDate(movie.releaseDate)}
            </span>
          )}
          <span className="font-mono text-[11px] text-[#5A6D65]">{movie.certification}</span>
        </div>

        <h3 className="font-display text-base font-bold text-[#394A43] group-hover:text-[#567360] transition-colors truncate">
          {movie.title}
        </h3>
        <p className="text-xs text-[#5A6D65] mt-1 truncate">
          {genreLine}
          <span className="mx-1.5" aria-hidden="true">
            ·
          </span>
          {langLine}
        </p>
      </div>
    </Link>
  );
}
