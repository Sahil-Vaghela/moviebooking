import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { catalogueService } from '../services/catalogueService';
import type { City } from '../types/catalogue';

const STORAGE_KEY = 'marquee_selected_city_id';

interface CityContextValue {
  cities: City[];
  selectedCity: City;
  selectCity: (cityId: string) => void;
  isCityModalOpen: boolean;
  openCityModal: () => void;
  closeCityModal: () => void;
}

const CityContext = createContext<CityContextValue | null>(null);

function resolveInitialCity(): City {
  try {
    const savedId = window.localStorage.getItem(STORAGE_KEY);
    if (savedId) {
      const found = catalogueService.getCityById(savedId);
      if (found) return found;
    }
  } catch {
    // Ignore storage access errors in restricted frames
  }
  return catalogueService.getDefaultCity();
}

export function CityProvider({ children }: { children: ReactNode }) {
  const cities = useMemo(() => catalogueService.getCities(), []);
  const [selectedCity, setSelectedCity] = useState<City>(resolveInitialCity);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const selectCity = useCallback((cityId: string) => {
    const found = catalogueService.getCityById(cityId);
    if (!found) return;
    setSelectedCity(found);
    try {
      window.localStorage.setItem(STORAGE_KEY, found.id);
    } catch {
      // Ignore storage persistence errors
    }
    setIsCityModalOpen(false);
  }, []);

  useEffect(() => {
    if (!isCityModalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCityModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCityModalOpen]);

  const value = useMemo<CityContextValue>(
    () => ({
      cities,
      selectedCity,
      selectCity,
      isCityModalOpen,
      openCityModal: () => setIsCityModalOpen(true),
      closeCityModal: () => setIsCityModalOpen(false),
    }),
    [cities, selectedCity, selectCity, isCityModalOpen]
  );

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity(): CityContextValue {
  const ctx = useContext(CityContext);
  if (!ctx) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return ctx;
}
