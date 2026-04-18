'use client';

interface LiveIndicatorProps {
  /** Interval in seconds between refreshes */
  intervalSeconds?: number;
  lastRefreshed?: Date | null;
}

export default function LiveIndicator({
  intervalSeconds = 5,
  lastRefreshed,
}: LiveIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Animated dot */}
      <div className="relative w-2.5 h-2.5">
        <div className="absolute inset-0 rounded-full bg-emerald-400 live-ring opacity-60" />
        <div className="relative w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
      </div>

      {/* Label */}
      <span className="text-xs font-mono text-emerald-400 font-medium tracking-wide">
        LIVE
      </span>

      {/* Refresh info */}
      <span className="text-xs font-mono text-slate-600">
        · updates every {intervalSeconds}s
      </span>
    </div>
  );
}
