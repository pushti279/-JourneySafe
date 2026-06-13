import { useState } from 'react';
import {
  addPlaceReview,
  readImageAsDataUrl,
} from '../utils/feedbackStorage';

export default function PlaceFeedbackModal({ poi, onClose, onSaved }) {
  const [rating, setRating] = useState(0);
  const [experience, setExperience] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const dataUrl = await readImageAsDataUrl(file);
      setImageDataUrl(dataUrl);
      setImagePreview(dataUrl);
    } catch (err) {
      setError(err.message);
      setImagePreview(null);
      setImageDataUrl(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating < 1) {
      setError('Please select a star rating.');
      return;
    }
    addPlaceReview({
      poiId: poi.id,
      name: poi.name,
      category: poi.category,
      rating,
      experience: experience.trim(),
      imageDataUrl,
    });
    setSaved(true);
    setTimeout(() => {
      onSaved?.();
      onClose();
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2
              id="feedback-modal-title"
              className="text-sm font-semibold text-neutral-900"
            >
              Rate this place
            </h2>
            <p className="mt-0.5 text-[12px] text-neutral-500">{poi.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-xl leading-none ${
                  star <= rating ? 'text-amber-500' : 'text-neutral-300'
                }`}
                aria-label={`${star} stars`}
              >
                ★
              </button>
            ))}
          </div>

          <label className="mt-4 block text-[11px] font-medium text-neutral-500">
            Share your experience
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows={3}
              placeholder="Clean facilities, safe parking, NH48 stop…"
              className="mt-1 w-full resize-none rounded-md border border-neutral-200 bg-white px-2.5 py-2 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-300 focus:outline-none"
            />
          </label>

          <label className="mt-3 block text-[11px] font-medium text-neutral-500">
            📸 Upload photo (optional)
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-[12px] text-neutral-600 file:mr-2 file:rounded-md file:border-0 file:bg-neutral-100 file:px-2 file:py-1 file:text-[12px]"
            />
          </label>

          {imagePreview && (
            <img
              src={imagePreview}
              alt="Your upload preview"
              className="mt-2 h-24 w-auto max-w-full rounded-md border border-neutral-200 object-cover"
            />
          )}

          {error && (
            <p className="mt-2 text-[12px] text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={rating < 1 || saved}
              className="rounded-md bg-neutral-900 px-4 py-2 text-[12px] font-medium text-white disabled:opacity-50"
            >
              {saved ? 'Saved!' : 'Submit review'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-neutral-200 px-4 py-2 text-[12px] font-medium text-neutral-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
