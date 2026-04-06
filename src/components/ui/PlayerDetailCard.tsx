import { StatChip } from "./StatChip";

export function PlayerDetailCard({
  player,
  onClose,
}: {
  player: {
    playerName: string;
    team: string;
    position: string;
    delta: number;
    trend: number[];
    metrics: Record<string, number | string>;
  } | null;
  onClose?: () => void;
}) {
  if (!player) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-container-low p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">Player Detail</p>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-4 flex h-7 w-7 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
      <h4 className="mt-3 font-headline text-2xl font-bold text-on-surface">{player.playerName}</h4>
      <p className="mt-1 text-sm text-on-surface-variant">
        {player.team} • {player.position}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <StatChip label={`Delta ${player.delta.toFixed(3)}`} tone={player.delta >= 0 ? "positive" : "negative"} />
        <StatChip label={`Trend ${player.trend.join(" / ")}`} />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {Object.entries(player.metrics)
          .slice(0, 6)
          .map(([label, value]) => (
            <div key={label} className="rounded-xl bg-surface-container-high px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">{label}</p>
              <p className="mt-2 text-sm font-semibold text-on-surface">{String(value)}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
