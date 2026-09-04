"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ReviewFormProps = {
  studySpotId: string;
};

export default function ReviewForm({ studySpotId }: ReviewFormProps) {
  const router = useRouter();

  const [noiseRating, setNoiseRating] = useState(5);
  const [wifiRating, setWifiRating] = useState(5);
  const [outletRating, setOutletRating] = useState(5);
  const [crowdRating, setCrowdRating] = useState(5);
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSubmitting(true);
    setMessage("");

    const { error } = await supabase.from("reviews").insert({
      study_spot_id: studySpotId,
      user_id: null,
      noise_rating: noiseRating,
      wifi_rating: wifiRating,
      outlet_rating: outletRating,
      crowd_rating: crowdRating,
      comment: comment || null,
    });

    if (error) {
      console.error(error);
      setMessage("Could not submit your review. Please try again.");
    } else {
    setMessage("Review submitted successfully!");
    setNoiseRating(5);
    setWifiRating(5);
    setOutletRating(5);
    setCrowdRating(5);
    setComment("");
    router.refresh();
    }

    setSubmitting(false);
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">
        Leave a Review
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Rate this study spot based on your experience.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <RatingInput
          label="🔇 Noise"
          value={noiseRating}
          onChange={setNoiseRating}
        />

        <RatingInput
          label="📶 WiFi"
          value={wifiRating}
          onChange={setWifiRating}
        />

        <RatingInput
          label="🔌 Outlets"
          value={outletRating}
          onChange={setOutletRating}
        />

        <RatingInput
          label="👥 Crowding"
          value={crowdRating}
          onChange={setCrowdRating}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Comment
          </label>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What was your experience like?"
            rows={4}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>

        {message && (
          <p className="text-sm text-gray-600">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

function RatingInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">
        {label}
      </span>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`text-xl ${
              rating <= value ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}