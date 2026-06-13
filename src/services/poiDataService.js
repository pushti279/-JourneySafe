import { DUMMY_PLACES } from '../data/places';
import {
  PLACE_TYPE_TO_CATEGORY,
  POI_DATA_SOURCE,
  POI_MAX_DISTANCE_M,
} from '../constants/api';
import { fetchPoisAlongRoute as fetchOverpassPois } from './osmService';

function debugLog(label, data) {
  console.log(`[journeySafe POI] ${label}`, data);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Normalized POI shape used across UI and map (API-ready).
 * @param {import('../data/places').typeof DUMMY_PLACES[0]} place
 */
export function mockPlaceToPoi(place) {
  const category = PLACE_TYPE_TO_CATEGORY[place.type];
  return {
    id: place.id,
    category,
    lat: place.lat,
    lon: place.lng,
    name: place.name,
    distanceMeters: place.distanceFromRoute,
    score: Math.round(place.rating * 2),
    tags: { description: place.description },
    description: place.description,
    baseRating: place.rating,
    baseTotalReviews: place.totalReviews,
    type: place.type,
  };
}

/**
 * Mock filter: category + proximity (distanceFromRoute ≤ 2 km).
 * Route geometry reserved for future spatial filtering when API is enabled.
 */
function fetchMockPoisAlongRoute(routeGeometry, signal) {
  if (signal?.aborted) {
    return Promise.reject(new DOMException('Aborted', 'AbortError'));
  }

  return delay(450).then(() => {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    const grouped = {
      washrooms: [],
      fuel: [],
      restaurants: [],
      restStops: [],
    };

    DUMMY_PLACES.filter((p) => p.distanceFromRoute <= POI_MAX_DISTANCE_M).forEach(
      (place) => {
        const poi = mockPlaceToPoi(place);
        grouped[poi.category]?.push(poi);
      },
    );

    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => a.distanceMeters - b.distanceMeters);
    });

    debugLog('Mock POI dataset (filtered)', {
      routePointCount: routeGeometry?.coordinates?.length ?? 0,
      grouped,
    });

    return grouped;
  });
}

/**
 * Single entry point for POI data — swap POI_DATA_SOURCE to 'overpass' for live API.
 * @param {import('./osmService').RouteGeometry} routeGeometry
 * @param {AbortSignal} [signal]
 */
export async function fetchPoisAlongRoute(routeGeometry, signal) {
  if (POI_DATA_SOURCE === 'overpass') {
    return fetchOverpassPois(routeGeometry, signal);
  }
  return fetchMockPoisAlongRoute(routeGeometry, signal);
}
