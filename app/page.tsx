import { supabase } from "@/lib/supabase";
import { summarizeReviews } from "@/lib/ratings";
import type { Review, StudySpot } from "@/lib/types";
import SpotExplorer, { type SpotWithSummary } from "./SpotExplorer";

type RatingRow = Pick<
  Review,
  | "study_spot_id"
  | "noise_rating"
  | "wifi_rating"
  | "outlet_rating"
  | "crowd_rating"
>;

export default async function Home({ searchParams }: PageProps<"/">) {
  const [spotsResult, reviewsResult, params] = await Promise.all([
    supabase.from("study_spots").select("*").order("name"),
    supabase
      .from("reviews")
      .select(
        "study_spot_id, noise_rating, wifi_rating, outlet_rating, crowd_rating"
      ),
    searchParams,
  ]);

  if (spotsResult.error) throw new Error(spotsResult.error.message);
  if (reviewsResult.error) throw new Error(reviewsResult.error.message);

  const spots = (spotsResult.data ?? []) as StudySpot[];
  const ratings = (reviewsResult.data ?? []) as RatingRow[];

  const ratingsBySpot = new Map<string, RatingRow[]>();
  for (const row of ratings) {
    const list = ratingsBySpot.get(row.study_spot_id) ?? [];
    list.push(row);
    ratingsBySpot.set(row.study_spot_id, list);
  }

  const spotsWithSummary: SpotWithSummary[] = spots.map((spot) => ({
    ...spot,
    summary: summarizeReviews(ratingsBySpot.get(spot.id) ?? []),
  }));

  const initialQuery = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ])
  ) as Record<string, string | undefined>;

  return (
    <main>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <p className="text-sm font-medium text-accent">
            University of Waterloo
          </p>
          <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Compare campus study spaces before you walk over.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-ink-muted">
            Students rate each space on quietness, WiFi, outlets and how
            easy it is to find a seat. Filter by what you need, or rank spots
            by what matters most to you.
          </p>
          <p className="mt-6 text-sm text-ink-subtle">
            {spots.length} {spots.length === 1 ? "space" : "spaces"} listed,{" "}
            {ratings.length} {ratings.length === 1 ? "review" : "reviews"} so
            far
          </p>
        </div>
      </section>

      <SpotExplorer spots={spotsWithSummary} initialQuery={initialQuery} />
    </main>
  );
}
