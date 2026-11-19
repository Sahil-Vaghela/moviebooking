import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { catalogueService } from '../services/catalogueService';
import { useShowSeats } from '../hooks/useShowSeats';
import { useBookingDraft } from '../context/BookingDraftContext';
import { SeatGrid } from '../components/booking/SeatGrid';
import { EmptyState, ErrorState, LoadingState } from '../components/common/StateBlocks';
import { formatInr, formatShowtime12h } from '../utils/formatters';
import {
  buildSeatMap,
  calculatePriceBreakdown,
  getShowDateMeta,
  MAX_SEATS_PER_BOOKING,
} from '../utils/seatLayout';
import type { SeatNode } from '../types/booking';

export function SeatSelectionPage() {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const { draft, setDraft } = useBookingDraft();

  const context = useMemo(
    () => (showId ? catalogueService.getShowContext(showId) : null),
    [showId]
  );

  const { liveSeats, hasLiveInventory, loading, error } = useShowSeats(showId);

  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>(() =>
    draft && draft.showId === showId ? draft.selectedSeats.map((s) => s.seatId) : []
  );
  const [limitNotice, setLimitNotice] = useState<string | null>(null);

  const seatGroups = useMemo(() => {
    if (!context) return [];
    return buildSeatMap(context.screen, context.show, liveSeats, selectedSeatIds);
  }, [context, liveSeats, selectedSeatIds]);

  const selectedSeatNodes = useMemo(() => {
    const selected: SeatNode[] = [];
    seatGroups.forEach((group) => {
      group.rows.forEach((row) => {
        row.seats.forEach((seat) => {
          if (seat.status === 'SELECTED') {
            selected.push(seat);
          }
        });
      });
    });
    return selected;
  }, [seatGroups]);

  const breakdown = useMemo(
    () => calculatePriceBreakdown(selectedSeatNodes),
    [selectedSeatNodes]
  );

  if (!context) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          title="Showtime not found"
          description="This screening ID does not exist in the current schedule."
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

  const { show, movie, theatre, screen, city } = context;
  const dateMeta = getShowDateMeta(show.dateOffsetDays);

  const handleToggleSeat = (seat: SeatNode) => {
    setLimitNotice(null);
    setSelectedSeatIds((prev) => {
      if (prev.includes(seat.seatId)) {
        return prev.filter((id) => id !== seat.seatId);
      }
      if (prev.length >= MAX_SEATS_PER_BOOKING) {
        setLimitNotice(`You can select up to ${MAX_SEATS_PER_BOOKING} seats per order.`);
        return prev;
      }
      return [...prev, seat.seatId];
    });
  };

  const handleProceedToCheckout = () => {
    if (selectedSeatNodes.length === 0) return;
    setDraft({
      showId: show.id,
      movieId: movie.id,
      cityId: city.id,
      theatreId: theatre.id,
      screenId: screen.id,
      showDateIso: dateMeta.isoDate,
      selectedSeats: selectedSeatNodes,
    });
    navigate('/checkout');
  };

  return (
    <div className="pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <Link
          to={`/movies/${movie.id}/shows`}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full neu-btn text-[#394A43]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change Showtime</span>
        </Link>

        {/* Elevated Screening Context Header */}
        <div className="neu-card-white rounded-[28px] p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#567360]">Seat Selection</p>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#394A43] mt-0.5">
              {movie.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#5A6D65] mt-1">
              {theatre.name}, {city.name} · {screen.name} · {show.language} ({show.format})
            </p>
          </div>
          <div className="neu-inset-soft rounded-2xl px-4 py-2.5 self-start md:self-auto">
            <p className="font-mono text-sm font-bold text-[#394A43] tabular-nums">
              {dateMeta.label.full} · {formatShowtime12h(show.startTime)}
            </p>
          </div>
        </div>

        {/* Transparent Inventory Mode Notice */}
        <div className="neu-inset-soft rounded-2xl p-4 flex items-start gap-3 text-xs text-[#5A6D65]">
          <Info className="w-4 h-4 text-[#567360] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {hasLiveInventory ? (
              <>
                Displaying live seat availability synced from Firestore{' '}
                <code className="font-mono text-[#394A43]">showSeats/{show.id}</code>. Atomic seat
                locking occurs server-side when proceeding to checkout.
              </>
            ) : (
              <>
                Showing auditorium layout preview from local catalogue data. Live seat locks and
                inventory mutations are enforced exclusively by secure Cloud Functions in
                production and are never simulated in the browser.
              </>
            )}
          </p>
        </div>

        {limitNotice && (
          <div
            role="status"
            className="neu-card-peach rounded-2xl p-4 text-xs font-semibold text-[#394A43]"
          >
            {limitNotice}
          </div>
        )}

        {error && <ErrorState title="Live seat sync notice" description={error} />}

        {loading ? (
          <LoadingState label="Syncing auditorium seat map..." />
        ) : (
          <SeatGrid groups={seatGroups} onToggleSeat={handleToggleSeat} />
        )}
      </div>

      {/* Compact Tactile Sticky Bottom Selection Bar */}
      {selectedSeatNodes.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-[#FFFCF5]/95 backdrop-blur-md border-t border-[#FFFCF5] shadow-[0_-10px_26px_rgba(145,130,108,0.2)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-[#5A6D65] truncate">
                {selectedSeatNodes.length}{' '}
                {selectedSeatNodes.length === 1 ? 'seat' : 'seats'}:{' '}
                <span className="font-mono font-bold text-[#394A43]">
                  {selectedSeatNodes.map((s) => s.seatId).join(', ')}
                </span>
              </p>
              <p className="font-display text-lg font-extrabold text-[#394A43] tabular-nums leading-tight">
                {formatInr(breakdown.subtotalInr)}{' '}
                <span className="text-xs font-sans font-normal text-[#5A6D65]">
                  + taxes at checkout
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedSeatIds([])}
                className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold rounded-full neu-btn cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-full neu-btn-primary whitespace-nowrap cursor-pointer"
              >
                <span>Continue to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
