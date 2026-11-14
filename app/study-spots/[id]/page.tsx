import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowLeft, Building2, MapPin, Navigation } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CRITERIA, formatRating, summarizeReviews } from "@/lib/ratings";
import { directionsUrl } from "@/lib/directions";
import type { Photo, Review, StudySpot } from "@/lib/types";
import SpotMap from "@/components/SpotMap";
import RatingBar from "@/components/RatingBar";
import { buttonSecondary, card } from "@/components/ui";
import ReviewSection from "./ReviewSection";
import PhotoSection from "./PhotoSection";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Shared between generateMetadata and the page so the spot is fetched once.
const getStudySpot = cache(async (id: string) => {
  if (!UUID_PATTERN.test(id)) return null;

  const { data, error } = await supabase
    .from("study_spots")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as StudySpot | null;
});

export async function generateMetadata({
  params,
}: PageProps<"/study-spots/[id]">): Promise<Metadata> {
  const { id } = await params;
  const spot = await getStudySpot(id);

  if (!spot) return { title: "Spot not found" };

  return {
    title: spot.name,
    description: spot.description ?? undefined,
  };
}

export default async function StudySpotPage({
  params,
}: PageProps<"/study-spots/[id]">) {
  const { id } = await params;
  const studySpot = await getStudySpot(id);

  if (!studySpot) notFound();

  const [reviewsResult, photosResult] = await Promise.all([
    supabase
      .from("reviews")
      .select("*")
      .eq("study_spot_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("photos")
      .select("*")
      .eq("study_spot_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (reviewsResult.error) throw new Error(reviewsResult.error.message);
  if (photosResult.error) throw new Error(photosResult.error.message);

  const reviews = (reviewsResult.data ?? []) as Review[];
  const photos = (photosResult.data ?? []) as Photo[];
  const summary = summarizeReviews(reviews);

  const hasLocation =
    studySpot.latitude !== null && studySpot.longitude !== null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All study spots
      </Link>

      <header className="mt-6 flex flex-col gap-6 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          {studySpot.building && (
            <p className="flex items-center gap-1.5 text-sm text-ink-muted">
              <Building2 className="size-4" aria-hidden />
              {studySpot.building}
            </p>
          )}
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {studySpot.name}
          </h1>
          {studySpot.description && (
            <p className="mt-3 text-base text-ink-muted">
              {studySpot.description}
            </p>
          )}
        </div>

        <div className="shrink-0 md:text-right">
          {summary.overall !== null ? (
            <>
              <p className="text-4xl font-semibold tracking-tight text-ink tabular-nums">
                {formatRating(summary.overall)}
                <span className="text-lg font-normal text-ink-subtle"> / 5</span>
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                Average of {summary.count}{" "}
                {summary.count === 1 ? "review" : "reviews"}
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-muted">Not rated yet</p>
          )}
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-8">
          <section className={`${card} p-6`} aria-labelledby="conditions">
            <h2 id="conditions" className="font-semibold text-ink">
              Study conditions
            </h2>
            {summary.averages ? (
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {CRITERIA.map((criterion) => (
                  <RatingBar
                    key={criterion.key}
                    label={criterion.label}
                    value={summary.averages![criterion.key]}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink-muted">
                Ratings will show here once someone reviews this spot.
              </p>
            )}
          </section>

          <PhotoSection studySpotId={studySpot.id} photos={photos} />

          <ReviewSection studySpotId={studySpot.id} reviews={reviews} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <section className={`${card} p-5`} aria-labelledby="location">
            <h2 id="location" className="font-semibold text-ink">
              Location
            </h2>
            {studySpot.address && (
              <p className="mt-2 flex items-start gap-1.5 text-sm text-ink-muted">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                {studySpot.address}
              </p>
            )}

            {hasLocation ? (
              <>
                <div className="mt-4">
                  <SpotMap
                    spots={[
                      {
                        id: studySpot.id,
                        name: studySpot.name,
                        latitude: studySpot.latitude!,
                        longitude: studySpot.longitude!,
                      },
                    ]}
                    className="h-64"
                  />
                </div>
                <a
                  href={directionsUrl(studySpot.latitude!, studySpot.longitude!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${buttonSecondary} mt-4 w-full`}
                >
                  <Navigation className="size-4" aria-hidden />
                  Get directions
                </a>
              </>
            ) : (
              <p className="mt-4 text-sm text-ink-subtle">
                No map location has been added for this spot.
              </p>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
