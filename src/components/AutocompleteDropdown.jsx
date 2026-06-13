import LoadingSpinner from './ui/LoadingSpinner';

export default function AutocompleteDropdown({
  isLoading,
  isEmpty,
  error,
  suggestions,
  onSelect,
}) {
  return (
    <ul
      className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-lg"
      role="listbox"
    >
      {isLoading && (
        <li className="flex items-center gap-2 px-3 py-2 text-[13px] text-neutral-500">
          <LoadingSpinner className="h-3.5 w-3.5" />
          Searching…
        </li>
      )}

      {!isLoading && error && (
        <li className="px-3 py-2 text-[13px] text-red-600" role="option">
          {error}
        </li>
      )}

      {!isLoading && !error && isEmpty && (
        <li className="px-3 py-2 text-[13px] text-neutral-500" role="option">
          No results in India. Try a city, NH highway, or landmark.
        </li>
      )}

      {!isLoading &&
        !error &&
        suggestions.map((place) => (
          <li key={place.id} role="option">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect(place)}
              className="w-full px-3 py-2 text-left transition-colors hover:bg-neutral-50"
            >
              <span className="block text-sm font-medium text-neutral-900">
                {place.name}
              </span>
              <span className="block text-xs text-neutral-500">
                {[place.city, place.state].filter(Boolean).join(', ') ||
                  place.displayName}
              </span>
            </button>
          </li>
        ))}
    </ul>
  );
}
