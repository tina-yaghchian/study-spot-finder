import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: studySpots, error } = await supabase
    .from("study_spots")
    .select("*")
    .order("name");

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-2xl font-bold text-red-600">
          Something went wrong
        </h1>
        <p className="mt-2 text-gray-600">{error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            📚 StudySpot
          </h1>

          <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">
          Find your perfect study spot
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Discover the best places to study on campus based on noise,
          WiFi, outlets, and crowd levels.
        </p>

        {/* Search */}
        <div className="mx-auto mt-8 max-w-xl">
          <input
            type="text"
            placeholder="Search for a study spot..."
            className="w-full rounded-xl border border-gray-300 bg-white px-5 py-4 shadow-sm outline-none focus:border-gray-500"
          />
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap justify-center gap-3">
          <button className="rounded-full border bg-white px-5 py-2 text-sm">
            🔇 Quiet
          </button>

          <button className="rounded-full border bg-white px-5 py-2 text-sm">
            📶 Good WiFi
          </button>

          <button className="rounded-full border bg-white px-5 py-2 text-sm">
            🔌 Lots of Outlets
          </button>

          <button className="rounded-full border bg-white px-5 py-2 text-sm">
            👥 Not Crowded
          </button>
        </div>
      </section>

      {/* Study Spots */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Study Spots
          </h3>

          <p className="mt-1 text-gray-600">
            Explore places to study around campus.
          </p>
        </div>

        {studySpots.length === 0 ? (
          <p className="text-gray-500">
            No study spots found.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {studySpots.map((spot) => (
              <div
                key={spot.id}
                className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4">
                  <h4 className="text-xl font-semibold text-gray-900">
                    {spot.name}
                  </h4>

                  <p className="mt-1 text-sm text-gray-500">
                    📍 {spot.building}
                  </p>
                </div>

                <p className="text-sm leading-6 text-gray-600">
                  {spot.description}
                </p>

                <div className="mt-5">
                  <p className="text-sm text-gray-500">
                    {spot.address}
                  </p>
                </div>

                <button className="mt-5 w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
                  View Study Spot
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}