"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({
          type: "success",
          text: "Account created! Check your email for a verification link, then come back to sign in.",
        });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        router.push("/");
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm"
            style={{ backgroundColor: "#10B981" }}
          >
            <span className="text-white text-2xl font-bold italic tracking-tight">D</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1 tracking-tight">
            DotDraw, your design agent
          </h1>
          <p className="text-sm text-[#6b6b6b] mt-2">
            {mode === "login"
              ? "Sign in to your DotDraw account"
              : "Create anything you can describe"}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#e5e0d8] rounded-2xl p-6 space-y-4 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full bg-[#faf8f5] border border-[#e5e0d8] rounded-xl px-4 py-2.5 text-sm text-[#1a1a1a] placeholder-[#6b6b6b] outline-none focus:border-[#10B981] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full bg-[#faf8f5] border border-[#e5e0d8] rounded-xl px-4 py-2.5 text-sm text-[#1a1a1a] placeholder-[#6b6b6b] outline-none focus:border-[#10B981] transition-colors"
            />
          </div>

          {/* Message */}
          {message && (
            <div
              className={`text-sm p-3 rounded-xl ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white text-sm font-medium py-2.5 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
            style={{ backgroundColor: "#10B981" }}
          >
            {loading
              ? "Working..."
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
          </button>

          {/* Toggle mode */}
          <p className="text-center text-sm text-[#6b6b6b]">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <a
                  href="/signup"
                  className="text-[#10B981] font-medium hover:underline"
                >
                  Sign Up
                </a>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-[#10B981] font-medium hover:underline"
                >
                  Sign In
                </a>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
