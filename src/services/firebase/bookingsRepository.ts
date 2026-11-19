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
import type { BookingRecord, BookingStatus } from '../../types/booking';

const COLLECTION = 'bookings';

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

function mapDocToBooking(id: string, data: Record<string, unknown>): BookingRecord {
  return {
    id,
    userId: String(data.userId ?? ''),
    showId: String(data.showId ?? ''),
    movieId: String(data.movieId ?? ''),
    theatreId: String(data.theatreId ?? ''),
    cityId: String(data.cityId ?? ''),
    seatIds: Array.isArray(data.seatIds) ? data.seatIds.map(String) : [],
    subtotalInr: Number(data.subtotalInr ?? 0),
    convenienceFeeInr: Number(data.convenienceFeeInr ?? 0),
    gstInr: Number(data.gstInr ?? 0),
    totalInr: Number(data.totalInr ?? 0),
    status: (data.status as BookingStatus) ?? 'PENDING_PAYMENT',
    paymentId: typeof data.paymentId === 'string' ? data.paymentId : undefined,
    bookingCode: typeof data.bookingCode === 'string' ? data.bookingCode : undefined,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

/**
 * Read-only Firestore repository for server-minted bookings.
 * Creating or mutating bookings is intentionally blocked in Firestore Rules
 * and delegated exclusively to secure backend Cloud Functions.
 */
export const bookingsRepository = {
  async listByUser(userId: string): Promise<BookingRecord[]> {
    try {
      const q = query(collection(db, COLLECTION), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((d) => mapDocToBooking(d.id, d.data()))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION);
    }
  },

  subscribeByUser(
    userId: string,
    onData: (bookings: BookingRecord[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    const q = query(collection(db, COLLECTION), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs
          .map((d) => mapDocToBooking(d.id, d.data()))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        onData(items);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, COLLECTION);
        } catch (wrapped) {
          onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
        }
      }
    );
  },
};
