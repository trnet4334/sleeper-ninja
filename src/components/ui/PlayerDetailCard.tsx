import { StatChip } from "./StatChip";

export function PlayerDetailCard({
  player
}: {
  player: {
    playerName: string;
    team: string;
    position: string;
    delta: number;
    trend: number[];
    metrics: Record<string, number | string>;
  } | null;
}) {
  if (!player) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-container-low p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">Player Detail</p>
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
