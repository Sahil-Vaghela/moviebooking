import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Search } from 'lucide-react';
import { useCity } from '../context/CityContext';
import { catalogueService } from '../services/catalogueService';
import { HeroShowcase } from '../components/movies/HeroShowcase';
import { MovieCard } from '../components/movies/MovieCard';
import { EmptyState } from '../components/common/StateBlocks';

export function HomePage() {
  const { selectedCity, openCityModal } = useCity();
  const navigate = useNavigate();
  const [quickSearch, setQuickSearch] = useState('');

  const banners = useMemo(
    () => catalogueService.getBannersForCity(selectedCity.id),
    [selectedCity.id]
  );

  const nowShowing = useMemo(
    () => catalogueService.getMoviesByCity(selectedCity.id, 'NOW_SHOWING'),
    [selectedCity.id]
  );

  const comingSoon = useMemo(
    () => catalogueService.getMoviesByCity(selectedCity.id, 'COMING_SOON'),
    [selectedCity.id]
  );

  const theatres = useMemo(
    () => catalogueService.getTheatresByCity(selectedCity.id),
    [selectedCity.id]
  );

  const handleQuickSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = quickSearch.trim();
    navigate(trimmed ? `/movies?q=${encodeURIComponent(trimmed)}` : '/movies');
  };

  return (
    <div>
      {/* Section 1: Pastel Hero Stage */}
      <HeroShowcase banners={banners} cityName={selectedCity.name} />

      {/* Floating City Selector & Soft Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6">
        <div className="neu-card-white rounded-[28px] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#5A6D65]">
            <button
              type="button"
              onClick={openCityModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full neu-btn-mint text-sm font-bold text-[#394A43] cursor-pointer whitespace-nowrap shrink-0"
            >
              <MapPin className="w-4 h-4 text-[#394A43]" />
              <span>{selectedCity.name}</span>
              <span className="font-mono text-[11px] opacity-75">{selectedCity.code}</span>
            </button>
            <span className="text-xs sm:text-sm text-[#5A6D65]">
              {nowShowing.length} films playing across {theatres.length} partner cinemas
            </span>
          </div>

          <form onSubmit={handleQuickSearch} className="flex items-center gap-2.5 w-full lg:w-[420px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#718F7B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder={`Search movies in ${selectedCity.name}...`}
                aria-label="Quick search movies"
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-full neu-input"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold rounded-full neu-btn-primary whitespace-nowrap shrink-0 cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Section 2: Now Showing Movie Poster Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold text-[#567360]">Now Showing</p>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#394A43] tracking-tight mt-1">
              In Theatres Across {selectedCity.name}
            </h2>
          </div>
          <Link
            to="/movies?status=NOW_SHOWING"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#567360] hover:text-[#394A43] whitespace-nowrap shrink-0"
          >
            <span>Browse all</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {nowShowing.length === 0 ? (
          <EmptyState
            title={`No current screenings in ${selectedCity.name}`}
            description="Try switching to another Indian city to explore active theatrical showtimes."
            action={
              <button
                type="button"
                onClick={openCityModal}
                className="px-6 py-2.5 text-sm font-semibold rounded-full neu-btn-primary cursor-pointer"
              >
                Choose Another City
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
            {nowShowing.slice(0, 8).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>

      {/* Section 3: Coming Soon & Partner Cinemas */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        {comingSoon.length > 0 && (
          <div>
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-semibold text-[#567360]">Upcoming Slate</p>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#394A43] tracking-tight mt-1">
                  Coming Soon to {selectedCity.name}
                </h2>
              </div>
              <Link
                to="/movies?status=COMING_SOON"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#567360] hover:text-[#394A43] whitespace-nowrap shrink-0"
              >
                <span>All upcoming</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
              {comingSoon.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        )}

        {/* Flagship Cinemas in City */}
        <div className="pt-4">
          <div className="mb-7">
            <p className="text-xs font-semibold text-[#567360]">Partner Venues</p>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#394A43] tracking-tight mt-1">
              Featured Cinemas in {selectedCity.name}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {theatres.map((theatre, idx) => (
              <div
                key={theatre.id}
                className={`p-7 rounded-[28px] flex flex-col justify-between gap-5 ${
                  idx % 2 === 0 ? 'neu-card-white' : 'neu-card'
                }`}
              >
                <div>
                  <p className="text-xs font-semibold text-[#567360]">
                    {theatre.chain} · {theatre.locality}
                  </p>
                  <h3 className="font-display text-xl font-bold text-[#394A43] mt-1">
                    {theatre.name}
                  </h3>
                  <p className="text-sm text-[#5A6D65] mt-2 leading-relaxed">
                    {theatre.address}
                  </p>
                </div>
                <div className="pt-4 border-t border-[#394A43]/10 flex items-center justify-between gap-4 text-xs text-[#5A6D65]">
                  <span className="truncate">{theatre.amenities.join(' · ')}</span>
                  <Link
                    to="/movies?status=NOW_SHOWING"
                    className="font-bold text-[#567360] hover:text-[#394A43] whitespace-nowrap shrink-0"
                  >
                    View showtimes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
