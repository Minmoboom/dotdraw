"use client";

import { useState } from "react";

type Tab = "image" | "video";
type ImageCount = 1 | 2 | 4;
type ImageResolution = "1k" | "2k" | "4k";
type VideoResolution = "auto" | "480p" | "720p";
type Duration = "auto" | "4s" | "5s" | "6s" | "8s" | "10s" | "15s";

interface Ratio {
  label: string;
  w: number;
  h: number;
}

const RATIOS: Ratio[] = [
  { label: "Auto", w: 0, h: 0 }, // special: dashed
  { label: "1:1", w: 1, h: 1 },
  { label: "4:5", w: 4, h: 5 },
  { label: "3:4", w: 3, h: 4 },
  { label: "2:3", w: 2, h: 3 },
  { label: "9:16", w: 9, h: 16 },
  { label: "5:4", w: 5, h: 4 },
  { label: "4:3", w: 4, h: 3 },
  { label: "3:2", w: 3, h: 2 },
  { label: "16:9", w: 16, h: 9 },
  { label: "2:1", w: 2, h: 1 },
  { label: "21:9", w: 21, h: 9 },
];

// Render a small rectangle icon representing the aspect ratio
function RatioIcon({ w, h, isAuto }: { w: number; h: number; isAuto: boolean }) {
  if (isAuto) {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect
          x="2"
          y="2"
          width="14"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="3 2"
          fill="none"
        />
      </svg>
    );
  }

  // Scale to fit 18x18 viewBox
  const maxDim = Math.max(w, h);
  const scale = 14 / maxDim;
  const rw = w * scale;
  const rh = h * scale;
  const rx = (18 - rw) / 2;
  const ry = (18 - rh) / 2;

  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect
        x={rx}
        y={ry}
        width={rw}
        height={rh}
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

interface GenerationSettingsProps {
  onSettingsChange?: (settings: {
    tab: Tab;
    imageCount: ImageCount;
    ratio: string;
    resolution: string;
    videoResolution: VideoResolution;
    duration: Duration;
  }) => void;
}

export default function GenerationSettings({ onSettingsChange }: GenerationSettingsProps) {
  const [tab, setTab] = useState<Tab>("image");
  const [imageCount, setImageCount] = useState<ImageCount>(1);
  const [ratio, setRatio] = useState("Auto");
  const [imageResolution, setImageResolution] = useState<ImageResolution>("1k");
  const [videoResolution, setVideoResolution] = useState<VideoResolution>("auto");
  const [duration, setDuration] = useState<Duration>("auto");

  const updateSettings = (newTab?: Tab) => {
    if (newTab) setTab(newTab);
    onSettingsChange?.({
      tab: newTab ?? tab,
      imageCount,
      ratio,
      resolution: imageResolution,
      videoResolution,
      duration,
    });
  };

  return (
    <div className="px-6 pb-3">
      {/* Tab Row */}
      <div className="flex items-center gap-1 bg-[#eae5dc] rounded-full p-1 mb-3 w-fit">
        {(["image", "video"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => updateSettings(t)}
            className={`text-xs font-medium py-1.5 px-4 rounded-full transition-all capitalize cursor-pointer ${
              tab === t
                ? "bg-white text-[#1a1a1a] shadow-sm"
                : "text-[#6b6b6b] hover:text-[#1a1a1a]"
            }`}
          >
            {t === "image" ? "Image" : t === "video" ? "Video" : "Model"}
          </button>
        ))}
      </div>

      {/* Image Settings */}
      {tab === "image" && (
        <div className="space-y-3">
          {/* Image Count */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#6b6b6b] uppercase tracking-wider w-10 flex-shrink-0">
              Images
            </span>
            <div className="flex gap-1">
              {([1, 2, 4] as ImageCount[]).map((n) => (
                <button
                  key={n}
                  onClick={() => { setImageCount(n); onSettingsChange?.({ tab, imageCount: n, ratio, resolution: imageResolution, videoResolution, duration }); }}
                  className={`w-8 h-7 text-xs rounded-lg transition-all cursor-pointer ${
                    imageCount === n
                      ? "bg-[#1a1a1a] text-white"
                      : "bg-white border border-[#e5e0d8] text-[#1a1a1a] hover:border-[#d5cfc5]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="flex items-start gap-1.5">
            <span className="text-[10px] text-[#6b6b6b] uppercase tracking-wider w-10 flex-shrink-0 pt-1">
              Ratio
            </span>
            <div className="flex flex-wrap gap-1">
              {RATIOS.map((r) => {
                const isAuto = r.label === "Auto";
                const selected = ratio === r.label;
                return (
                  <button
                    key={r.label}
                    onClick={() => { setRatio(r.label); onSettingsChange?.({ tab, imageCount, ratio: r.label, resolution: imageResolution, videoResolution, duration }); }}
                    title={r.label}
                    className={`flex items-center justify-center w-8 h-7 rounded-lg transition-all cursor-pointer ${
                      selected
                        ? "bg-[#1a1a1a] text-white"
                        : "bg-white border border-[#e5e0d8] text-[#1a1a1a] hover:border-[#d5cfc5]"
                    }`}
                  >
                    <RatioIcon w={r.w} h={r.h} isAuto={isAuto} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resolution */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#6b6b6b] uppercase tracking-wider w-10 flex-shrink-0">
              Res
            </span>
            <div className="flex gap-1">
              {(["1k", "2k", "4k"] as ImageResolution[]).map((res) => (
                <button
                  key={res}
                  onClick={() => { setImageResolution(res); onSettingsChange?.({ tab, imageCount, ratio, resolution: res, videoResolution, duration }); }}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    imageResolution === res
                      ? "bg-[#1a1a1a] text-white"
                      : "bg-white border border-[#e5e0d8] text-[#1a1a1a] hover:border-[#d5cfc5]"
                  }`}
                >
                  {res.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Video Settings */}
      {tab === "video" && (
        <div className="space-y-3">
          {/* Resolution */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#6b6b6b] uppercase tracking-wider w-10 flex-shrink-0">
              Res
            </span>
            <div className="flex gap-1">
              {(["auto", "480p", "720p"] as VideoResolution[]).map((r) => (
                <button
                  key={r}
                  onClick={() => { setVideoResolution(r); onSettingsChange?.({ tab, imageCount, ratio, resolution: imageResolution, videoResolution: r, duration }); }}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer capitalize ${
                    videoResolution === r
                      ? "bg-[#1a1a1a] text-white"
                      : "bg-white border border-[#e5e0d8] text-[#1a1a1a] hover:border-[#d5cfc5]"
                  }`}
                >
                  {r === "auto" ? "Auto" : r}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#6b6b6b] uppercase tracking-wider w-10 flex-shrink-0">
              Ratio
            </span>
            <div className="flex gap-1">
              {(["auto", "1:1", "4:3", "3:4", "16:9", "9:16"] as string[]).map((r) => (
                <button
                  key={r}
                  onClick={() => { setRatio(r); onSettingsChange?.({ tab, imageCount, ratio: r, resolution: imageResolution, videoResolution, duration }); }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    ratio === r
                      ? "bg-[#1a1a1a] text-white"
                      : "bg-white border border-[#e5e0d8] text-[#1a1a1a] hover:border-[#d5cfc5]"
                  }`}
                >
                  {r === "auto" ? "Auto" : r}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#6b6b6b] uppercase tracking-wider w-10 flex-shrink-0">
              Duration
            </span>
            <div className="flex gap-1">
              {(["auto", "4s", "5s", "6s", "8s", "10s", "15s"] as Duration[]).map((d) => (
                <button
                  key={d}
                  onClick={() => { setDuration(d); onSettingsChange?.({ tab, imageCount, ratio, resolution: imageResolution, videoResolution, duration: d }); }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    duration === d
                      ? "bg-[#1a1a1a] text-white"
                      : "bg-white border border-[#e5e0d8] text-[#1a1a1a] hover:border-[#d5cfc5]"
                  }`}
                >
                  {d === "auto" ? "Auto" : d}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
