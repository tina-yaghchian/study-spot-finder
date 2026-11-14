import type { Metadata } from "next";
import { safeRedirectPath } from "@/lib/redirect";
import AuthForm from "./AuthForm";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function AuthPage({ searchParams }: PageProps<"/auth">) {
  const { next } = await searchParams;
  const redirectTo = safeRedirectPath(Array.isArray(next) ? next[0] : next);

  return (
    <main className="mx-auto flex max-w-6xl justify-center px-4 py-12 sm:px-6 sm:py-20">
      <AuthForm redirectTo={redirectTo} />
    </main>
  );
}
