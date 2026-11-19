import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { catalogueService } from '../services/catalogueService';

export function AboutPage() {
  const cities = catalogueService.getCities();
  const movies = catalogueService.getAllMovies();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <header className="relative neu-card rounded-[34px] p-8 sm:p-12 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-14 w-52 h-52 rounded-full neu-shape-mint opacity-60"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 right-1/3 w-44 h-44 rounded-full neu-shape-peach opacity-55"
        />
        <div className="relative max-w-3xl space-y-4">
          <p className="text-xs font-semibold text-[#567360]">About Marquee</p>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#394A43] tracking-tight leading-[1.1]">
            A calm, tactile cinema ticketing platform built for clarity and transactional integrity.
          </h1>
          <p className="text-base text-[#5A6D65] leading-relaxed">
            Marquee brings together relational movie discovery across 10 major Indian cities,
            interactive auditorium seat layouts, Firebase Authentication, and hardened Firestore
            service abstractions engineered for server-authoritative Cloud Functions checkout.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neu-card-mint rounded-[28px] p-7">
          <p className="font-display text-4xl font-extrabold text-[#394A43] tabular-nums">
            {cities.length}
          </p>
          <p className="text-sm font-bold text-[#394A43] mt-2">Indian Cinema Cities</p>
          <p className="text-xs text-[#394A43]/80 mt-1.5 leading-relaxed">
            Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Jaipur, and
            Kochi.
          </p>
        </div>

        <div className="neu-card-peach rounded-[28px] p-7">
          <p className="font-display text-4xl font-extrabold text-[#394A43] tabular-nums">
            {movies.length}
          </p>
          <p className="text-sm font-bold text-[#394A43] mt-2">Relational Catalogue Titles</p>
          <p className="text-xs text-[#394A43]/80 mt-1.5 leading-relaxed">
            Backed by typed local JSON datasets connecting movies, genres, theatres, screens, and
            multi-day showtimes.
          </p>
        </div>

        <div className="neu-card-sage rounded-[28px] p-7">
          <p className="font-display text-4xl font-extrabold text-[#394A43] tabular-nums">5</p>
          <p className="text-sm font-bold text-[#394A43] mt-2">Firestore Security Domains</p>
          <p className="text-xs text-[#394A43]/80 mt-1.5 leading-relaxed">
            Strict Zero-Trust rules separating owner-managed user profiles from server-only
            ticketing collections.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-2xl font-extrabold text-[#394A43]">
          Architecture & Security Principles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="neu-card-white rounded-[28px] p-7 space-y-2.5">
            <h3 className="font-display text-base font-bold text-[#394A43]">
              01. Honest Transactional Boundaries
            </h3>
            <p className="text-sm text-[#5A6D65] leading-relaxed">
              The frontend never fakes seat locks, payment gateway verification, or confirmed ticket
              issuance. Firestore rules explicitly block browser writes to{' '}
              <code className="font-mono text-xs text-[#394A43]">bookings</code>,{' '}
              <code className="font-mono text-xs text-[#394A43]">showSeats</code>,{' '}
              <code className="font-mono text-xs text-[#394A43]">seatLocks</code>, and{' '}
              <code className="font-mono text-xs text-[#394A43]">payments</code>.
            </p>
          </div>

          <div className="neu-card-white rounded-[28px] p-7 space-y-2.5">
            <h3 className="font-display text-base font-bold text-[#394A43]">
              02. Cloud Functions Contract Ready
            </h3>
            <p className="text-sm text-[#5A6D65] leading-relaxed">
              All transactional mutations flow through a typed{' '}
              <code className="font-mono text-xs text-[#394A43]">SecureTicketingBackend</code>{' '}
              adapter authenticated with Firebase ID tokens, ready to connect to deployed Cloud
              Functions via{' '}
              <code className="font-mono text-xs text-[#394A43]">
                VITE_CLOUD_FUNCTIONS_BASE_URL
              </code>
              .
            </p>
          </div>
        </div>
      </section>

      <div>
        <Link
          to="/movies"
          className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-full neu-btn-primary"
        >
          <span>Explore Movies & Showtimes</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
