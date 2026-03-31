const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function WinProbabilityRing({ probability = 50 }: { probability?: number }) {
  const pct = Math.max(0, Math.min(100, probability));
  const offset = CIRCUMFERENCE * (1 - pct / 100);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        {/* Track */}
        <circle
          cx="70"
          cy="70"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-surface-container-high"
        />
        {/* Arc */}
        <circle
          cx="70"
          cy="70"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="text-primary transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      {/* Centered label */}
      <div className="absolute flex flex-col items-center">
        <span className="font-headline text-4xl font-extrabold text-on-surface">{pct}%</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">Win</span>
      </div>
    </div>
  );
}
