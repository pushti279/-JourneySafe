import { useEffect, useRef, useState } from 'react';
import { fetchPoisAlongRoute } from '../services/poiDataService';

export const POI_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

const EMPTY_POIS = {
  washrooms: [],
  fuel: [],
  restaurants: [],
  restStops: [],
};

export function usePOIs(routeData) {
  const [pois, setPois] = useState(EMPTY_POIS);
  const [status, setStatus] = useState(POI_STATUS.IDLE);
  const [error, setError] = useState('');
  const abortRef = useRef(null);

  useEffect(() => {
    if (!routeData?.route?.coordinates?.length) {
      abortRef.current?.abort();
      setPois(EMPTY_POIS);
      setStatus(POI_STATUS.IDLE);
      setError('');
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus(POI_STATUS.LOADING);
    setError('');

    fetchPoisAlongRoute(routeData.route, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setPois(result);
        setStatus(POI_STATUS.SUCCESS);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setPois(EMPTY_POIS);
        setStatus(POI_STATUS.ERROR);
        setError(err.message ?? 'Failed to load nearby places.');
      });
  }, [routeData]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const totalCount = Object.values(pois).reduce(
    (sum, list) => sum + list.length,
    0,
  );

  return {
    pois,
    status,
    error,
    isLoading: status === POI_STATUS.LOADING,
    totalCount,
  };
}
