import type { PlayersResponse } from "@/lib/apiClient";

type Player = PlayersResponse["players"][number];

function renderMetric(player: Player, col: string): string {
  if (col === "W-S") {
    const w = player.metrics["W"] ?? "–";
    const sv = player.metrics["SV"] ?? "–";
    return `${String(w)}-${String(sv)}`;
  }
  const val = player.metrics[col];
  return val != null ? String(val) : "–";
}

export function PlayerRow({
  player,
  columns,
  il = false
}: {
  player: Player;
  columns: string[];
  il?: boolean;
}) {
  return (
    <tr className={il ? "opacity-50" : ""}>
      <td className="py-2 pr-4">
        <span className="rounded bg-surface-container-high px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
          {player.position}
        </span>
      </td>
      <td className="py-2 pr-6">
        <span className="text-sm font-semibold text-on-surface">{player.playerName}</span>
        <span className="ml-2 text-xs text-on-surface-variant">{player.team}</span>
      </td>
      {columns.map((col) => (
        <td key={col} className="py-2 pr-4 text-sm tabular-nums text-on-surface">
          {renderMetric(player, col)}
        </td>
      ))}
      <td className="py-2">
        {il ? (
          <span className="rounded-full bg-rose-500/15 px-3 py-1 text-[10px] uppercase tracking-wide text-rose-300">
            IL
          </span>
        ) : (
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] uppercase tracking-wide text-emerald-300">
            Active
          </span>
        )}
      </td>
    </tr>
  );
}
