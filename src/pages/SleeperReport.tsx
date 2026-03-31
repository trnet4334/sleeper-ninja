import { useMemo, useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useSleeperAnalysis } from "@/hooks/useSleeperAnalysis";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlayerDetailCard } from "@/components/ui/PlayerDetailCard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { StatChip } from "@/components/ui/StatChip";

export function SleeperReportPage() {
  const [playerType, setPlayerType] = useState<"hitter" | "pitcher">("hitter");
  const { hitterCats, pitcherCats } = useCategories();
  const { data, loading } = useSleeperAnalysis(playerType);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const categories = playerType === "hitter" ? hitterCats : pitcherCats;
  const activePlayer =
    data?.players.find((player) => player.id === selectedPlayerId) ??
    data?.players[0] ??
    null;
  const visibleMetricColumns = useMemo(
    () => data?.selectedStats.filter((stat) => !["EV", "Sprint Speed"].includes(stat)).slice(0, 3) ?? [],
    [data?.selectedStats]
  );

  return (
    <section className="space-y-6">
      <PageHeader
        title="Market Inefficiencies"
        subtitle="Exploiting sabermetric gaps in current league rosters."
        tags={["Live Feed", "V3.4 Engine"]}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-headline text-xl font-bold uppercase tracking-[0.18em] text-on-surface">
            {playerType === "hitter" ? "Hitter Analytics" : "Pitcher Analytics"}
          </h3>
          <SegmentedControl value={playerType} options={["hitter", "pitcher"]} onChange={setPlayerType} />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <StatChip key={category} label={category} tone="primary" />
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Available FAs" value={String(data?.summary.availableFas ?? 0)} note="Board Depth" />
        <MetricCard
          label="Top Delta"
          value={`${data?.summary.topDelta.toFixed(3) ?? "0.000"}`}
          note={data?.summary.topPlayer ?? "No signal"}
          tone="tertiary"
        />
        <MetricCard
          label={playerType === "hitter" ? "Hot Hitters" : "Hot Arms"}
          value={String(data?.summary.hotPlayers ?? 0)}
          note="Active Hot Streaks"
          tone="neutral"
        />
        <MetricCard label="IL Returns" value={String(data?.summary.ilReturns ?? 0)} note="72h Window" tone="error" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
        <div className="rounded-shell border border-white/5 bg-surface-container-lowest">
          <div className="flex flex-col gap-4 border-b border-white/5 bg-surface-container-low/60 px-6 py-4 md:flex-row md:items-center md:justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">
              Sleeper Candidates: {playerType === "hitter" ? "Hitters" : "Pitchers"}
            </span>
            <span className="w-fit rounded-md bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">Alpha Algorithm</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                  <th scope="col" className="px-6 py-4">Player</th>
                  <th scope="col" className="px-6 py-4">Team</th>
                  {visibleMetricColumns.map((metric) => (
                    <th key={metric} scope="col" className="px-6 py-4">
                      {metric}
                    </th>
                  ))}
                  <th scope="col" className="px-6 py-4">Delta</th>
                  <th scope="col" className="px-6 py-4 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(data?.players ?? []).map((player) => (
                  <tr
                    key={player.id}
                    tabIndex={0}
                    className="cursor-pointer hover:bg-surface-container-high/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    onClick={() => setSelectedPlayerId(player.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedPlayerId(player.id);
                      }
                    }}
                  >
                    <td className="px-6 py-4 font-semibold text-on-surface">{player.playerName}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{player.team}</td>
                    {visibleMetricColumns.map((metric) => (
                      <td key={metric} className="px-6 py-4 text-on-surface">
                        {String(player.metrics[metric] ?? "—")}
                      </td>
                    ))}
                    <td className="px-6 py-4 font-headline font-bold text-primary">{player.delta.toFixed(3)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="rounded-md bg-tertiary-container/20 px-2 py-1 text-xs font-bold text-tertiary">
                        {player.recommendationScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <PlayerDetailCard player={activePlayer} />
      </div>

      <div aria-live="polite" aria-atomic="true">
        {loading ? <p className="text-sm text-on-surface-variant">Loading editorial board...</p> : null}
      </div>
    </section>
  );
}
