'use client';

export default function PollSkeleton() {
  return (
    <div className="glass-card p-6 sm:p-8 animate-pulse">
      {/* Badge */}
      <div className="h-6 w-28 bg-slate-700/50 rounded-full mb-3" />
      {/* Question */}
      <div className="h-8 w-3/4 bg-slate-700/50 rounded-lg mb-2" />
      <div className="h-8 w-1/2 bg-slate-700/40 rounded-lg mb-6" />

      <div className="h-px bg-slate-800/60 mb-6" />

      {/* Options */}
      {[0, 1].map((i) => (
        <div key={i} className="mb-3 rounded-xl border border-slate-700/40 p-5">
          <div className="flex justify-between mb-3">
            <div className="h-5 w-20 bg-slate-700/50 rounded" />
            <div className="h-5 w-12 bg-slate-700/40 rounded" />
          </div>
          <div className="h-2 bg-slate-700/50 rounded-full" />
        </div>
      ))}

      {/* Chart bars */}
      <div className="mt-6 space-y-3">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-16 h-4 bg-slate-700/40 rounded" />
            <div className="flex-1 h-7 bg-slate-700/30 rounded-lg" />
            <div className="w-16 h-4 bg-slate-700/40 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
