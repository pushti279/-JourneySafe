/**
 * Higher score = more complete / trusted OSM tagging.
 * @param {Record<string, string>} tags
 */
export function scorePoiTags(tags = {}) {
  let score = 0;
  if (tags.name) score += 3;
  if (tags.brand || tags.operator) score += 2;
  if (tags.opening_hours) score += 1;
  if (tags.phone || tags.website) score += 1;
  if (tags.wheelchair === 'yes') score += 1;
  if (tags.toilets === 'yes' || tags['toilets:disposal']) score += 1;
  if (tags.cuisine) {
    score += 2;
    const cuisine = tags.cuisine.toLowerCase();
    if (
      cuisine.includes('indian') ||
      cuisine.includes('regional') ||
      cuisine.includes('punjabi') ||
      cuisine.includes('south_indian')
    ) {
      score += 2;
    }
  }
  if (tags.fee === 'no' || tags.access === 'yes') score += 0.5;
  if (tags.stars) score += Number.parseFloat(tags.stars) || 0;
  if (tags.highway === 'rest_area' || tags.highway === 'services') score += 2;
  const ref = tags.ref ?? '';
  if (/^NH\s?\d+/i.test(ref) || /^NH\d+/i.test(ref)) score += 3;
  return score;
}
