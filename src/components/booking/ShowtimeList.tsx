import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { formatInr, formatShowtime12h } from '../../utils/formatters';
import { computeTierShowPrice } from '../../utils/seatLayout';
import type { TheatreShowGroup } from '../../services/catalogueService';

interface ShowtimeListProps {
  groups: TheatreShowGroup[];
}

function getAvailabilityMeta(status: 'AVAILABLE' | 'FAST_FILLING' | 'ALMOST_FULL') {
  switch (status) {
    case 'ALMOST_FULL':
      return {
        label: 'Almost full',
        dotClass: 'text-[#8C4D38]',
      };
    case 'FAST_FILLING':
      return {
        label: 'Fast filling',
        dotClass: 'text-[#82642D]',
      };
    default:
      return {
        label: 'Available',
        dotClass: 'text-[#4B6B56]',
      };
  }
}

export function ShowtimeList({ groups }: ShowtimeListProps) {
  return (
    <div className="space-y-6">
      {groups.map(({ theatre, shows }) => (
        <div
          key={theatre.id}
          className="neu-card-white rounded-[28px] p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center gap-6"
        >
          <div className="lg:w-80 shrink-0">
            <p className="text-xs font-semibold text-[#567360]">{theatre.chain}</p>
            <h3 className="font-display text-lg font-bold text-[#394A43] mt-0.5">
              {theatre.name}
            </h3>
            <p className="mt-1.5 text-xs text-[#5A6D65] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#718F7B] shrink-0" />
              <span>{theatre.locality}</span>
            </p>
            <p className="mt-2.5 text-xs text-[#5A6D65] leading-relaxed">
              {theatre.amenities.slice(0, 3).join(' · ')}
              {theatre.cancellationAllowed ? ' · Cancellation available' : ' · Non-cancellable'}
            </p>
          </div>

          <div className="flex-1 flex flex-wrap gap-3.5">
            {shows.map(({ show, screen }) => {
              const availability = getAvailabilityMeta(show.fillingStatus);
              const startingPrice = computeTierShowPrice(
                screen.tiers[screen.tiers.length - 1]?.basePriceInr ?? 220,
                show.priceMultiplier
              );

              return (
                <Link
                  key={show.id}
                  to={`/shows/${show.id}/seats`}
                  className="group neu-showtime-pill rounded-full px-6 py-3 flex flex-col items-center justify-center min-w-[152px] text-center"
                >
                  <div className="font-mono text-sm font-bold text-[#394A43] tabular-nums">
                    {formatShowtime12h(show.startTime)}
                  </div>
                  <div className="text-[11px] text-[#5A6D65] mt-0.5 whitespace-nowrap">
                    {show.format} · {show.language}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px]">
                    <span className={`font-semibold ${availability.dotClass}`}>
                      {availability.label}
                    </span>
                    <span aria-hidden="true" className="text-[#5A6D65]/50">
                      ·
                    </span>
                    <span className="font-mono text-[#394A43] tabular-nums">
                      {formatInr(startingPrice)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
