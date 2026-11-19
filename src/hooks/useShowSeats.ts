import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { showSeatsRepository } from '../services/firebase/showSeatsRepository';
import type { ShowSeatRecord } from '../types/booking';

interface UseShowSeatsResult {
  liveSeats: ShowSeatRecord[];
  hasLiveInventory: boolean;
  loading: boolean;
  error: string | null;
}

export function useShowSeats(showId: string | undefined): UseShowSeatsResult {
  const { user, authReady } = useAuth();
  const [liveSeats, setLiveSeats] = useState<ShowSeatRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!showId || !authReady || !user) {
      setLiveSeats([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = showSeatsRepository.subscribeByShow(
      showId,
      (records) => {
        setLiveSeats(records);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [showId, authReady, user]);

  return {
    liveSeats,
    hasLiveInventory: liveSeats.length > 0,
    loading,
    error,
  };
}
