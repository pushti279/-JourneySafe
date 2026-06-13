import { scorePoiTags } from './poiScore';

/** Maps OSM tag score to a 1–5 star display rating. */
export function scoreToStarRating(score, tags = {}) {
  if (tags.stars) {
    const parsed = Number.parseFloat(tags.stars);
    if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 5) {
      return Math.round(parsed);
    }
  }

  if (score >= 10) return 5;
  if (score >= 7) return 4;
  if (score >= 5) return 3;
  if (score >= 3) return 2;
  return 1;
}

export function getPlaceRating(poi) {
  const score = poi.score ?? scorePoiTags(poi.tags);
  return scoreToStarRating(score, poi.tags);
}

export function renderStars(count) {
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}
