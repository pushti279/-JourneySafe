import { useState } from 'react';
import { ROUTE_STATUS } from '../hooks/useRoute';
import { usePOIs } from '../hooks/usePOIs';
import { useRoute } from '../hooks/useRoute';
import AutocompleteField from './AutocompleteField';
import LoadingSpinner from './ui/LoadingSpinner';
import RouteMap from './RouteMap';
import RouteResults from './RouteResults';
import { getPlacesByType } from '../services/placeService';
import { getReviewsByPlaceId } from '../services/reviewService';
import { createReview } from '../services/reviewService';
import { uploadReviewImage } from '../services/storageService';



function RouteSearchCard({
  disabled,
  validationError,
  onStartSelect,
  onEndSelect,
  onSearch,
  isLoading,
}) {
  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-xl border border-neutral-200/80 bg-white p-1 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-4px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-stretch">
          <AutocompleteField
            label="From"
            placeholder="Starting location"
            disabled={disabled}
            onPlaceSelect={onStartSelect}
          />

          <div
            className="hidden w-px shrink-0 bg-neutral-100 sm:block sm:self-stretch sm:my-2"
            aria-hidden
          />

          <div className="mx-3 h-px bg-neutral-100 sm:hidden" aria-hidden />

          <AutocompleteField
            label="To"
            placeholder="Destination"
            disabled={disabled}
            onPlaceSelect={onEndSelect}
          />

          <button
            type="button"
            onClick={onSearch}
            disabled={disabled}
            className="m-1 flex shrink-0 items-center justify-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70 sm:m-1 sm:px-6"
          >
            {isLoading ? (
              <LoadingSpinner className="h-4 w-4" />
            ) : (
              <svg
                className="h-4 w-4 opacity-80"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            )}
            {isLoading ? 'Searching…' : 'Search route'}
          </button>
        </div>
      </div>
      {validationError && (
        <p className="mt-2 text-left text-[13px] text-red-600" role="alert">
          {validationError}
        </p>
      )}
    </div>
  );
}

//routesearch()
export default function RouteSearch() {
  const [startPlace, setStartPlace] = useState(null);
  const [endPlace, setEndPlace] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
const [places, setPlaces] = useState([]);
const [selectedPlace, setSelectedPlace] = useState(null);
const [reviews, setReviews] = useState([]);
const [userName, setUserName] = useState('');
const [rating, setRating] = useState(5);
const [reviewText, setReviewText] = useState('');
const [imageFile, setImageFile] = useState(null);

const handleCategoryClick = async (type) => {
  try {
    setSelectedCategory(type);
    setSelectedPlace(null);

    const data = await getPlacesByType(type);

    console.log('Fetched places:', data);

    setPlaces(data || []);
  } catch (error) {
    console.error('Error fetching places:', error);
  }
};

const handleSubmitReview = async () => {
  try {
    let imageUrl = null;

    if (imageFile) {
      imageUrl = await uploadReviewImage(imageFile);
    }

    await createReview({
      place_id: selectedPlace.id,
      user_name: userName,
      rating,
      review_text: reviewText,
      image_url: imageUrl,
    });

    alert('Review submitted successfully!');

    const updatedReviews = await getReviewsByPlaceId(
      selectedPlace.id
    );

    setReviews(updatedReviews);

    setUserName('');
    setRating(5);
    setReviewText('');
    setImageFile(null);

  } catch (error) {
  console.error('FULL ERROR:', error);
  alert(JSON.stringify(error));
}
};

  const {
    routeData,
    searchRoute,
    isLoading: routeLoading,
    error: routeError,
    hasRoute,
    status,
  } = useRoute();

  const {
    pois,
    isLoading: poisLoading,
    error: poisError,
    totalCount,
  } = usePOIs(routeData);

  const handleSearch = () => {
    if (!startPlace || !endPlace) {
      setValidationError(
        'Please select both start and destination from the suggestions dropdown.',
      );
      return;
    }
    setValidationError('');
    searchRoute(startPlace, endPlace);
  };

  const showResults = hasRoute && routeData;
  const isEmpty = status === ROUTE_STATUS.IDLE && !routeLoading && !showResults;

  return (
    <div className="flex w-full flex-col items-center">
      <RouteSearchCard
        disabled={routeLoading}
        validationError={validationError}
        onStartSelect={setStartPlace}
        onEndSelect={setEndPlace}
        onSearch={handleSearch}
        isLoading={routeLoading}
      />

      {routeLoading && (
        <div
          className="mt-8 w-full max-w-3xl rounded-xl border border-neutral-200/80 bg-white p-8 text-center"
          role="status"
          aria-live="polite"
        >
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
            <LoadingSpinner />
          </div>
          <p className="mt-3 text-sm font-medium text-neutral-800">
            Finding your route…
          </p>
          <p className="mt-1 text-[13px] text-neutral-500">
            Geocoding locations and calculating the driving path.
          </p>
        </div>
      )}

      {status === ROUTE_STATUS.ERROR && routeError && (
        <div
          className="mt-8 w-full max-w-3xl rounded-xl border border-red-200 bg-red-50/80 p-5 text-left"
          role="alert"
        >
          <p className="text-sm font-medium text-red-800">Route search failed</p>
          <p className="mt-1 text-[13px] text-red-700">{routeError}</p>
        </div>
      )}

      {isEmpty && (
        <>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
  <button
    onClick={() => handleCategoryClick('washroom')}
    className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
  >
    🚻 Washrooms
  </button>

  <button
    onClick={() => handleCategoryClick('fuel')}
    className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700"
  >
    ⛽ Fuel Stations
  </button>

  <button
    onClick={() => handleCategoryClick('restaurant')}
    className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700"
  >
    🍽 Restaurants
  </button>

  <button
    onClick={() => handleCategoryClick('rest_stop')}
    className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700"
  >
    🛑 Safe Rest Stops
  </button>
</div>

{places.length > 0 && (
  <div className="mt-6 flex w-full max-w-6xl gap-4">

    {/* Left Side - Places List */}
    <div
      className={`transition-all duration-300 ${
        selectedPlace ? 'w-2/3' : 'w-full'
      }`}
    >
      <h3 className="mb-4 text-left text-lg font-semibold capitalize">
        {selectedCategory?.replace('_', ' ')}
      </h3>

      <div className="space-y-3">
        {places.map((place) => (
          <div
            key={place.id}
            onClick={async () => {
  setSelectedPlace(place);

  const reviewData = await getReviewsByPlaceId(place.id);

  setReviews(reviewData);
}}
            className={`cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition-all hover:border-neutral-300 ${
              selectedPlace?.id === place.id
                ? 'border-neutral-900'
                : 'border-neutral-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{place.name}</h4>

                <p className="mt-1 text-sm text-neutral-500">
                  {place.description}
                </p>

                <div className="mt-2 flex gap-4 text-sm text-neutral-600">
                  <span>⭐ {place.rating}</span>
                  <span>📝 {place.total_reviews} reviews</span>
                  <span>📍 {place.distance_from_route} km</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Right Side - Details Panel */}
    {selectedPlace && (
      
      <div className="w-1/3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="text-xl font-semibold">
          {selectedPlace.name}
        </h3>

        <p className="mt-3 text-neutral-600">
          {selectedPlace.description}
        </p>

        <div className="mt-4 space-y-2 text-sm">
          <p>⭐ Rating: {selectedPlace.rating}</p>
          <p>📝 Reviews: {selectedPlace.total_reviews}</p>
          <p>📍 Distance: {selectedPlace.distance_from_route} km</p>
        </div>
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
  <p className="font-semibold text-green-700">
    🟢 Safety Score:{' '}
    {Math.min(
      100,
      Math.round(
        (selectedPlace.rating || 0) * 20 +
        Math.min(selectedPlace.total_reviews || 0, 20)
      )
    )}
    /100
  </p>

  <p className="mt-1 text-sm text-green-600">
    Safe for highway travellers
  </p>
</div>

        <div className="mt-6 rounded-lg bg-neutral-50 p-4">
          <h4 className="font-medium">Amenities</h4>

          <ul className="mt-2 space-y-1 text-sm text-neutral-600">
            <li>✓ Parking Available</li>
            <li>✓ Drinking Water</li>
            <li>✓ Clean Facility</li>
            <li>✓ Traveler Friendly</li>
          </ul>
        </div>

        <div className="mt-6">
  <h4 className="font-medium">
    Community Reviews
  </h4>
  <div className="mt-6 border-t pt-6">
  <h4 className="font-medium">
    Share Your Experience
  </h4>

  <input
    type="text"
    placeholder="Your name"
    value={userName}
    onChange={(e) => setUserName(e.target.value)}
    className="mt-3 w-full rounded-lg border p-2"
  />

  <input
    type="number"
    min="1"
    max="5"
    value={rating}
    onChange={(e) => setRating(Number(e.target.value))}
    className="mt-3 w-full rounded-lg border p-2"
  />

  <textarea
    rows={4}
    placeholder="Write your experience..."
    value={reviewText}
    onChange={(e) => setReviewText(e.target.value)}
    className="mt-3 w-full rounded-lg border p-2"
  />
  <input
  type="file"
  accept="image/*"
  onChange={(e) => setImageFile(e.target.files[0])}
  className="mt-3"
/>

  <button
    onClick={handleSubmitReview}
    className="mt-3 rounded-lg bg-neutral-900 px-4 py-2 text-white"
  >
    Submit Review
  </button>
</div>

  {reviews.length === 0 ? (
    <p className="mt-2 text-sm text-neutral-500">
      No reviews yet.
    </p>
  ) : (
    <div className="mt-3 space-y-3">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-lg border p-3"
        >
          <div className="flex items-center justify-between">
            <p className="font-medium">
              {review.user_name}
            </p>

            <p>
              ⭐ {review.rating}
            </p>
          </div>

          <p className="mt-2 text-sm text-neutral-600">
            {review.review_text}
          </p>
          {review.image_url && (
  <img
    src={review.image_url}
    alt="Review"
    className="mt-3 h-48 w-full rounded-lg object-cover border"
  />
)}
        </div>
      ))}
    </div>
  )}
</div>

        <div className="mt-6 flex flex-col gap-2">
          <button
  onClick={() =>
    window.open(
      `https://www.google.com/maps?q=${selectedPlace.latitude},${selectedPlace.longitude}`,
      '_blank'
    )
  }
  className="rounded-lg bg-neutral-900 py-2 text-white"
>
  Go Here
</button>

          <button className="rounded-lg border py-2">
            Rate Place
          </button>

          <button className="rounded-lg border py-2">
            Share Experience
          </button>
        </div>
      </div>
    )}

  </div>
)}

        <div className="mt-8 w-full max-w-3xl rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-6 text-center">
          <p className="text-sm font-medium text-neutral-600">
            Enter a start and end point to see your route on the map
          </p>
          <p className="mt-1 text-[13px] text-neutral-400">
            Example: Mumbai → Pune
          </p>
          <div className="mt-4 h-[200px] opacity-60">
            <RouteMap routeData={null} visiblePois={null} className="h-full" />
          </div>
        </div>
        </>
      )}

      {showResults && (
        <RouteResults
          routeData={routeData}
          pois={pois}
          poisLoading={poisLoading}
          poisError={poisError}
          totalCount={totalCount}
        />
      )}
    </div>
  );
}
