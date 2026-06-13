import {
  INDIA_VIEWBOX,
  NOMINATIM_BASE_URL,
  NOMINATIM_EMAIL,
  NOMINATIM_RATE_LIMIT_MS,
  OSRM_BASE_URL,
  OVERPASS_BASE_URL,
  POI_MAX_DISTANCE_M,
  POI_MAX_PER_CATEGORY,
} from '../constants/api';
import { getRouteBoundingBox, minDistanceToRouteMeters } from '../utils/geo';
import { scorePoiTags } from '../utils/poiScore';
import { ApiError, delay, getJson } from './httpClient';

function debugLog(label, data) {
  console.log(`[journeySafe OSM] ${label}`, data);
}

/**
 * @typedef {Object} PlaceSuggestion
 * @property {string} id
 * @property {number} lat
 * @property {number} lon
 * @property {string} name
 * @property {string} city
 * @property {string} state
 * @property {string} label
 * @property {string} displayName
 */

/**
 * @typedef {PlaceSuggestion} GeoPlace
 */

/**
 * @typedef {Object} RouteGeometry
 * @property {[number, number][]} coordinates
 * @property {number} distanceMeters
 * @property {number} durationSeconds
 */

/**
 * @typedef {Object} RouteSearchResult
 * @property {GeoPlace} from
 * @property {GeoPlace} to
 * @property {RouteGeometry} route
 */

/**
 * @typedef {Object} PoiItem
 * @property {string} id
 * @property {string} category
 * @property {number} lat
 * @property {number} lon
 * @property {string} name
 * @property {number} distanceMeters
 * @property {number} score
 * @property {Record<string, string>} tags
 */

function parseAddressParts(item) {
  const addr = item.address ?? {};
  const name =
    item.name ??
    addr.amenity ??
    addr.shop ??
    addr.building ??
    addr.road ??
    item.display_name?.split(',')[0]?.trim() ??
    'Unknown place';
  const city =
    addr.city ??
    addr.town ??
    addr.village ??
    addr.suburb ??
    addr.county ??
    '';
  const state = addr.state ?? addr.region ?? '';
  const label = [name, city, state].filter(Boolean).join(', ');

  return { name, city, state, label };
}

function indiaRelevanceScore(item) {
  const addr = item.address ?? {};
  let score = 0;
  if (addr.country_code === 'in') score += 10;
  if (addr.state) score += 3;
  if (addr.city || addr.town || addr.village) score += 2;
  const road = addr.road ?? '';
  if (/NH\s?\d+/i.test(road) || /National Highway/i.test(item.display_name ?? '')) {
    score += 5;
  }
  if (item.class === 'highway' || item.type === 'trunk' || item.type === 'primary') {
    score += 4;
  }
  if (item.importance) score += item.importance * 2;
  return score;
}

function mapNominatimResult(item) {
  const lat = Number.parseFloat(item.lat);
  const lon = Number.parseFloat(item.lon);
  const { name, city, state, label } = parseAddressParts(item);

  return {
    id: String(item.place_id ?? `${lat},${lon}`),
    lat,
    lon,
    name,
    city,
    state,
    label,
    displayName: item.display_name ?? label,
    indiaScore: indiaRelevanceScore(item),
  };
}

/**
 * @param {string} query
 * @param {AbortSignal} [signal]
 * @returns {Promise<PlaceSuggestion[]>}
 */
export async function fetchAutocompleteSuggestions(query, signal) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const results = await getJson(`${NOMINATIM_BASE_URL}/search`, {
    params: {
      q: trimmed,
      format: 'json',
      addressdetails: 1,
      limit: 8,
      dedupe: 1,
      countrycodes: 'in',
      viewbox: INDIA_VIEWBOX,
      bounded: 0,
      email: NOMINATIM_EMAIL,
    },
    signal,
  });

  debugLog('Autocomplete response', results);

  if (!Array.isArray(results) || results.length === 0) return [];

  return results
    .map(mapNominatimResult)
    .filter((p) => !Number.isNaN(p.lat) && !Number.isNaN(p.lon))
    .sort((a, b) => b.indiaScore - a.indiaScore)
    .slice(0, 6);
}

/**
 * @param {string} query
 * @param {AbortSignal} [signal]
 * @returns {Promise<GeoPlace>}
 */
export async function geocodePlace(query, signal) {
  const suggestions = await fetchAutocompleteSuggestions(query, signal);
  if (suggestions.length === 0) {
    throw new ApiError(`No results found for "${query.trim()}".`);
  }
  return suggestions[0];
}

/**
 * @param {GeoPlace} from
 * @param {GeoPlace} to
 * @param {AbortSignal} [signal]
 * @returns {Promise<RouteGeometry>}
 */
export async function fetchDrivingRoute(from, to, signal) {
  const coordinates = `${from.lon},${from.lat};${to.lon},${to.lat}`;
  const url = `${OSRM_BASE_URL}/route/v1/driving/${coordinates}`;

  const data = await getJson(url, {
    params: {
      overview: 'full',
      geometries: 'geojson',
      steps: 'false',
    },
    signal,
  });

  debugLog('OSRM route response', data);

  if (data.code !== 'Ok' || !data.routes?.length) {
    throw new ApiError(
      data.message ?? 'Could not calculate a driving route between these locations.',
    );
  }

  const route = data.routes[0];
  const line = route.geometry?.coordinates;

  if (!Array.isArray(line) || line.length < 2) {
    throw new ApiError('Route geometry was empty.');
  }

  return {
    coordinates: line.map(([lon, lat]) => [lat, lon]),
    distanceMeters: route.distance ?? 0,
    durationSeconds: route.duration ?? 0,
  };
}

/**
 * @param {GeoPlace} from
 * @param {GeoPlace} to
 * @param {AbortSignal} [signal]
 * @returns {Promise<RouteSearchResult>}
 */
export async function buildRouteFromPlaces(from, to, signal) {
  const route = await fetchDrivingRoute(from, to, signal);
  return { from, to, route };
}

/**
 * @param {string} fromQuery
 * @param {string} toQuery
 * @param {AbortSignal} [signal]
 */
export async function searchRoute(fromQuery, toQuery, signal) {
  const from = await geocodePlace(fromQuery, signal);
  await delay(NOMINATIM_RATE_LIMIT_MS);
  const to = await geocodePlace(toQuery, signal);
  return buildRouteFromPlaces(from, to, signal);
}

function buildOverpassQuery(bbox) {
  const { south, west, north, east } = bbox;
  return `
[out:json][timeout:30];
(
  node["amenity"="fuel"](${south},${west},${north},${east});
  way["amenity"="fuel"](${south},${west},${north},${east});
  node["amenity"="toilets"](${south},${west},${north},${east});
  node["amenity"="restaurant"](${south},${west},${north},${east});
  node["amenity"="fast_food"](${south},${west},${north},${east});
  node["amenity"="cafe"](${south},${west},${north},${east});
  node["highway"="rest_area"](${south},${west},${north},${east});
  node["highway"="services"](${south},${west},${north},${east});
  way["highway"="rest_area"](${south},${west},${north},${east});
  way["highway"="services"](${south},${west},${north},${east});
);
out center tags;
`;
}

async function postOverpass(query, signal) {
  const url = `${OVERPASS_BASE_URL}/interpreter`;
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Overpass network error. Try again shortly.', { cause: error });
  }

  if (!response.ok) {
    throw new ApiError(`Overpass request failed (${response.status}).`);
  }

  const data = await response.json();
  debugLog('Overpass POI response', data);
  return data;
}

function categorizeElement(element) {
  const tags = element.tags ?? {};
  if (tags.amenity === 'fuel') return 'fuel';
  if (tags.amenity === 'toilets' || tags.toilets === 'yes') return 'washrooms';
  if (
    tags.amenity === 'restaurant' ||
    tags.amenity === 'fast_food' ||
    tags.amenity === 'cafe'
  ) {
    return 'restaurants';
  }
  if (tags.highway === 'rest_area' || tags.highway === 'services') {
    return 'restStops';
  }
  return null;
}

function elementCoords(element) {
  if (element.type === 'node') {
    return { lat: element.lat, lon: element.lon };
  }
  if (element.center) {
    return { lat: element.center.lat, lon: element.center.lon };
  }
  return null;
}

function rankAndLimit(items, limit) {
  return [...items]
    .sort((a, b) => b.score - a.score || a.distanceMeters - b.distanceMeters)
    .slice(0, limit);
}

/**
 * @param {RouteGeometry} routeGeometry
 * @param {AbortSignal} [signal]
 */
export async function fetchPoisAlongRoute(routeGeometry, signal) {
  const bbox = getRouteBoundingBox(routeGeometry.coordinates);
  const query = buildOverpassQuery(bbox);
  const data = await postOverpass(query, signal);

  const grouped = {
    washrooms: [],
    fuel: [],
    restaurants: [],
    restStops: [],
  };

  const seen = new Set();

  (data.elements ?? []).forEach((element) => {
    const category = categorizeElement(element);
    if (!category) return;

    const coords = elementCoords(element);
    if (!coords) return;

    const distanceMeters = minDistanceToRouteMeters(
      coords.lat,
      coords.lon,
      routeGeometry.coordinates,
    );

    if (distanceMeters > POI_MAX_DISTANCE_M) return;

    const key = `${category}-${element.id}`;
    if (seen.has(key)) return;
    seen.add(key);

    const tags = element.tags ?? {};
    const item = {
      id: key,
      category,
      lat: coords.lat,
      lon: coords.lon,
      name: tags.name ?? tags.brand ?? 'Unnamed place',
      distanceMeters: Math.round(distanceMeters),
      score: scorePoiTags(tags),
      tags,
    };

    grouped[category].push(item);
  });

  Object.keys(grouped).forEach((key) => {
    grouped[key] = rankAndLimit(grouped[key], POI_MAX_PER_CATEGORY);
  });

  debugLog('Filtered POIs along route', grouped);
  return grouped;
}
