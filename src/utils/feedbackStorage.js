const STORAGE_KEY = 'journeysafe-place-reviews';
const MAX_IMAGE_BYTES = 800_000;

export function loadAllReviews() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getReviewsForPlace(poiId) {
  return loadAllReviews()
    .filter((r) => r.poiId === poiId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Combined dummy base stats + user-submitted reviews.
 */
export function getPlaceDisplayStats(poi) {
  const userReviews = getReviewsForPlace(poi.id);
  const baseRating = poi.baseRating ?? 0;
  const baseTotalReviews = poi.baseTotalReviews ?? 0;
  const totalReviews = baseTotalReviews + userReviews.length;

  if (userReviews.length === 0) {
    return {
      averageRating: baseRating,
      totalReviews,
      latestReviews: [],
    };
  }

  const userSum = userReviews.reduce((s, r) => s + r.rating, 0);
  const weightedSum = baseRating * baseTotalReviews + userSum;
  const averageRating =
    Math.round((weightedSum / totalReviews) * 10) / 10;

  return {
    averageRating: averageRating || baseRating,
    totalReviews,
    latestReviews: userReviews.slice(0, 2),
  };
}

/**
 * @param {{
 *   poiId: string;
 *   name: string;
 *   category: string;
 *   rating: number;
 *   experience: string;
 *   imageDataUrl?: string | null;
 * }} entry
 */
export function addPlaceReview(entry) {
  const record = {
    id: `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    poiId: entry.poiId,
    name: entry.name,
    category: entry.category,
    rating: entry.rating,
    experience: entry.experience,
    imageDataUrl: entry.imageDataUrl ?? null,
    timestamp: new Date().toISOString(),
  };

  const all = loadAllReviews();
  all.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  console.log('[journeySafe] Saved place review', record);
  return record;
}

export function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith('image/')) {
      reject(new Error('Please upload an image file (JPEG, PNG, etc.).'));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      reject(new Error('Image must be smaller than 800 KB.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.readAsDataURL(file);
  });
}

/** @deprecated Use addPlaceReview */
export function savePlaceFeedback(entry) {
  return addPlaceReview(entry);
}

export function loadFeedbackForPoi(poiId) {
  return getReviewsForPlace(poiId)[0] ?? null;
}
