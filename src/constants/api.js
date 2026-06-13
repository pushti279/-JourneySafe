export const NOMINATIM_BASE_URL = import.meta.env.DEV
  ? '/api/nominatim'
  : 'https://nominatim.openstreetmap.org';
export const OSRM_BASE_URL = 'https://router.project-osrm.org';
export const OVERPASS_BASE_URL = import.meta.env.DEV
  ? '/api/overpass'
  : 'https://overpass-api.de/api';
export const NOMINATIM_EMAIL = 'dev@journeysafe.local';
export const NOMINATIM_RATE_LIMIT_MS = 1100;
export const AUTOCOMPLETE_DEBOUNCE_MS = 350;
export const AUTOCOMPLETE_MIN_CHARS = 2;
export const POI_MAX_DISTANCE_M = 2000;
export const POI_MAX_PER_CATEGORY = 25;

/** Switch to 'overpass' when connecting live Overpass API */
export const POI_DATA_SOURCE = 'mock';

/** India bounding box for Nominatim bias (south, north, west, east) */
export const INDIA_VIEWBOX = '6.5,68.0,35.5,97.5';

export const POI_CATEGORIES = {
  washrooms: {
    id: 'washrooms',
    title: 'Clean Washrooms',
    emoji: '🚻',
    typeBadge: 'Washroom',
    accent: 'from-sky-50 to-white',
    dot: 'bg-sky-400',
    ring: 'ring-sky-300',
  },
  fuel: {
    id: 'fuel',
    title: 'Fuel Stations',
    emoji: '⛽',
    typeBadge: 'Fuel',
    accent: 'from-amber-50/80 to-white',
    dot: 'bg-amber-400',
    ring: 'ring-amber-300',
  },
  restaurants: {
    id: 'restaurants',
    title: 'Restaurants',
    emoji: '🍽',
    typeBadge: 'Food',
    accent: 'from-violet-50/80 to-white',
    dot: 'bg-violet-400',
    ring: 'ring-violet-300',
  },
  restStops: {
    id: 'restStops',
    title: 'Safe Rest Stops',
    emoji: '🛑',
    typeBadge: 'Rest stop',
    accent: 'from-emerald-50/80 to-white',
    dot: 'bg-emerald-400',
    ring: 'ring-emerald-300',
  },
};

export const POI_LAYERS = POI_CATEGORIES;

export const PLACE_TYPE_TO_CATEGORY = {
  fuel: 'fuel',
  washroom: 'washrooms',
  restaurant: 'restaurants',
  rest_stop: 'restStops',
};
