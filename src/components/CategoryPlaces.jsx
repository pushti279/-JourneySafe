import { useState } from 'react';
import { POI_CATEGORIES } from '../constants/api';
import PlaceFeedbackModal from './PlaceFeedbackModal';
import PlacesListPanel from './PlacesListPanel';
import LoadingSpinner from './ui/LoadingSpinner';

export default function CategoryPlaces({
  pois,
  isLoading,
  error,
  totalCount,
  onViewOnMap,
  onSelectedPlaceChange,
}) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedPoiId, setSelectedPoiId] = useState(null);
  const [feedbackPoi, setFeedbackPoi] = useState(null);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  const toggleCategory = (categoryId) => {
    setActiveCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  const handleUsePlace = (poi) => {
    setSelectedPoiId(poi.id);
    setFeedbackPoi(poi);
    onSelectedPlaceChange?.(poi);
  };

  const handleFeedbackSaved = () => {
    setReviewRefreshKey((k) => k + 1);
  };

  const activePlaces = activeCategory ? pois[activeCategory] ?? [] : [];

  return (
    <div className="mt-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
        Explore along your route
      </p>
      <p className="mt-1 text-[12px] text-neutral-500">
        {isLoading && (
          <span className="inline-flex items-center gap-1.5">
            <LoadingSpinner className="h-3 w-3" />
            Loading places along route…
          </span>
        )}
        {!isLoading && error && (
          <span className="text-red-600">{error}</span>
        )}
        {!isLoading && !error && (
          <span>
            {totalCount} places within 2 km (sample India highway data)
          </span>
        )}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {Object.values(POI_CATEGORIES).map((cat) => {
          const count = pois[cat.id]?.length ?? 0;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className={`rounded-xl border border-neutral-200/80 bg-gradient-to-br ${cat.accent} p-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:shadow-md ${
                isActive ? `ring-2 ${cat.ring}` : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg" aria-hidden>
                  {cat.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-semibold text-neutral-900">
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-[12px] text-neutral-500">
                    {count} nearby {count === 1 ? 'place' : 'places'}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {activeCategory && (
        <PlacesListPanel
          categoryId={activeCategory}
          places={activePlaces}
          isLoading={isLoading}
          error={error}
          selectedPoiId={selectedPoiId}
          onClose={() => setActiveCategory(null)}
          onUsePlace={handleUsePlace}
          onViewOnMap={onViewOnMap}
          reviewRefreshKey={reviewRefreshKey}
        />
      )}

      {feedbackPoi && (
        <PlaceFeedbackModal
          poi={feedbackPoi}
          onClose={() => setFeedbackPoi(null)}
          onSaved={handleFeedbackSaved}
        />
      )}
    </div>
  );
}
