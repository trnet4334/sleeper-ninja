// TODO: compute polygon vertices from real team-strength data
export function TeamRadar() {
  return (
    <div className="relative flex items-center justify-center py-10">
      {/* Concentric circles (opacity-10 guides) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="absolute h-72 w-72 rounded-full border border-on-surface opacity-10" />
        <div className="absolute h-48 w-48 rounded-full border border-on-surface opacity-10" />
        <div className="absolute h-24 w-24 rounded-full border border-on-surface opacity-10" />
      </div>

      {/* Axis labels */}
      <div className="pointer-events-none absolute top-2 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        Efficiency
      </div>
      <div className="pointer-events-none absolute bottom-2 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        Health
      </div>
      <div className="pointer-events-none absolute left-0 top-1/2 -translate-x-4 -translate-y-1/2 -rotate-90 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        Upside
      </div>
      <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 rotate-90 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        Schedule
      </div>

      <svg className="h-72 w-72 drop-shadow-2xl" viewBox="0 0 200 200">
        {/* Background mesh */}
        <polygon fill="none" points="100,20 180,80 150,180 50,180 20,80" stroke="#2d3449" strokeWidth="1" />
        {/* Pre-trade polygon (grey) */}
        <polygon
          fill="rgba(51, 65, 85, 0.4)"
          points="100,50 160,90 130,150 70,140 40,80"
          stroke="#334155"
          strokeWidth="2"
        />
        {/* Post-trade polygon (amber) */}
        <polygon
          fill="rgba(217, 119, 7, 0.2)"
          points="100,30 190,75 160,160 60,170 30,70"
          stroke="#D97706"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}
