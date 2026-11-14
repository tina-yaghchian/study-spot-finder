export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-busy="true">
      <span className="sr-only">Loading</span>
      <div className="h-8 w-2/3 max-w-md animate-pulse rounded-md bg-line/70" />
      <div className="mt-3 h-4 w-1/2 max-w-sm animate-pulse rounded-md bg-line/70" />
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-lg border border-line bg-surface"
          />
        ))}
      </div>
    </main>
  );
}
