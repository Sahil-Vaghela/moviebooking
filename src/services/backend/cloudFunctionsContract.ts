import { auth } from '../firebase/client';
import type {
  BookingRecord,
  PaymentProvider,
  SeatLockRecord,
} from '../../types/booking';

export interface AcquireSeatLockRequest {
  showId: string;
  seatIds: string[];
  showDateIso: string;
  idempotencyKey: string;
}

export interface CreatePaymentIntentRequest {
  lockId: string;
  showId: string;
  seatIds: string[];
  provider: PaymentProvider;
  expectedTotalInr: number;
}

export interface PaymentIntentResponse {
  paymentId: string;
  gatewayOrderId: string;
  provider: PaymentProvider;
  amountInr: number;
  currency: 'INR';
  expiresAt: string;
}

export interface VerifyPaymentRequest {
  paymentId: string;
  lockId: string;
  gatewayPaymentId: string;
  gatewaySignature: string;
}

export type BackendActionResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      code: 'BACKEND_NOT_DEPLOYED' | 'UNAUTHENTICATED' | 'REQUEST_FAILED';
      message: string;
      endpoint: string;
      requestPayload: unknown;
    };

export interface SecureTicketingBackend {
  isConfigured(): boolean;
  getBaseUrl(): string;
  acquireSeatLock(
    payload: AcquireSeatLockRequest
  ): Promise<BackendActionResult<SeatLockRecord>>;
  releaseSeatLock(lockId: string): Promise<BackendActionResult<{ released: boolean }>>;
  createPaymentIntent(
    payload: CreatePaymentIntentRequest
  ): Promise<BackendActionResult<PaymentIntentResponse>>;
  verifyPaymentAndConfirmBooking(
    payload: VerifyPaymentRequest
  ): Promise<BackendActionResult<BookingRecord>>;
}

function getFunctionsBaseUrl(): string {
  const raw = (import.meta.env as Record<string, string | undefined>)
    .VITE_CLOUD_FUNCTIONS_BASE_URL;
  return (raw ?? '').trim().replace(/\/+$/, '');
}

async function invokeBackendEndpoint<T>(
  path: string,
  payload: unknown
): Promise<BackendActionResult<T>> {
  const baseUrl = getFunctionsBaseUrl();
  const endpoint = `${baseUrl || '<VITE_CLOUD_FUNCTIONS_BASE_URL>'}${path}`;

  if (!auth.currentUser) {
    return {
      ok: false,
      code: 'UNAUTHENTICATED',
      message: 'Sign in with your Marquee account before requesting a server-side seat lock.',
      endpoint,
      requestPayload: payload,
    };
  }

  // Never fake atomic seat locks, payment gateway verification, or confirmed tickets client-side.
  if (!baseUrl) {
    return {
      ok: false,
      code: 'BACKEND_NOT_DEPLOYED',
      message:
        'Secure Cloud Functions backend is not configured in this environment. Set VITE_CLOUD_FUNCTIONS_BASE_URL to connect atomic seat locking, payment verification, and booking issuance.',
      endpoint,
      requestPayload: payload,
    };
  }

  try {
    const idToken = await auth.currentUser.getIdToken();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      return {
        ok: false,
        code: 'REQUEST_FAILED',
        message: errorText || `Backend responded with HTTP ${response.status}.`,
        endpoint,
        requestPayload: payload,
      };
    }

    const data = (await response.json()) as T;
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      code: 'REQUEST_FAILED',
      message:
        error instanceof Error
          ? error.message
          : 'Network error while contacting Cloud Functions endpoint.',
      endpoint,
      requestPayload: payload,
    };
  }
}

export const cloudFunctionsTicketingService: SecureTicketingBackend = {
  isConfigured(): boolean {
    return getFunctionsBaseUrl().length > 0;
  },

  getBaseUrl(): string {
    return getFunctionsBaseUrl();
  },

  acquireSeatLock(payload) {
    return invokeBackendEndpoint<SeatLockRecord>('/ticketing/acquireSeatLock', payload);
  },

  releaseSeatLock(lockId) {
    return invokeBackendEndpoint<{ released: boolean }>('/ticketing/releaseSeatLock', {
      lockId,
    });
  },

  createPaymentIntent(payload) {
    return invokeBackendEndpoint<PaymentIntentResponse>(
      '/payments/createIntent',
      payload
    );
  },

  verifyPaymentAndConfirmBooking(payload) {
    return invokeBackendEndpoint<BookingRecord>(
      '/bookings/verifyPaymentAndConfirm',
      payload
    );
  },
};
