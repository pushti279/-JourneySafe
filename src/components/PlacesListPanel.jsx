import { POI_CATEGORIES } from '../constants/api';
import PlaceReviewsSection from './PlaceReviewsSection';
import LoadingSpinner from './ui/LoadingSpinner';

function formatDist(meters) {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export default function PlacesListPanel({
  categoryId,
  places,
  isLoading,
  error,
  selectedPoiId,
  onClose,
  onUsePlace,
  onViewOnMap,
  reviewRefreshKey,
}) {
  const meta = POI_CATEGORIES[categoryId];

  return (
    <div className="mt-3 rounded-xl border border-neutral-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-neutral-900">
          <span className="mr-1.5" aria-hidden>
            {meta.emoji}
          </span>
          {meta.title}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-[12px] font-medium text-neutral-500 hover:text-neutral-800"
        >
          Close
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto px-2 py-2">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-neutral-500">
            <LoadingSpinner />
            Loading places along route…
          </div>
        )}

        {!isLoading && error && (
          <p className="px-2 py-6 text-center text-[13px] text-red-600">{error}</p>
        )}

        {!isLoading && !error && places.length === 0 && (
          <p className="px-2 py-6 text-center text-[13px] text-neutral-500">
            No {meta.title.toLowerCase()} within 2 km of this route.
          </p>
        )}

        {!isLoading &&
          !error &&
          places.map((poi) => {
            const isSelected = selectedPoiId === poi.id;

            return (
              <article
                key={poi.id}
                className={`mb-2 rounded-lg border px-3 py-3 last:mb-0 ${
                  isSelected
                    ? 'border-neutral-300 bg-neutral-50'
                    : 'border-neutral-100 bg-white'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      {poi.name}
                    </p>
                    <p className="mt-0.5 text-[12px] text-neutral-500">
                      {formatDist(poi.distanceMeters)} from route
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-600">
                    {meta.typeBadge}
                  </span>
                </div>

                <PlaceReviewsSection poi={poi} refreshKey={reviewRefreshKey} />

                {isSelected && (
                  <p className="mt-1 text-[11px] font-medium text-emerald-700">
                    Selected for navigation
                  </p>
                )}

                <div className="mt-2.5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onUsePlace(poi)}
                    className="rounded-md bg-neutral-900 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-neutral-800"
                  >
                    Use / Go
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewOnMap(poi)}
                    className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    View on Map
                  </button>
                </div>
              </article>
            );
          })}
      </div>
    </div>
  );
}
