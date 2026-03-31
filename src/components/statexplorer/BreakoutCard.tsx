import type { PlayersResponse } from "@/lib/apiClient";

type Player = PlayersResponse["players"][number];

// TODO: wire to real insight text
const INSIGHT_FALLBACK = "Advanced metrics indicate strong upside potential.";

export function BreakoutCard({ player }: { player: Player }) {
  const metricEntries = Object.entries(player.metrics).slice(0, 2);

  return (
    <div className="w-72 flex-none cursor-pointer snap-start rounded-xl border border-outline-variant/10 bg-surface-container-high p-4 transition-colors hover:border-primary/30">
      <div className="flex gap-4">
        {/* Stat cells */}
        <div className="shrink-0 space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/20 bg-surface-container-low font-headline text-lg font-black text-primary">
            {player.position}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {metricEntries.map(([key, val]) => (
              <div key={key} className="text-center">
                <div className="text-[8px] font-black uppercase text-on-surface-variant">{key}</div>
                <div className="text-xs font-black text-primary">{String(val)}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h4 className="truncate font-headline font-black text-on-surface">
            {player.playerName}
          </h4>
          <p className="mb-2 text-[10px] font-bold uppercase text-on-surface-variant">
            {player.position} • {player.team}
          </p>
          <p className="line-clamp-3 text-xs font-medium leading-tight text-on-surface-variant/80">
            {INSIGHT_FALLBACK}
          </p>
        </div>
      </div>
    </div>
  );
}
