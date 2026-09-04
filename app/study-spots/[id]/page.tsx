import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReviewForm from "./ReviewForm";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StudySpotPage({ params }: PageProps) {
  const { id } = await params;

  const { data: studySpot, error } = await supabase
    .from("study_spots")
    .select("*")
    .eq("id", id)
    .single();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("study_spot_id", id)
    .order("created_at", { ascending: false });

  if (error || !studySpot) {
    notFound();
  }

const reviewCount = reviews?.length ?? 0;

const averageNoise =
  reviewCount > 0
    ? (reviews ?? []).reduce(
        (sum, review) => sum + review.noise_rating,
        0
      ) / reviewCount
    : null;

const averageWifi =
  reviewCount > 0
    ? (reviews ?? []).reduce(
        (sum, review) => sum + review.wifi_rating,
        0
      ) / reviewCount
    : null;

const averageOutlets =
  reviewCount > 0
    ? (reviews ?? []).reduce(
        (sum, review) => sum + review.outlet_rating,
        0
      ) / reviewCount
    : null;

const averageCrowd =
  reviewCount > 0
    ? (reviews ?? []).reduce(
        (sum, review) => sum + review.crowd_rating,
        0
      ) / reviewCount
    : null;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-xl font-bold text-gray-900"
          >
            📚 StudySpot
          </Link>

          <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">
            Sign In
          </button>
        </div>
      </nav>

      {/* Main content */}
      <section className="mx-auto max-w-5xl px-6 py-12">

        {/* Back button */}
        <Link
          href="/"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to Study Spots
        </Link>

        {/* Study spot heading */}
        <div className="mt-8">
          <p className="text-sm font-medium text-gray-500">
            📍 {studySpot.building}
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900">
            {studySpot.name}
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            {studySpot.description}
          </p>
        </div>

        {/* Information */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">

          {/* Study conditions */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Study Conditions
            </h2>

            <div className="mt-6 space-y-5">

                <div className="flex items-center justify-between">
                <span>🔇 Noise</span>
                <span className="text-gray-600">
                    {averageNoise !== null
                    ? `⭐ ${averageNoise.toFixed(1)} / 5`
                    : "No ratings yet"}
                </span>
            </div>

            <div className="flex items-center justify-between">
                <span>📶 WiFi</span>
                <span className="text-gray-600">
                    {averageWifi !== null
                    ? `⭐ ${averageWifi.toFixed(1)} / 5`
                    : "No ratings yet"}
                </span>
            </div>

            <div className="flex items-center justify-between">
                <span>🔌 Outlets</span>
                <span className="text-gray-600">
                    {averageOutlets !== null
                    ? `⭐ ${averageOutlets.toFixed(1)} / 5`
                    : "No ratings yet"}
                </span>
            </div>

            <div className="flex items-center justify-between">
                <span>👥 Crowding</span>
                <span className="text-gray-600">
                    {averageCrowd !== null
                    ? `⭐ ${averageCrowd.toFixed(1)} / 5`
                    : "No ratings yet"}
                </span>
            </div>

            </div>
          </div>

          {/* Location */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Location
            </h2>

            <p className="mt-4 text-gray-600">
              {studySpot.address}
            </p>

            <div className="mt-6 rounded-xl bg-gray-100 p-6 text-center">
              <p className="text-sm text-gray-500">
                🗺️ Map coming soon
              </p>
            </div>
          </div>

        </div>

        {/* Reviews */}
        <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Student Reviews
          </h2>

{reviews && reviews.length > 0 ? (
  <div className="mt-4 space-y-4">
    {reviews.map((review) => (
      <div
        key={review.id}
        className="border-t pt-4"
      >
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>🔇 Noise</span>
            <span>⭐ {review.noise_rating} / 5</span>
          </div>

          <div className="flex justify-between">
            <span>📶 WiFi</span>
            <span>⭐ {review.wifi_rating} / 5</span>
          </div>

          <div className="flex justify-between">
            <span>🔌 Outlets</span>
            <span>⭐ {review.outlet_rating} / 5</span>
          </div>

          <div className="flex justify-between">
            <span>👥 Crowding</span>
            <span>⭐ {review.crowd_rating} / 5</span>
          </div>
        </div>

        {review.comment && (
          <p className="mt-3 text-gray-600">
            "{review.comment}"
          </p>
        )}

        <p className="mt-2 text-xs text-gray-500">
            {new Date(review.created_at).toLocaleDateString()}
        </p>
        
      </div>
    ))}
  </div>
) : (
  <p className="mt-4 text-gray-500">
    No reviews yet. Be the first to review this study spot!
  </p>
)}
        </div>

      </section>

        <div className="mt-6">
            <ReviewForm studySpotId={studySpot.id} />
        </div>
    </main>
  );
}