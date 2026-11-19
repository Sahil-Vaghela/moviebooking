import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { BookingDraft } from '../types/booking';

const DRAFT_STORAGE_KEY = 'marquee_booking_draft';

interface BookingDraftContextValue {
  draft: BookingDraft | null;
  setDraft: (draft: BookingDraft) => void;
  clearDraft: () => void;
}

const BookingDraftContext = createContext<BookingDraftContextValue | null>(null);

function loadInitialDraft(): BookingDraft | null {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BookingDraft;
    if (parsed && parsed.showId && Array.isArray(parsed.selectedSeats)) {
      return parsed;
    }
  } catch {
    // Ignore invalid session draft
  }
  return null;
}

export function BookingDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState<BookingDraft | null>(loadInitialDraft);

  const setDraft = useCallback((next: BookingDraft) => {
    setDraftState(next);
    try {
      window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  const clearDraft = useCallback(() => {
    setDraftState(null);
    try {
      window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const value = useMemo<BookingDraftContextValue>(
    () => ({ draft, setDraft, clearDraft }),
    [draft, setDraft, clearDraft]
  );

  return (
    <BookingDraftContext.Provider value={value}>{children}</BookingDraftContext.Provider>
  );
}

export function useBookingDraft(): BookingDraftContextValue {
  const ctx = useContext(BookingDraftContext);
  if (!ctx) {
    throw new Error('useBookingDraft must be used within a BookingDraftProvider');
  }
  return ctx;
}
