import { useId, useState } from 'react';
import { useAutocomplete } from '../hooks/useAutocomplete';
import AutocompleteDropdown from './AutocompleteDropdown';

/** Wraps existing search-card input markup; adds dropdown only. */
export default function AutocompleteField({
  label,
  placeholder,
  disabled,
  onPlaceSelect,
}) {
  const inputId = useId();
  const [isFocused, setIsFocused] = useState(false);
  const {
    query,
    setQuery,
    suggestions,
    error,
    selectPlace,
    isLoading,
    isEmpty,
    showDropdown,
  } = useAutocomplete();

  const handleSelect = (place) => {
    selectPlace(place);
    onPlaceSelect?.(place);
    setIsFocused(false);
  };

  const open = isFocused && showDropdown;

  return (
    <label className="relative flex flex-1 flex-col gap-1 px-3 py-2.5 sm:py-3">
      <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </span>
      <input
        id={inputId}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value, onPlaceSelect)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 160)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className="w-full border-0 bg-transparent p-0 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0 disabled:opacity-60"
      />
      {open && (
        <AutocompleteDropdown
          isLoading={isLoading}
          isEmpty={isEmpty}
          error={error}
          suggestions={suggestions}
          onSelect={handleSelect}
        />
      )}
    </label>
  );
}
