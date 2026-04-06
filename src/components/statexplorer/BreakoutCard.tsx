import type { PlayersResponse } from "@/lib/apiClient";

type Player = PlayersResponse["players"][number];

function fmt(value: string): string {
  const n = parseFloat(value);
  if (isNaN(n)) return value;
  return parseFloat(n.toFixed(3)).toString();
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function getKeyMetrics(player: Player): Array<[string, string]> {
  const m = player.metrics;
  if (player.playerType === "pitcher") {
    const era = m["ERA"] != null ? String(m["ERA"]) : null;
    const k = m["K%"] != null ? String(m["K%"]) : null;
    const xera = m["xERA"] != null ? String(m["xERA"]) : null;
    const whip = m["WHIP"] != null ? String(m["WHIP"]) : null;
    const first = era ? ["ERA", era] : xera ? ["xERA", xera] : null;
    const second = k ? ["K%", k] : whip ? ["WHIP", whip] : null;
    if (first && second) return [first as [string, string], second as [string, string]];
  } else {
    const xwoba = m["xwOBA"] != null ? String(m["xwOBA"]) : null;
    const barrel = m["Barrel%"] != null ? String(m["Barrel%"]) : null;
    const avg = m["AVG"] != null ? String(m["AVG"]) : null;
    const hr = m["HR"] != null ? String(m["HR"]) : null;
    const first = xwoba ? ["xwOBA", xwoba] : avg ? ["AVG", avg] : null;
    const second = barrel ? ["Barrel%", barrel] : hr ? ["HR", hr] : null;
    if (first && second) return [first as [string, string], second as [string, string]];
  }
  // Fallback: first two available metrics
  const entries = Object.entries(m).slice(0, 2);
  return entries.map(([k, v]) => [k, String(v)]) as Array<[string, string]>;
}

const HITTER_INSIGHT = "Strong contact metrics with upside in counting stats.";
const PITCHER_INSIGHT = "Elite swing-and-miss stuff with strong xFIP indicators.";

export function BreakoutCard({ player }: { player: Player }) {
  const initials = getInitials(player.playerName);
  const keyMetrics = getKeyMetrics(player);
  const insight = player.playerType === "pitcher" ? PITCHER_INSIGHT : HITTER_INSIGHT;

  return (
    <div className="w-full bg-surface-container-high border border-outline-variant/10 rounded-xl p-4 hover:border-primary/30 transition-colors group cursor-pointer">
      <div className="flex gap-4">
        {/* Avatar + mini-grid */}
        <div className="shrink-0 space-y-3">
          <div className="w-16 h-16 rounded-full border-2 border-primary/20 bg-primary-container/30 flex items-center justify-center">
            <span className="font-headline font-bold text-sm text-primary">{initials}</span>
          </div>
          {keyMetrics.length >= 2 && (
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center">
                <div className="text-[8px] text-on-surface-variant font-black uppercase">
                  {keyMetrics[0][0]}
                </div>
                <div className="text-xs font-black text-primary">{fmt(keyMetrics[0][1])}</div>
              </div>
              <div className="text-center border-l border-outline-variant/20">
                <div className="text-[8px] text-on-surface-variant font-black uppercase">
                  {keyMetrics[1][0]}
                </div>
                <div className="text-xs font-black text-primary">{fmt(keyMetrics[1][1])}</div>
              </div>
            </div>
          )}
        </div>
        {/* Name / position / description */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <h4 className="font-headline font-black text-on-surface break-words">
            {player.playerName}
          </h4>
          <p className="text-[10px] text-on-surface-variant font-bold uppercase mb-2">
            {player.position} • {player.team}
          </p>
          <p className="text-xs text-on-surface-variant/80 font-medium leading-tight">
            {insight}
          </p>
        </div>
      </div>
    </div>
  );
}
