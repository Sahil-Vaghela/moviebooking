import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingsRepository } from '../services/firebase/bookingsRepository';
import { seatLocksRepository } from '../services/firebase/seatLocksRepository';
import { paymentsRepository } from '../services/firebase/paymentsRepository';
import { catalogueService } from '../services/catalogueService';
import { EmptyState, ErrorState, LoadingState } from '../components/common/StateBlocks';
import { formatInr, formatIsoTimestamp, formatShowtime12h } from '../utils/formatters';
import type { BookingRecord, PaymentRecord, SeatLockRecord } from '../types/booking';

export function BookingsPage() {
  const { user, authReady } = useAuth();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [activeLocks, setActiveLocks] = useState<SeatLockRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      setBookings([]);
      setActiveLocks([]);
      setPayments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = bookingsRepository.subscribeByUser(
      user.uid,
      (records) => {
        setBookings(records);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    void Promise.all([
      seatLocksRepository.listActiveByUser(user.uid),
      paymentsRepository.listByUser(user.uid),
    ])
      .then(([locks, paymentRows]) => {
        setActiveLocks(locks);
        setPayments(paymentRows);
      })
      .catch(() => {
        // Primary subscription already surfaces permission or connectivity issues
      });

    return () => unsubscribe();
  }, [authReady, user]);

  if (!authReady || loading) {
    return <LoadingState label="Fetching your Firestore booking records..." />;
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          title="Sign in to access your bookings"
          description="Your confirmed movie tickets, active server-held seat locks, and payment receipts are linked to your authenticated Marquee account."
          action={
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/login"
                state={{ from: '/bookings' }}
                className="px-6 py-2.5 text-sm font-semibold rounded-full neu-btn-primary"
              >
                Sign In
              </Link>
              <Link
                to="/movies"
                className="px-5 py-2.5 text-sm font-semibold rounded-full neu-btn"
              >
                Browse Movies
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      <div className="neu-card rounded-[30px] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#567360]">Order History</p>
          <h1 className="font-display text-3xl font-extrabold text-[#394A43] tracking-tight mt-1">
            My Bookings
          </h1>
          <p className="text-sm text-[#5A6D65] mt-1">
            Synced directly from your scoped Firestore{' '}
            <code className="font-mono text-xs text-[#394A43]">bookings</code> collection.
          </p>
        </div>
        <Link
          to="/movies"
          className="px-5 py-2.5 text-xs font-semibold rounded-full neu-btn-mint self-start sm:self-auto whitespace-nowrap"
        >
          Browse Showtimes
        </Link>
      </div>

      {error && <ErrorState title="Could not read bookings" description={error} />}

      {activeLocks.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[#394A43]">
            Active Seat Holds ({activeLocks.length})
          </h2>
          <div className="space-y-3">
            {activeLocks.map((lock) => (
              <div
                key={lock.id}
                className="neu-card-peach rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
              >
                <div>
                  <p className="font-bold text-[#394A43]">
                    Show {lock.showId} · Seats{' '}
                    <span className="font-mono">{lock.seatIds.join(', ')}</span>
                  </p>
                  <p className="text-xs text-[#4F433C] mt-0.5">
                    Lock ID {lock.id} · Expires {formatIsoTimestamp(lock.expiresAt)}
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-[#394A43]">
                  {lock.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {bookings.length === 0 ? (
        <EmptyState
          title="No confirmed bookings yet"
          description="Your Firestore bookings ledger is currently empty. Bookings are minted exclusively after server-side seat locking and payment verification through the Cloud Functions backend."
          action={
            <Link
              to="/movies"
              className="inline-flex items-center px-6 py-2.5 text-sm font-semibold rounded-full neu-btn-primary"
            >
              Explore Now Showing
            </Link>
          }
        />
      ) : (
        <div className="space-y-5">
          {bookings.map((booking) => {
            const movie = catalogueService.getMovieById(booking.movieId);
            const theatre = catalogueService.getTheatreById(booking.theatreId);
            const show = catalogueService.getShowById(booking.showId);
            const city = catalogueService.getCityById(booking.cityId);

            return (
              <article
                key={booking.id}
                className="neu-card-white rounded-[28px] p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-[#5A6D65]">
                    <Ticket className="w-4 h-4 text-[#567360]" />
                    <span className="font-mono font-semibold text-[#394A43]">
                      {booking.bookingCode || booking.id}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-bold text-[#567360]">{booking.status}</span>
                  </div>
                  <h2 className="font-display text-xl font-bold text-[#394A43]">
                    {movie?.title || booking.movieId}
                  </h2>
                  <p className="text-sm text-[#5A6D65]">
                    {theatre?.name || booking.theatreId}
                    {city ? `, ${city.name}` : ''}
                    {show ? ` · ${formatShowtime12h(show.startTime)}` : ''}
                  </p>
                  <p className="text-xs text-[#5A6D65]">
                    Seats:{' '}
                    <span className="font-mono font-bold text-[#394A43]">
                      {booking.seatIds.join(', ')}
                    </span>{' '}
                    · Booked {formatIsoTimestamp(booking.createdAt)}
                  </p>
                </div>

                <div className="neu-card-mint rounded-2xl px-5 py-3 text-left md:text-right shrink-0">
                  <p className="text-[11px] font-semibold text-[#394A43]/75">Total Paid</p>
                  <p className="font-display text-2xl font-extrabold text-[#394A43] tabular-nums">
                    {formatInr(booking.totalInr)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {payments.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-lg font-bold text-[#394A43]">
            Payment Ledger ({payments.length})
          </h2>
          <div className="neu-card-white rounded-[26px] divide-y divide-[#394A43]/10 overflow-hidden">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm"
              >
                <div>
                  <p className="font-bold text-[#394A43]">
                    {payment.provider} · Booking {payment.bookingId}
                  </p>
                  <p className="text-xs text-[#5A6D65]">
                    {payment.gatewayOrderId || payment.id} ·{' '}
                    {formatIsoTimestamp(payment.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-[#567360]">{payment.status}</span>
                  <span className="font-mono font-bold text-[#394A43] tabular-nums">
                    {formatInr(payment.amountInr)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
