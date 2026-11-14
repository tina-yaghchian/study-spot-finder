"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { buttonGhost, buttonSecondary } from "./ui";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.refresh();
  }

  const signInHref =
    pathname === "/auth" || pathname === "/"
      ? "/auth"
      : `/auth?next=${encodeURIComponent(pathname)}`;

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-ink"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-accent text-white">
            <MapPin className="size-4" aria-hidden />
          </span>
          StudySpot
        </Link>

        <div className="flex min-w-0 items-center gap-2">
          {loading ? (
            <span className="h-9 w-20" aria-hidden />
          ) : user ? (
            <>
              <span
                className="hidden max-w-56 truncate text-sm text-ink-muted sm:block"
                title={user.email}
              >
                {user.email}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className={buttonGhost}
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </button>
            </>
          ) : (
            pathname !== "/auth" && (
              <Link href={signInHref} className={buttonSecondary}>
                Sign in
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
