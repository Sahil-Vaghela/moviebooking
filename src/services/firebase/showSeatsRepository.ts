import {
  collection,
  getDocs,
  onSnapshot,
  query,
  Timestamp,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './client';
import { handleFirestoreError, OperationType } from './errorHandler';
import type { SeatTier, ShowSeatRecord } from '../../types/booking';

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

function mapDocToShowSeat(seatId: string, showId: string, data: Record<string, unknown>): ShowSeatRecord {
  return {
    showId: String(data.showId ?? showId),
    seatId: String(data.seatId ?? seatId),
    status: (data.status as ShowSeatRecord['status']) ?? 'AVAILABLE',
    tier: (data.tier as SeatTier) ?? 'GOLD',
    priceInr: Number(data.priceInr ?? 0),
    updatedAt: toIso(data.updatedAt),
  };
}

/**
 * Read-only Firestore repository for live show seat inventory under /showSeats/{showId}/seats.
 * Seat locks and bookings are written exclusively by server-side Cloud Functions.
 */
export const showSeatsRepository = {
  async listByShow(showId: string): Promise<ShowSeatRecord[]> {
    const path = `showSeats/${showId}/seats`;
    try {
      const q = query(collection(db, 'showSeats', showId, 'seats'), where('showId', '==', showId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => mapDocToShowSeat(d.id, showId, d.data()));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  subscribeByShow(
    showId: string,
    onData: (seats: ShowSeatRecord[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    const path = `showSeats/${showId}/seats`;
    const q = query(collection(db, 'showSeats', showId, 'seats'), where('showId', '==', showId));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => mapDocToShowSeat(d.id, showId, d.data()));
        onData(items);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (wrapped) {
          onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
        }
      }
    );
  },
};
