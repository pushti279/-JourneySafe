import { useEffect, useRef, useState } from 'react';
import {
  AUTOCOMPLETE_DEBOUNCE_MS,
  AUTOCOMPLETE_MIN_CHARS,
} from '../constants/api';
import { fetchAutocompleteSuggestions } from '../services/osmService';
import { useDebounce } from './useDebounce';

export const AUTOCOMPLETE_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  EMPTY: 'empty',
  ERROR: 'error',
};

export function useAutocomplete() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [status, setStatus] = useState(AUTOCOMPLETE_STATUS.IDLE);
  const [error, setError] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const abortRef = useRef(null);

  const debouncedQuery = useDebounce(query, AUTOCOMPLETE_DEBOUNCE_MS);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    if (trimmed.length < AUTOCOMPLETE_MIN_CHARS) {
      abortRef.current?.abort();
      setSuggestions([]);
      setStatus(AUTOCOMPLETE_STATUS.IDLE);
      setError('');
      return;
    }

    if (selectedPlace && trimmed === selectedPlace.label) {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus(AUTOCOMPLETE_STATUS.LOADING);
    setError('');

    fetchAutocompleteSuggestions(trimmed, controller.signal)
      .then((results) => {
        if (controller.signal.aborted) return;
        setSuggestions(results);
        setStatus(
          results.length > 0
            ? AUTOCOMPLETE_STATUS.SUCCESS
            : AUTOCOMPLETE_STATUS.EMPTY,
        );
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setSuggestions([]);
        setStatus(AUTOCOMPLETE_STATUS.ERROR);
        setError(err.message ?? 'Could not load suggestions.');
      });
  }, [debouncedQuery, selectedPlace]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const selectPlace = (place) => {
    setSelectedPlace(place);
    setQuery(place.label);
    setSuggestions([]);
    setStatus(AUTOCOMPLETE_STATUS.IDLE);
    setError('');
  };

  const clearSelection = () => {
    setSelectedPlace(null);
  };

  const handleQueryChange = (value, onPlaceSelect) => {
    setQuery(value);
    if (selectedPlace && value !== selectedPlace.label) {
      setSelectedPlace(null);
      onPlaceSelect?.(null);
    }
  };

  const isLoading = status === AUTOCOMPLETE_STATUS.LOADING;
  const isEmpty = status === AUTOCOMPLETE_STATUS.EMPTY;
  const showDropdown =
    query.trim().length >= AUTOCOMPLETE_MIN_CHARS &&
    (isLoading || suggestions.length > 0 || isEmpty || status === AUTOCOMPLETE_STATUS.ERROR);

  const setQueryWithNotify = (value, onPlaceSelect) => {
    handleQueryChange(value, onPlaceSelect);
  };

  return {
    query,
    setQuery: setQueryWithNotify,
    suggestions,
    status,
    error,
    selectedPlace,
    selectPlace,
    clearSelection,
    isLoading,
    isEmpty,
    showDropdown,
  };
}
