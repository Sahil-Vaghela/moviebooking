import { formatInr, formatShowtime12h } from '../../utils/formatters';
import { calculatePriceBreakdown, getShowDateMeta } from '../../utils/seatLayout';
import type { City, Movie, Screen, Show, Theatre } from '../../types/catalogue';
import type { SeatNode } from '../../types/booking';

interface OrderSummaryProps {
  movie: Movie;
  theatre: Theatre;
  screen: Screen;
  city: City;
  show: Show;
  selectedSeats: SeatNode[];
}

export function OrderSummary({
  movie,
  theatre,
  screen,
  city,
  show,
  selectedSeats,
}: OrderSummaryProps) {
  const breakdown = calculatePriceBreakdown(selectedSeats);
  const dateMeta = getShowDateMeta(show.dateOffsetDays);

  return (
    <div className="neu-card-white rounded-[30px] p-6 sm:p-7 space-y-6">
      <div>
        <p className="text-xs font-semibold text-[#567360]">Booking Summary</p>
        <h2 className="font-display text-2xl font-bold text-[#394A43] mt-1">{movie.title}</h2>
        <p className="text-xs text-[#5A6D65] mt-1">
          {show.language} · {show.format} · {movie.certification}
        </p>
      </div>

      <div className="neu-inset-soft rounded-2xl p-4 space-y-2.5 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-[#5A6D65]">Venue</span>
          <span className="text-[#394A43] font-semibold text-right">
            {theatre.name}, {city.name}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#5A6D65]">Screen</span>
          <span className="text-[#394A43] text-right">{screen.name}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#5A6D65]">Date & Time</span>
          <span className="text-[#394A43] font-semibold text-right tabular-nums">
            {dateMeta.label.full} · {formatShowtime12h(show.startTime)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#5A6D65]">Seats ({selectedSeats.length})</span>
          <span className="font-mono text-[#394A43] font-semibold text-right">
            {selectedSeats.map((s) => s.seatId).join(', ')}
          </span>
        </div>
      </div>

      <div className="space-y-2.5 text-sm px-1">
        <div className="flex justify-between">
          <span className="text-[#5A6D65]">
            Tickets ({breakdown.ticketCount}{' '}
            {breakdown.ticketCount === 1 ? 'seat' : 'seats'})
          </span>
          <span className="font-mono text-[#394A43] tabular-nums">
            {formatInr(breakdown.subtotalInr)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#5A6D65]">Convenience Fee</span>
          <span className="font-mono text-[#394A43] tabular-nums">
            {formatInr(breakdown.convenienceFeeInr)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#5A6D65]">GST on Convenience Fee (18%)</span>
          <span className="font-mono text-[#394A43] tabular-nums">
            {formatInr(breakdown.gstInr)}
          </span>
        </div>
      </div>

      <div className="neu-card-mint rounded-2xl p-4 flex items-baseline justify-between">
        <span className="text-sm font-bold text-[#394A43]">Estimated Payable</span>
        <span className="font-display text-2xl font-extrabold text-[#394A43] tabular-nums">
          {formatInr(breakdown.totalInr)}
        </span>
      </div>
    </div>
  );
}
