import { formatInr } from '../../utils/formatters';
import type { SeatNode } from '../../types/booking';
import type { SeatRowGroup } from '../../utils/seatLayout';

interface SeatGridProps {
  groups: SeatRowGroup[];
  onToggleSeat: (seat: SeatNode) => void;
}

export function SeatGrid({ groups, onToggleSeat }: SeatGridProps) {
  return (
    <div className="neu-card rounded-[32px] p-5 sm:p-9">
      {/* Sculpted Curved Screen Indicator */}
      <div className="max-w-xl mx-auto mb-10 text-center">
        <div
          className="h-3 rounded-b-full mx-6 bg-gradient-to-r from-[#B9DAD3] via-[#718F7B] to-[#B9DAD3] shadow-[0_8px_18px_rgba(113,143,123,0.3)]"
          aria-hidden="true"
        />
        <p className="text-xs font-semibold text-[#5A6D65] mt-3 tracking-wide">
          All eyes this way · Auditorium Screen
        </p>
      </div>

      {/* Recessed Auditorium Floor */}
      <div className="neu-inset rounded-[26px] p-4 sm:p-7 overflow-x-auto">
        <div className="min-w-[540px] max-w-3xl mx-auto space-y-8">
          {groups.map((group) => (
            <div key={group.tier}>
              <div className="flex items-baseline justify-between border-b border-[#394A43]/10 pb-2 mb-4">
                <h3 className="text-xs font-bold text-[#394A43]">{group.tierLabel}</h3>
                <span className="font-mono text-xs font-semibold text-[#567360] tabular-nums">
                  {formatInr(group.priceInr)}
                </span>
              </div>

              <div className="space-y-2.5">
                {group.rows.map((row) => (
                  <div key={row.rowLabel} className="flex items-center justify-center gap-2.5">
                    <span className="w-6 text-xs font-mono font-semibold text-[#5A6D65] text-left shrink-0">
                      {row.rowLabel}
                    </span>

                    <div className="flex items-center gap-2">
                      {row.seats.map((seat) => {
                        const hasAisleAfter = group.aisleAfterColumns.includes(seat.number);
                        const isInteractive =
                          seat.status === 'AVAILABLE' || seat.status === 'SELECTED';

                        let seatClasses = 'neu-seat-available cursor-pointer';
                        if (seat.status === 'SELECTED') {
                          seatClasses = 'neu-seat-selected cursor-pointer';
                        } else if (seat.status === 'BOOKED' || seat.status === 'BLOCKED') {
                          seatClasses = 'neu-seat-booked';
                        } else if (seat.status === 'LOCKED') {
                          seatClasses = 'neu-seat-locked';
                        }

                        return (
                          <div
                            key={seat.seatId}
                            className={`flex items-center ${hasAisleAfter ? 'mr-5' : ''}`}
                          >
                            <button
                              type="button"
                              disabled={!isInteractive}
                              onClick={() => onToggleSeat(seat)}
                              title={`${seat.seatId} · ${seat.tierLabel} · ${formatInr(seat.priceInr)} (${seat.status.toLowerCase()})`}
                              aria-label={`Seat ${seat.seatId}, ${seat.tierLabel}, ${formatInr(seat.priceInr)}, ${seat.status.toLowerCase()}`}
                              aria-pressed={seat.status === 'SELECTED'}
                              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-mono text-xs font-semibold tabular-nums flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#567360] ${seatClasses}`}
                            >
                              {seat.number}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <span className="w-6 text-xs font-mono font-semibold text-[#5A6D65] text-right shrink-0">
                      {row.rowLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explicit Accessible Tactile Legend */}
      <div className="mt-7 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-[#5A6D65]">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-lg neu-seat-available inline-block" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-lg neu-seat-selected inline-block" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-lg neu-seat-locked inline-block" />
          <span>Held by another guest</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-lg neu-seat-booked inline-block" />
          <span>Occupied / Booked</span>
        </div>
      </div>
    </div>
  );
}
