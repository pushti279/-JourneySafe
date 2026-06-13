import { useCallback, useEffect, useRef, useState } from 'react';
import { buildRouteFromPlaces } from '../services/osmService';

export const ROUTE_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

export function useRoute() {
  const [status, setStatus] = useState(ROUTE_STATUS.IDLE);
  const [routeData, setRouteData] = useState(null);
  const [error, setError] = useState('');
  const abortRef = useRef(null);

  const searchRoute = useCallback(async (fromPlace, toPlace) => {
    if (!fromPlace?.lat || !toPlace?.lat) {
      setError('Select both start and destination from the suggestions.');
      setStatus(ROUTE_STATUS.ERROR);
      setRouteData(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus(ROUTE_STATUS.LOADING);
    setError('');
    setRouteData(null);

    try {
      const result = await buildRouteFromPlaces(
        fromPlace,
        toPlace,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setRouteData(result);
      setStatus(ROUTE_STATUS.SUCCESS);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setRouteData(null);
      setStatus(ROUTE_STATUS.ERROR);
      setError(err.message ?? 'Failed to fetch route.');
    }
  }, []);

  const clearRoute = useCallback(() => {
    abortRef.current?.abort();
    setRouteData(null);
    setStatus(ROUTE_STATUS.IDLE);
    setError('');
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  return {
    routeData,
    status,
    error,
    searchRoute,
    clearRoute,
    isLoading: status === ROUTE_STATUS.LOADING,
    hasRoute: status === ROUTE_STATUS.SUCCESS && routeData != null,
  };
}
