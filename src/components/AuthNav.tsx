"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function AuthNav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (loading) {
    return <div className="w-20 h-8 bg-[#e5e0d8] rounded-full animate-pulse" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#6b6b6b]">{user.email}</span>
        <button
          onClick={handleSignOut}
          className="text-sm text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <a
        href="/login"
        className="text-sm text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
      >
        Sign In
      </a>
      <a
        href="/signup"
        className="text-sm bg-[#1a1a1a] text-white px-4 py-2 rounded-full hover:bg-[#333] transition-colors"
      >
        Sign Up
      </a>
    </div>
  );
}
