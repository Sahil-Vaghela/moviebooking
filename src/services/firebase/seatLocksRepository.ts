import { collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { db } from './client';
import { handleFirestoreError, OperationType } from './errorHandler';
import type { SeatLockRecord, SeatLockStatus } from '../../types/booking';

const COLLECTION = 'seatLocks';

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

/**
 * Read-only Firestore repository for temporary server-held seatLocks.
 * Acquiring or releasing locks must occur exclusively through Cloud Functions.
 */
export const seatLocksRepository = {
  async listActiveByUser(userId: string): Promise<SeatLockRecord[]> {
    try {
      const q = query(collection(db, COLLECTION), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            userId: String(data.userId ?? userId),
            showId: String(data.showId ?? ''),
            seatIds: Array.isArray(data.seatIds) ? data.seatIds.map(String) : [],
            status: (data.status as SeatLockStatus) ?? 'ACTIVE',
            expiresAt: toIso(data.expiresAt),
            createdAt: toIso(data.createdAt),
          };
        })
        .filter((lock) => lock.status === 'ACTIVE');
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION);
    }
  },
};
