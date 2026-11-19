export type SeatTier = 'PLATINUM' | 'GOLD' | 'SILVER';
export type SeatStatus = 'AVAILABLE' | 'LOCKED' | 'BOOKED' | 'BLOCKED' | 'SELECTED';

export interface SeatNode {
  seatId: string;
  row: string;
  number: number;
  tier: SeatTier;
  tierLabel: string;
  priceInr: number;
  status: SeatStatus;
}

export interface ShowSeatRecord {
  showId: string;
  seatId: string;
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED' | 'BLOCKED';
  tier: SeatTier;
  priceInr: number;
  updatedAt: string;
}

export type SeatLockStatus = 'ACTIVE' | 'CONSUMED' | 'RELEASED' | 'EXPIRED';

export interface SeatLockRecord {
  id: string;
  userId: string;
  showId: string;
  seatIds: string[];
  status: SeatLockStatus;
  expiresAt: string;
  createdAt: string;
}

export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED';

export interface BookingRecord {
  id: string;
  userId: string;
  showId: string;
  movieId: string;
  theatreId: string;
  cityId: string;
  seatIds: string[];
  subtotalInr: number;
  convenienceFeeInr: number;
  gstInr: number;
  totalInr: number;
  status: BookingStatus;
  paymentId?: string;
  bookingCode?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentProvider = 'RAZORPAY' | 'STRIPE' | 'UPI_INTENT';
export type PaymentStatus = 'INITIATED' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';

export interface PaymentRecord {
  id: string;
  userId: string;
  bookingId: string;
  provider: PaymentProvider;
  amountInr: number;
  currency: 'INR';
  status: PaymentStatus;
  gatewayOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceBreakdown {
  ticketCount: number;
  subtotalInr: number;
  convenienceFeeInr: number;
  gstInr: number;
  totalInr: number;
}

export interface BookingDraft {
  showId: string;
  movieId: string;
  cityId: string;
  theatreId: string;
  screenId: string;
  showDateIso: string;
  selectedSeats: SeatNode[];
}
