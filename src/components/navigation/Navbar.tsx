import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useCity } from '../../context/CityContext';
import { useAuth } from '../../context/AuthContext';

export function Navbar() {
  const { selectedCity, openCityModal } = useCity();
  const { user, profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const accountLabel =
    profile?.displayName?.split(' ')[0] ||
    user?.displayName?.split(' ')[0] ||
    'Account';

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium whitespace-nowrap shrink-0 transition-colors pb-1 ${
      isActive
        ? 'text-[#394A43] font-semibold border-b-2 border-[#718F7B]'
        : 'text-[#5A6D65] hover:text-[#394A43]'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-[#F5EBDD]/92 backdrop-blur-md border-b border-[#FFFCF5]/70 shadow-[0_6px_18px_rgba(145,130,108,0.12)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          to="/"
          className="font-display text-xl font-extrabold tracking-tight text-[#394A43] whitespace-nowrap shrink-0"
        >
          Marquee
        </Link>

        {/* Zone 2: Concise single-line navigation links + city trigger */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7"
        >
          <NavLink to="/movies" className={navLinkClass}>
            Movies
          </NavLink>
          <NavLink to="/bookings" className={navLinkClass}>
            My Bookings
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          <button
            type="button"
            onClick={openCityModal}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#394A43] hover:text-[#567360] whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            aria-label={`Change city, currently ${selectedCity.name}`}
          >
            <span>{selectedCity.name}</span>
            <ChevronDown className="w-4 h-4 text-[#718F7B]" />
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={openCityModal}
            className="md:hidden inline-flex items-center gap-1 text-xs font-semibold text-[#394A43] px-3 py-2 rounded-full neu-btn whitespace-nowrap shrink-0 cursor-pointer"
            aria-label={`Select city, currently ${selectedCity.name}`}
          >
            <span className="max-w-[92px] truncate">{selectedCity.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#718F7B]" />
          </button>

          {user ? (
            <Link
              to="/profile"
              className="hidden md:inline-flex items-center px-5 py-2 text-sm font-semibold rounded-full neu-btn-primary whitespace-nowrap shrink-0"
            >
              {accountLabel}
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden md:inline-flex items-center px-5 py-2 text-sm font-semibold rounded-full neu-btn-primary whitespace-nowrap shrink-0"
            >
              Sign In
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full neu-btn text-[#394A43] cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#FFFCF5]/60 bg-[#F5EBDD] px-4 py-4 space-y-2 shadow-[0_14px_26px_rgba(145,130,108,0.18)]">
          <NavLink
            to="/"
            end
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-2xl text-sm font-medium ${
                isActive ? 'neu-inset text-[#394A43] font-semibold' : 'text-[#5A6D65] hover:text-[#394A43]'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/movies"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-2xl text-sm font-medium ${
                isActive ? 'neu-inset text-[#394A43] font-semibold' : 'text-[#5A6D65] hover:text-[#394A43]'
              }`
            }
          >
            Movies
          </NavLink>
          <NavLink
            to="/bookings"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-2xl text-sm font-medium ${
                isActive ? 'neu-inset text-[#394A43] font-semibold' : 'text-[#5A6D65] hover:text-[#394A43]'
              }`
            }
          >
            My Bookings
          </NavLink>
          <NavLink
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-2xl text-sm font-medium ${
                isActive ? 'neu-inset text-[#394A43] font-semibold' : 'text-[#5A6D65] hover:text-[#394A43]'
              }`
            }
          >
            About
          </NavLink>
          <div className="pt-2">
            {user ? (
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 text-sm font-semibold rounded-full neu-btn-primary"
              >
                Account ({accountLabel})
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 text-sm font-semibold rounded-full neu-btn-primary"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
