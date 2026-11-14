"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonPrimary, buttonSecondary } from "@/components/ui";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <h1 className="text-2xl font-semibold text-ink">
        This page could not be loaded
      </h1>
      <p className="mt-2 text-ink-muted">
        The study spot data is not available right now. Check your connection
        and try again.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" onClick={() => retry()} className={buttonPrimary}>
          Try again
        </button>
        <Link href="/" className={buttonSecondary}>
          Go to all spots
        </Link>
      </div>
    </main>
  );
}
