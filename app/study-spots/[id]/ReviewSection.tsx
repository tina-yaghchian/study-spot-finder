"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { CRITERIA } from "@/lib/ratings";
import type { Review } from "@/lib/types";
import { buttonDanger, buttonGhost, buttonPrimary, card } from "@/components/ui";
import FormMessage, { type Message } from "@/components/FormMessage";
import ReviewForm from "./ReviewForm";

type ReviewSectionProps = {
  studySpotId: string;
  reviews: Review[];
};

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default function ReviewSection({
  studySpotId,
  reviews,
}: ReviewSectionProps) {
  const pathname = usePathname();
  const { user, loading } = useCurrentUser();
  const [editing, setEditing] = useState(false);

  // Reviews are sorted newest first, so this is the user's latest review.
  const ownReview = user
    ? reviews.find((review) => review.user_id === user.id)
    : undefined;

  return (
    <section aria-labelledby="reviews" className="space-y-4">
      <h2 id="reviews" className="font-semibold text-ink">
        Reviews{" "}
        <span className="font-normal text-ink-subtle">({reviews.length})</span>
      </h2>

      <div className={`${card} p-6`}>
        {loading ? (
          <div className="h-10 animate-pulse rounded-md bg-canvas" />
        ) : !user ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-muted">
              Sign in to rate this spot and share what it is like.
            </p>
            <Link
              href={`/auth?next=${encodeURIComponent(pathname)}`}
              className={buttonPrimary}
            >
              Sign in to review
            </Link>
          </div>
        ) : ownReview && !editing ? (
          <OwnReviewActions
            review={ownReview}
            userId={user.id}
            onEdit={() => setEditing(true)}
          />
        ) : (
          <>
            <h3 className="mb-5 font-medium text-ink">
              {ownReview ? "Edit your review" : "Write a review"}
            </h3>
            <ReviewForm
              key={ownReview?.id ?? "new"}
              studySpotId={studySpotId}
              userId={user.id}
              existing={ownReview}
              onDone={ownReview ? () => setEditing(false) : undefined}
            />
          </>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-ink-muted">
          No reviews yet. Yours will be the first.
        </p>
      ) : (
        <ul className={`${card} divide-y divide-line`}>
          {reviews.map((review) => (
            <li key={review.id} className="p-5">
              <ReviewItem
                review={review}
                isOwn={user !== null && review.user_id === user.id}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ReviewItem({ review, isOwn }: { review: Review; isOwn: boolean }) {
  return (
    <article>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">
          {isOwn ? "Your review" : "Student review"}
        </p>
        <time
          dateTime={review.created_at}
          className="text-xs text-ink-subtle"
        >
          {dateFormatter.format(new Date(review.created_at))}
        </time>
      </div>

      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {CRITERIA.map((criterion) => (
          <div key={criterion.key} className="flex gap-1.5">
            <dt className="text-ink-muted">{criterion.label}</dt>
            <dd className="font-medium tabular-nums text-ink">
              {review[criterion.column]}/5
            </dd>
          </div>
        ))}
      </dl>

      {review.comment && (
        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-ink">
          {review.comment}
        </p>
      )}
    </article>
  );
}

function OwnReviewActions({
  review,
  userId,
  onEdit,
}: {
  review: Review;
  userId: string;
  onEdit: () => void;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setMessage(null);

    const { data, error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", review.id)
      .eq("user_id", userId)
      .select("id");

    setDeleting(false);

    if (error || !data || data.length === 0) {
      if (error) console.error(error);
      setConfirming(false);
      setMessage({
        type: "error",
        text: "Your review could not be deleted. Please try again.",
      });
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">
          You reviewed this spot on{" "}
          {dateFormatter.format(new Date(review.created_at))}.
        </p>

        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink">Delete your review?</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className={buttonDanger}
            >
              {deleting && (
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
              )}
              Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className={buttonGhost}
            >
              Keep
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button type="button" onClick={onEdit} className={buttonGhost}>
              <Pencil className="size-4" aria-hidden />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className={buttonGhost}
            >
              <Trash2 className="size-4" aria-hidden />
              Delete
            </button>
          </div>
        )}
      </div>

      {message && <FormMessage message={message} />}
    </div>
  );
}
