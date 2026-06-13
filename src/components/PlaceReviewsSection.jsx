import { getPlaceDisplayStats } from '../utils/feedbackStorage';
import { renderStars } from '../utils/rating';

function starCountFromAverage(avg) {
  return Math.min(5, Math.max(1, Math.round(avg)));
}

export default function PlaceReviewsSection({ poi, refreshKey = 0 }) {
  void refreshKey;
  const { averageRating, totalReviews, latestReviews } = getPlaceDisplayStats(poi);
  const displayStars = starCountFromAverage(averageRating);

  return (
    <div className="mt-2 border-t border-neutral-100 pt-2">
      <p className="text-[12px] text-amber-600">
        {renderStars(displayStars)}
        <span className="ml-1 text-neutral-700">
          {averageRating.toFixed(1)} · {totalReviews} reviews
        </span>
      </p>

      {poi.description && (
        <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">
          {poi.description}
        </p>
      )}

      {latestReviews.length > 0 && (
        <div className="mt-2 space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
            Recent reviews
          </p>
          {latestReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-md bg-neutral-50 px-2.5 py-2 text-[12px]"
            >
              <p className="text-amber-600">
                {'★'.repeat(review.rating)}
                <span className="text-neutral-400">
                  {'☆'.repeat(5 - review.rating)}
                </span>
              </p>
              {review.experience && (
                <p className="mt-0.5 text-neutral-700">{review.experience}</p>
              )}
              {review.imageDataUrl && (
                <img
                  src={review.imageDataUrl}
                  alt="Review upload"
                  className="mt-1.5 h-16 w-auto max-w-full rounded border border-neutral-200 object-cover"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
