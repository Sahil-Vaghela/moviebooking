import { formatDateLabel, getIsoDateForOffset } from './formatters';
import type { Screen, Show } from '../types/catalogue';
import type { PriceBreakdown, SeatNode, ShowSeatRecord } from '../types/booking';

export const MAX_SEATS_PER_BOOKING = 10;
export const CONVENIENCE_FEE_PER_TICKET_INR = 32;
export const GST_RATE = 0.18;

export interface SeatRowGroup {
  tier: 'PLATINUM' | 'GOLD' | 'SILVER';
  tierLabel: string;
  priceInr: number;
  aisleAfterColumns: number[];
  rows: {
    rowLabel: string;
    seats: SeatNode[];
  }[];
}

export function computeTierShowPrice(basePriceInr: number, priceMultiplier: number): number {
  return Math.round((basePriceInr * priceMultiplier) / 10) * 10;
}

export function buildSeatMap(
  screen: Screen,
  show: Show,
  liveSeats: ShowSeatRecord[],
  selectedSeatIds: string[]
): SeatRowGroup[] {
  const liveBySeatId = new Map<string, ShowSeatRecord>();
  liveSeats.forEach((record) => {
    liveBySeatId.set(record.seatId, record);
  });

  const hasLiveSeatData = liveSeats.length > 0;
  const sampleOccupiedSet = new Set(show.sampleOccupiedSeats);
  const selectedSet = new Set(selectedSeatIds);

  return screen.tiers.map((tierConfig) => {
    const computedPrice = computeTierShowPrice(tierConfig.basePriceInr, show.priceMultiplier);
    const rows = tierConfig.rows.map((rowLabel) => {
      const seats: SeatNode[] = [];
      for (let seatNum = 1; seatNum <= tierConfig.seatsPerRow; seatNum++) {
        const seatId = `${rowLabel}${seatNum}`;
        const liveSeat = liveBySeatId.get(seatId);

        let status: SeatNode['status'] = 'AVAILABLE';
        let priceInr = computedPrice;

        if (liveSeat) {
          status = liveSeat.status;
          priceInr = liveSeat.priceInr;
        } else if (!hasLiveSeatData && sampleOccupiedSet.has(seatId)) {
          // Visual catalogue preview occupancy only; never treated as a committed reservation
          status = 'BOOKED';
        }

        if (status === 'AVAILABLE' && selectedSet.has(seatId)) {
          status = 'SELECTED';
        }

        seats.push({
          seatId,
          row: rowLabel,
          number: seatNum,
          tier: tierConfig.tier,
          tierLabel: tierConfig.label,
          priceInr,
          status,
        });
      }
      return { rowLabel, seats };
    });

    return {
      tier: tierConfig.tier,
      tierLabel: tierConfig.label,
      priceInr: computedPrice,
      aisleAfterColumns: tierConfig.aisleAfterColumns,
      rows,
    };
  });
}

export function calculatePriceBreakdown(seats: SeatNode[]): PriceBreakdown {
  const ticketCount = seats.length;
  const subtotalInr = seats.reduce((sum, s) => sum + s.priceInr, 0);
  const convenienceFeeInr = ticketCount * CONVENIENCE_FEE_PER_TICKET_INR;
  const gstInr = Math.round(convenienceFeeInr * GST_RATE);
  const totalInr = subtotalInr + convenienceFeeInr + gstInr;

  return {
    ticketCount,
    subtotalInr,
    convenienceFeeInr,
    gstInr,
    totalInr,
  };
}

export function getShowDateMeta(offsetDays: number) {
  return {
    offsetDays,
    isoDate: getIsoDateForOffset(offsetDays),
    label: formatDateLabel(offsetDays),
  };
}
