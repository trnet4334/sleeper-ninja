export interface TradePlayer {
  playerName: string;
  position: string;
  team: string;
  projValue: number;
}

export function PlayerTradeCard({
  player
}: {
  player: TradePlayer;
  tone: "giving" | "receiving";
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-surface-container-high p-4 transition-colors hover:bg-surface-container-highest">
      <div className="min-w-0 flex-1">
        <p className="truncate font-headline font-bold text-on-surface">{player.playerName}</p>
        <p className="mt-0.5 text-xs text-on-surface-variant">
          {player.position} • {player.team} •{" "}
          <span className="font-bold text-primary">{player.projValue.toFixed(1)} Proj</span>
        </p>
      </div>
    </div>
  );
}
