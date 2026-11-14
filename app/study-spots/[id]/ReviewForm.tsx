"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CRITERIA, type CriterionKey } from "@/lib/ratings";
import type { Review } from "@/lib/types";
import { buttonGhost, buttonPrimary, input } from "@/components/ui";
import FormMessage, { type Message } from "@/components/FormMessage";

const COMMENT_LIMIT = 1000;

type Ratings = Record<CriterionKey, number | null>;

type ReviewFormProps = {
  studySpotId: string;
  userId: string;
  /** When set, the form edits this review instead of creating a new one. */
  existing?: Review;
  onDone?: () => void;
};

function ratingsFrom(review?: Review): Ratings {
  return {
    noise: review?.noise_rating ?? null,
    wifi: review?.wifi_rating ?? null,
    outlets: review?.outlet_rating ?? null,
    crowd: review?.crowd_rating ?? null,
  };
}

export default function ReviewForm({
  studySpotId,
  userId,
  existing,
  onDone,
}: ReviewFormProps) {
  const router = useRouter();
  const [ratings, setRatings] = useState<Ratings>(() => ratingsFrom(existing));
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const missing = CRITERIA.filter((c) => ratings[c.key] === null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (missing.length > 0) {
      setMessage({
        type: "error",
        text: `Please rate ${missing.map((c) => c.label.toLowerCase()).join(", ")}.`,
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const values = {
      noise_rating: ratings.noise!,
      wifi_rating: ratings.wifi!,
      outlet_rating: ratings.outlets!,
      crowd_rating: ratings.crowd!,
      comment: comment.trim() || null,
    };

    const { data, error } = existing
      ? await supabase
          .from("reviews")
          .update(values)
          .eq("id", existing.id)
          .eq("user_id", userId)
          .select("id")
      : await supabase
          .from("reviews")
          .insert({ ...values, study_spot_id: studySpotId, user_id: userId })
          .select("id");

    setSubmitting(false);

    // Row level security can silently reject an update, which returns no rows.
    if (error || !data || data.length === 0) {
      if (error) console.error(error);
      setMessage({
        type: "error",
        text: existing
          ? "Your changes could not be saved. Please try again."
          : "Your review could not be submitted. Please try again.",
      });
      return;
    }

    if (!existing) {
      setRatings(ratingsFrom());
      setComment("");
    }

    router.refresh();
    onDone?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {CRITERIA.map((criterion) => (
        <RatingInput
          key={criterion.key}
          label={criterion.label}
          lowLabel={criterion.lowLabel}
          highLabel={criterion.highLabel}
          value={ratings[criterion.key]}
          onChange={(value) =>
            setRatings((r) => ({ ...r, [criterion.key]: value }))
          }
        />
      ))}

      <div>
        <div className="flex items-baseline justify-between">
          <label
            htmlFor={`comment-${existing?.id ?? "new"}`}
            className="text-sm font-medium text-ink"
          >
            Comment <span className="font-normal text-ink-subtle">(optional)</span>
          </label>
          <span className="text-xs tabular-nums text-ink-subtle">
            {comment.length} / {COMMENT_LIMIT}
          </span>
        </div>
        <textarea
          id={`comment-${existing?.id ?? "new"}`}
          value={comment}
          maxLength={COMMENT_LIMIT}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Best time to go, where the outlets are, anything else worth knowing"
          rows={4}
          className={`${input} mt-2 resize-y`}
        />
      </div>

      {message && <FormMessage message={message} />}

      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className={buttonPrimary}>
          {submitting && (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          )}
          {existing ? "Save changes" : "Post review"}
        </button>
        {onDone && (
          <button type="button" onClick={onDone} className={buttonGhost}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function RatingInput({
  label,
  lowLabel,
  highLabel,
  value,
  onChange,
}: {
  label: string;
  lowLabel: string;
  highLabel: string;
  value: number | null;
  onChange: (value: number) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">{label}</legend>
      <div
        role="radiogroup"
        aria-label={label}
        className="mt-2 grid grid-cols-5 overflow-hidden rounded-md border border-line-strong"
      >
        {[1, 2, 3, 4, 5].map((rating) => {
          const selected = value === rating;
          return (
            <button
              key={rating}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${rating} out of 5`}
              onClick={() => onChange(rating)}
              className={`border-l border-line-strong py-2 text-sm tabular-nums first:border-l-0 ${
                selected
                  ? "bg-accent font-medium text-white"
                  : "bg-surface text-ink-muted hover:bg-canvas"
              }`}
            >
              {rating}
            </button>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-xs text-ink-subtle">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </fieldset>
  );
}
