import { collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { db } from './client';
import { handleFirestoreError, OperationType } from './errorHandler';
import type { PaymentProvider, PaymentRecord, PaymentStatus } from '../../types/booking';

const COLLECTION = 'payments';

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

/**
 * Read-only Firestore repository for server-verified payment ledger records.
 * Payment initialization and webhook verification occur exclusively in Cloud Functions.
 */
export const paymentsRepository = {
  async listByUser(userId: string): Promise<PaymentRecord[]> {
    try {
      const q = query(collection(db, COLLECTION), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            userId: String(data.userId ?? userId),
            bookingId: String(data.bookingId ?? ''),
            provider: (data.provider as PaymentProvider) ?? 'RAZORPAY',
            amountInr: Number(data.amountInr ?? 0),
            currency: 'INR' as const,
            status: (data.status as PaymentStatus) ?? 'INITIATED',
            gatewayOrderId:
              typeof data.gatewayOrderId === 'string' ? data.gatewayOrderId : undefined,
            createdAt: toIso(data.createdAt),
            updatedAt: toIso(data.updatedAt),
          };
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION);
    }
  },
};
