import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20">
      <div className="neu-card-white rounded-[32px] p-10 sm:p-12 text-center">
        <p className="font-mono text-sm font-bold text-[#567360] mb-2">404</p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#394A43] tracking-tight">
          Page not found
        </h1>
        <p className="text-sm text-[#5A6D65] mt-3 leading-relaxed">
          The screening, movie, or page you requested could not be found. Check the URL or return to
          the cinema catalogue.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="px-6 py-2.5 text-sm font-semibold rounded-full neu-btn-primary"
          >
            Back to Home
          </Link>
          <Link
            to="/movies"
            className="px-5 py-2.5 text-sm font-semibold rounded-full neu-btn"
          >
            Browse Movies
          </Link>
        </div>
      </div>
    </div>
  );
}
