"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { buttonPrimary, buttonSecondary, card, input } from "@/components/ui";
import FormMessage, { type Message } from "@/components/FormMessage";

type Mode = "sign-in" | "sign-up";

const MIN_PASSWORD_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setMessage(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);

    const trimmedEmail = email.trim();

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setMessage({ type: "error", text: "Enter a valid email address." });
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setMessage({
        type: "error",
        text: `Passwords must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      });
      return;
    }

    setSubmitting(true);

    if (mode === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        setSubmitting(false);
        setMessage({ type: "error", text: error.message });
        return;
      }

      router.push(redirectTo);
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
    });

    setSubmitting(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    // With email confirmation turned off, Supabase signs the user in right away.
    if (data.session) {
      router.push(redirectTo);
      router.refresh();
      return;
    }

    setPassword("");
    setMessage({
      type: "success",
      text: "Check your inbox for a confirmation link, then come back to sign in.",
    });
    setMode("sign-in");
  }

  if (loading) {
    return <div className={`${card} h-80 w-full max-w-sm animate-pulse`} />;
  }

  if (user) {
    return (
      <div className={`${card} w-full max-w-sm p-6`}>
        <h1 className="text-xl font-semibold text-ink">You are signed in</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Signed in as <span className="font-medium text-ink">{user.email}</span>
        </p>
        <Link href={redirectTo} className={`${buttonPrimary} mt-6 w-full`}>
          Continue
        </Link>
      </div>
    );
  }

  const isSignIn = mode === "sign-in";

  return (
    <div className={`${card} w-full max-w-sm p-6`}>
      <h1 className="text-xl font-semibold text-ink">
        {isSignIn ? "Sign in" : "Create an account"}
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        {isSignIn
          ? "Sign in to review spots and add photos."
          : "An account lets you review spots and add photos."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${input} mt-1.5`}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-medium text-ink">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={isSignIn ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${input} mt-1.5`}
            required
            minLength={MIN_PASSWORD_LENGTH}
          />
          {!isSignIn && (
            <p className="mt-1.5 text-xs text-ink-subtle">
              At least {MIN_PASSWORD_LENGTH} characters
            </p>
          )}
        </div>

        {message && <FormMessage message={message} />}

        <button
          type="submit"
          disabled={submitting}
          className={`${buttonPrimary} w-full`}
        >
          {submitting && (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          )}
          {isSignIn ? "Sign in" : "Create account"}
        </button>
      </form>

      <div className="mt-6 border-t border-line pt-4 text-center text-sm text-ink-muted">
        {isSignIn ? "New here?" : "Already have an account?"}
        <button
          type="button"
          onClick={() => switchMode(isSignIn ? "sign-up" : "sign-in")}
          className={`${buttonSecondary} mt-3 w-full`}
        >
          {isSignIn ? "Create an account" : "Sign in instead"}
        </button>
      </div>
    </div>
  );
}
