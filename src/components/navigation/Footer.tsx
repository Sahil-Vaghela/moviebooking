import { Link } from 'react-router-dom';
import { useCity } from '../../context/CityContext';

export function Footer() {
  const { cities, selectedCity, selectCity } = useCity();

  return (
    <footer className="mt-20 px-4 sm:px-6 lg:px-8 pb-10">
      <div className="max-w-7xl mx-auto neu-card-mint rounded-[32px] p-8 sm:p-12 text-[#394A43]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-[#394A43]/12">
          <div className="md:col-span-4">
            <Link
              to="/"
              className="font-display text-2xl font-extrabold tracking-tight text-[#394A43]"
            >
              Marquee
            </Link>
            <p className="mt-3 text-sm text-[#394A43]/80 leading-relaxed max-w-sm">
              Calm, tactile movie discovery and theatre showtime booking across 10 Indian cities.
              Powered by relational catalogue data, Firebase Authentication, and server-gated
              ticketing interfaces.
            </p>
          </div>

          <div className="md:col-span-5">
            <h3 className="text-xs font-bold text-[#394A43] tracking-wide mb-4">
              Supported Cities
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4">
              {cities.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => selectCity(city.id)}
                  className={`text-left text-sm transition-colors cursor-pointer ${
                    city.id === selectedCity.id
                      ? 'text-[#394A43] font-bold underline underline-offset-4'
                      : 'text-[#394A43]/75 hover:text-[#394A43]'
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-bold text-[#394A43] tracking-wide mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm text-[#394A43]/80">
              <li>
                <Link to="/movies" className="hover:text-[#394A43] transition-colors">
                  All Movies
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-[#394A43] transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#394A43] transition-colors">
                  Account & Preferences
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#394A43] transition-colors">
                  About & Architecture
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#394A43]/75">
          <p>© {new Date().getFullYear()} Marquee Entertainment Platform. All rights reserved.</p>
          <p>
            Active city: <span className="font-semibold text-[#394A43]">{selectedCity.name}</span>{' '}
            · Local JSON catalogue with Firebase Auth & Firestore abstractions
          </p>
        </div>
      </div>
    </footer>
  );
}
