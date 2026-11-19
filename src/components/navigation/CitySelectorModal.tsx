import { useMemo, useState } from 'react';
import { Check, MapPin, Search, X } from 'lucide-react';
import { useCity } from '../../context/CityContext';

export function CitySelectorModal() {
  const { cities, selectedCity, selectCity, isCityModalOpen, closeCityModal } = useCity();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [cities, search]);

  if (!isCityModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#394A43]/35 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="city-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCityModal();
      }}
    >
      <div className="w-full max-w-2xl bg-[#F5EBDD] rounded-[32px] p-6 sm:p-8 shadow-[20px_24px_48px_rgba(57,74,67,0.28),-10px_-10px_28px_rgba(255,252,245,0.6)] border border-[#FFFCF5]/80">
        <div className="flex items-start justify-between gap-4 pb-5">
          <div>
            <p className="text-xs font-semibold text-[#567360]">Location</p>
            <h2 id="city-modal-title" className="text-xl font-bold text-[#394A43] mt-0.5">
              Select Your City
            </h2>
            <p className="text-xs text-[#5A6D65] mt-1">
              Catalogue showtimes and partner venues across 10 Indian cinema hubs.
            </p>
          </div>
          <button
            type="button"
            onClick={closeCityModal}
            className="w-10 h-10 inline-flex items-center justify-center rounded-full neu-btn text-[#394A43] cursor-pointer"
            aria-label="Close city selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="w-4 h-4 text-[#718F7B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search city, state, or code..."
            className="w-full pl-11 pr-4 py-3 text-sm rounded-full neu-input"
            autoFocus
          />
        </div>

        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#5A6D65]">
            No supported city matches "{search}".
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[360px] overflow-y-auto p-1">
            {filtered.map((city) => {
              const active = city.id === selectedCity.id;
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => {
                    selectCity(city.id);
                    setSearch('');
                  }}
                  className={`flex items-start justify-between gap-3 p-4 rounded-2xl text-left transition-all cursor-pointer ${
                    active ? 'neu-card-mint' : 'neu-card-white hover:-translate-y-0.5'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <MapPin
                        className={`w-4 h-4 shrink-0 ${
                          active ? 'text-[#394A43]' : 'text-[#718F7B]'
                        }`}
                      />
                      <span className="text-sm font-bold text-[#394A43] truncate">
                        {city.name}
                      </span>
                      <span className="font-mono text-[11px] text-[#5A6D65]">{city.code}</span>
                    </div>
                    <p className="text-xs text-[#5A6D65] mt-1 truncate pl-6">
                      {city.state} · {city.theatreCountLabel}
                    </p>
                  </div>
                  {active && (
                    <span className="w-6 h-6 rounded-full bg-[#567360] text-[#FFFCF5] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
