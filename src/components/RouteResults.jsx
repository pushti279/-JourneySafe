import { useState } from 'react';
import { formatDistance, formatDuration } from '../utils/formatters';
import CategoryPlaces from './CategoryPlaces';
import PlaceCards from './PlaceCards';
import RouteMap from './RouteMap';

export default function RouteResults({
  routeData,
  pois,
  poisLoading,
  poisError,
  totalCount,
}) {
  const { from, to, route } = routeData;
  const [focusPoi, setFocusPoi] = useState(null);
  const [highlightedPoiId, setHighlightedPoiId] = useState(null);

  const handleViewOnMap = (poi) => {
    setFocusPoi({ lat: poi.lat, lon: poi.lon, id: poi.id });
    setHighlightedPoiId(poi.id);
  };

  return (
    <section className="mt-10 w-full max-w-3xl text-left">
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
        Route Results
      </h2>

      <div className="mt-4 rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
        <dl className="space-y-2 text-sm">
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-neutral-500">From:</dt>
            <dd className="text-neutral-900">{from.displayName}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-neutral-500">To:</dt>
            <dd className="text-neutral-900">{to.displayName}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2 border-t border-neutral-100 pt-3">
            <dt className="font-medium text-neutral-500">Distance:</dt>
            <dd className="text-neutral-700">
              {formatDistance(route.distanceMeters)}
            </dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-neutral-500">Estimated Time:</dt>
            <dd className="text-neutral-700">
              {formatDuration(route.durationSeconds)}
            </dd>
          </div>
        </dl>
      </div>

      <CategoryPlaces
        pois={pois}
        isLoading={poisLoading}
        error={poisError}
        totalCount={totalCount}
        onViewOnMap={handleViewOnMap}
      />

      <div className="mt-4 h-[300px] sm:h-[360px]">
        <RouteMap
          routeData={routeData}
          visiblePois={pois}
          focusPoi={focusPoi}
          highlightedPoiId={highlightedPoiId}
          className="h-full"
        />
      </div>

      <div className="mt-6">
        <PlaceCards />
      </div>
    </section>
  );
}
