import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBookingDraft } from '../context/BookingDraftContext';
import { catalogueService } from '../services/catalogueService';
import {
  cloudFunctionsTicketingService,
  type BackendActionResult,
} from '../services/backend/cloudFunctionsContract';
import { OrderSummary } from '../components/booking/OrderSummary';
import { EmptyState } from '../components/common/StateBlocks';
import { calculatePriceBreakdown } from '../utils/seatLayout';
import type { PaymentProvider, SeatLockRecord } from '../types/booking';

const PAYMENT_OPTIONS: { id: PaymentProvider; label: string; detail: string }[] = [
  { id: 'UPI_INTENT', label: 'UPI (GPay, PhonePe, BHIM)', detail: 'Instant server-verified UPI intent' },
  { id: 'RAZORPAY', label: 'Cards / NetBanking (Razorpay)', detail: 'Visa, Mastercard, RuPay & Indian banks' },
  { id: 'STRIPE', label: 'International Cards (Stripe)', detail: '3D Secure tokenized card checkout' },
];

export function CheckoutPage() {
  const { user, profile } = useAuth();
  const { draft, clearDraft } = useBookingDraft();

  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('UPI_INTENT');
  const [submitting, setSubmitting] = useState(false);
  const [backendResult, setBackendResult] =
    useState<BackendActionResult<SeatLockRecord> | null>(null);
  const [showPayload, setShowPayload] = useState(false);

  const context = useMemo(
    () => (draft ? catalogueService.getShowContext(draft.showId) : null),
    [draft]
  );

  if (!draft || !context || draft.selectedSeats.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          title="No seats selected for checkout"
          description="Choose a movie, pick a theatre showtime, and select your preferred seats before reviewing checkout."
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
  const breakdown = calculatePriceBreakdown(draft.selectedSeats);

  const handleRequestLockAndPayment = async () => {
    setSubmitting(true);
    setBackendResult(null);

    const idempotencyKey = `${show.id}_${draft.selectedSeats
      .map((s) => s.seatId)
      .sort()
      .join('-')}_${Date.now()}`;

    const lockResult = await cloudFunctionsTicketingService.acquireSeatLock({
      showId: show.id,
      seatIds: draft.selectedSeats.map((s) => s.seatId),
      showDateIso: draft.showDateIso,
      idempotencyKey,
    });

    setBackendResult(lockResult);
    setSubmitting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-7">
      <Link
        to={`/shows/${show.id}/seats`}
        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full neu-btn text-[#394A43]"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Modify Seat Selection</span>
      </Link>

      <div>
        <p className="text-xs font-semibold text-[#567360]">Checkout Review</p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#394A43] tracking-tight mt-1">
          Review Seats & Payment
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customer Account, Payment Method & Backend Boundary */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Account Verification */}
          <div className="neu-card-white rounded-[28px] p-6 sm:p-7">
            <h2 className="font-display text-base font-bold text-[#394A43] mb-3">
              01. Account & Ticket Delivery
            </h2>
            {user ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-bold text-[#394A43]">
                    {profile?.displayName || user.displayName || 'Marquee Member'}
                  </p>
                  <p className="text-[#5A6D65]">{user.email}</p>
                  {profile?.phone && <p className="text-xs text-[#5A6D65] mt-0.5">{profile.phone}</p>}
                </div>
                <Link
                  to="/profile"
                  className="text-xs font-bold text-[#567360] hover:text-[#394A43] underline underline-offset-4"
                >
                  Edit contact details
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-[#5A6D65] leading-relaxed">
                  Sign in with your Marquee account so your seat lock and issued tickets can be
                  securely linked to your verified Firebase UID.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/login"
                    state={{ from: '/checkout' }}
                    className="px-6 py-2.5 text-sm font-semibold rounded-full neu-btn-primary"
                  >
                    Sign In to Continue
                  </Link>
                  <Link
                    to="/register"
                    state={{ from: '/checkout' }}
                    className="px-5 py-2.5 text-sm font-semibold rounded-full neu-btn"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Payment Provider Selection */}
          <div className="neu-card-white rounded-[28px] p-6 sm:p-7">
            <h2 className="font-display text-base font-bold text-[#394A43] mb-1">
              02. Payment Method
            </h2>
            <p className="text-xs text-[#5A6D65] mb-5">
              Payment orders are created and verified exclusively by server-side Cloud Functions.
            </p>

            <div className="space-y-3">
              {PAYMENT_OPTIONS.map((option) => {
                const active = selectedProvider === option.id;
                return (
                  <label
                    key={option.id}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl cursor-pointer transition-all ${
                      active ? 'neu-card-mint' : 'neu-inset-soft hover:bg-[#EFE4D4]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentProvider"
                      value={option.id}
                      checked={active}
                      onChange={() => setSelectedProvider(option.id)}
                      className="mt-1 accent-[#567360]"
                    />
                    <div>
                      <div className="text-sm font-bold text-[#394A43]">{option.label}</div>
                      <div className="text-xs text-[#5A6D65] mt-0.5">{option.detail}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Step 3: Secure Server-Gated Action */}
          <div className="neu-card rounded-[28px] p-6 sm:p-7 space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl neu-card-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#567360]" />
              </div>
              <div className="text-xs text-[#5A6D65] leading-relaxed">
                <p className="font-bold text-[#394A43] text-sm mb-1">
                  Server-Authoritative Reservation Flow
                </p>
                <p>
                  To prevent double-bookings and client-side price tampering, Firestore rules block
                  direct browser writes to <code className="font-mono text-[#394A43]">seatLocks</code>,{' '}
                  <code className="font-mono text-[#394A43]">showSeats</code>,{' '}
                  <code className="font-mono text-[#394A43]">payments</code>, and{' '}
                  <code className="font-mono text-[#394A43]">bookings</code>. Clicking below dispatches
                  a signed request to the Cloud Functions ticketing contract.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                disabled={!user || submitting}
                onClick={handleRequestLockAndPayment}
                className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold rounded-full neu-btn-primary cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {submitting
                    ? 'Contacting Ticketing Backend...'
                    : 'Request Seat Lock & Proceed'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => clearDraft()}
                className="px-5 py-3 text-xs font-semibold rounded-full neu-btn cursor-pointer"
              >
                Discard Draft
              </button>
            </div>

            {/* Honest Backend Boundary Response */}
            {backendResult && !backendResult.ok && (
              <div
                role="status"
                className="neu-card-peach rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-[#6D3F2F] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#394A43] space-y-1">
                    <p className="font-bold">
                      {backendResult.code === 'BACKEND_NOT_DEPLOYED'
                        ? 'Cloud Functions Backend Not Connected Yet — No Booking Was Created'
                        : 'Unable to Acquire Seat Lock'}
                    </p>
                    <p className="leading-relaxed text-[#4F433C]">{backendResult.message}</p>
                    <p className="font-mono text-[11px] text-[#6D3F2F] pt-1 break-all">
                      Target endpoint: POST {backendResult.endpoint}
                    </p>
                  </div>
                </div>

                <div className="pl-7">
                  <button
                    type="button"
                    onClick={() => setShowPayload((prev) => !prev)}
                    className="text-xs font-bold text-[#394A43] underline underline-offset-4 cursor-pointer"
                  >
                    {showPayload
                      ? 'Hide prepared contract payload'
                      : 'Inspect prepared contract payload'}
                  </button>
                  {showPayload && (
                    <pre className="mt-3 p-4 rounded-2xl neu-inset text-[#394A43] font-mono text-[11px] overflow-x-auto">
                      {JSON.stringify(
                        {
                          provider: selectedProvider,
                          expectedTotalInr: breakdown.totalInr,
                          lockRequest: backendResult.requestPayload,
                        },
                        null,
                        2
                      )}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {backendResult && backendResult.ok && (
              <div
                role="status"
                className="neu-card-sage rounded-2xl p-4 text-xs text-[#394A43] font-medium"
              >
                Seat lock <span className="font-mono font-bold">{backendResult.data.id}</span>{' '}
                acquired by server until {backendResult.data.expiresAt}. Proceed to gateway payment
                verification.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Elevated Booking Summary */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <OrderSummary
            movie={movie}
            theatre={theatre}
            screen={screen}
            city={city}
            show={show}
            selectedSeats={draft.selectedSeats}
          />
        </div>
      </div>
    </div>
  );
}
