"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserEmail(user?.email ?? null);
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignUp() {
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Account created! Check your email to confirm your account.");
    }
  }

  async function handleLogin() {
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Logged in successfully!");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setMessage("Logged out successfully.");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          StudySpot Account
        </h1>

        {userEmail ? (
          <div className="mt-6">
            <p className="text-sm text-gray-600">
              Logged in as
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {userEmail}
            </p>

            <button
              onClick={handleLogout}
              className="mt-6 w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Log Out
            </button>

            {message && (
              <p className="mt-4 text-sm text-gray-600">
                {message}
              </p>
            )}
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-gray-500">
              Create an account or log in to leave reviews.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleLogin}
                  className="flex-1 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Log In
                </button>

                <button
                  onClick={handleSignUp}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
                >
                  Sign Up
                </button>
              </div>

              {message && (
                <p className="text-sm text-gray-600">
                  {message}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}