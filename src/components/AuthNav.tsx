"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getProfile, updateProfile, uploadAvatar, type Profile } from "@/lib/profile";

export default function AuthNav() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [uploading, setUploading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) loadProfile();
      else setProfile(null);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setEditing(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const loadProfile = async () => {
    const p = await getProfile();
    setProfile(p);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleSaveProfile = async () => {
    if (!newUsername.trim()) return;
    setUploading(true);
    try {
      await updateProfile({ username: newUsername.trim() });
      setProfile((prev) => prev ? { ...prev, username: newUsername.trim() } : null);
      setEditing(false);
    } catch {}
    setUploading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadAvatar(file);
      if (url) {
        await updateProfile({ avatar_url: url });
        setProfile((prev) => prev ? { ...prev, avatar_url: url } : null);
      }
    } catch {}
    setUploading(false);
  };

  if (loading) {
    return <div className="w-20 h-8 bg-[#e5e0d8] rounded-full animate-pulse" />;
  }

  if (!profile) {
    return (
      <div className="flex items-center gap-3">
        <a href="/login" className="text-sm text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">Sign In</a>
        <a href="/signup" className="text-sm text-white px-4 py-2 rounded-full transition-colors" style={{ backgroundColor: "#10B981" }}>Sign Up</a>
      </div>
    );
  }

  const username = profile.username || profile.id?.split("@")?.[0] || "User";
  const email = profile.id || "";

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
      >
        {/* Avatar */}
        {profile.avatar_url ? (
          <img src={profile.avatar_url} className="w-8 h-8 rounded-full object-cover border-2 border-[#10B981]" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-white text-sm font-bold">
            {(username || "U")[0].toUpperCase()}
          </div>
        )}
        <span className="text-sm text-[#1a1a1a] font-medium max-w-[120px] truncate hidden sm:block">{username}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-[#e5e0d8] rounded-2xl shadow-lg z-50 p-4">
          {/* Avatar area */}
          <div className="flex items-center gap-3 mb-3">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} className="w-12 h-12 rounded-full object-cover border-2 border-[#10B981]" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#10B981] flex items-center justify-center text-white text-xl font-bold">
                {(username || "U")[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1a1a1a] truncate">{username}</p>
              <p className="text-xs text-[#6b6b6b] truncate">{email}</p>
            </div>
          </div>

          {editing ? (
            <div className="space-y-2">
              <input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full text-sm border border-[#e5e0d8] rounded-lg px-3 py-2 outline-none focus:border-[#10B981]"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveProfile(); if (e.key === "Escape") setEditing(false); }}
              />
              <div className="flex gap-2">
                <button onClick={handleSaveProfile} disabled={uploading} className="flex-1 text-xs bg-[#10B981] text-white px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-50">
                  {uploading ? "Saving..." : "Save"}
                </button>
                <button onClick={() => setEditing(false)} className="text-xs text-[#6b6b6b] px-3 py-1.5 rounded-lg hover:bg-[#f5f2ed] cursor-pointer">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <button
                onClick={() => { setNewUsername(username); setEditing(true); }}
                className="w-full text-left text-sm text-[#1a1a1a] px-3 py-2 rounded-lg hover:bg-[#f5f2ed] cursor-pointer"
              >
                Edit Profile
              </button>
              <label className="w-full text-left text-sm text-[#1a1a1a] px-3 py-2 rounded-lg hover:bg-[#f5f2ed] cursor-pointer block">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                {uploading ? "Uploading..." : "Change Avatar"}
              </label>
              <hr className="my-1 border-[#e5e0d8]" />
              <button
                onClick={handleSignOut}
                className="w-full text-left text-sm text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
