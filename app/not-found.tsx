import Link from "next/link";
import { buttonPrimary } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <p className="text-sm font-medium text-accent">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">
        We could not find that page
      </h1>
      <p className="mt-2 text-ink-muted">
        The study spot may have been removed, or the link may be incorrect.
      </p>
      <Link href="/" className={`${buttonPrimary} mt-6`}>
        Browse study spots
      </Link>
    </main>
  );
}
