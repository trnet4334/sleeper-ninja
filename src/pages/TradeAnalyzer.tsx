import { useMemo } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useSleeperAnalysis } from "@/hooks/useSleeperAnalysis";
import { useRosterData } from "@/hooks/useRosterData";
import { PlayerTradeCard } from "@/components/trade/PlayerTradeCard";
import { CategoryBar } from "@/components/trade/CategoryBar";
import { TeamRadar } from "@/components/trade/TeamRadar";

// TODO: replace with real trade-builder state
const CATEGORY_DESCRIPTIONS = [
  "Incoming assets significantly increase the weekly ceiling projection.",
  "Minor increase in opponent difficulty for pitching corps in playoffs.",
  "Replacing a CI bat with an elite OF improves multi-cat distribution.",
  "Target shares for incoming player match historical contact volume."
];

const CATEGORY_DELTAS: Array<{ label: string; positive: boolean | null }> = [
  { label: "+18%", positive: true },
  { label: "-4%", positive: false },
  { label: "+12%", positive: true },
  { label: "Stable", positive: null }
];

export function TradeAnalyzerPage() {
  const { hitterCats } = useCategories();
  const { players: rosterPlayers } = useRosterData("hitter");
  const { data } = useSleeperAnalysis("hitter");

  // TODO: replace with real trade-builder state
  const givingPlayers = useMemo(
    () =>
      rosterPlayers.slice(0, 2).map((p) => ({
        playerName: p.playerName,
        position: p.position,
        team: p.team,
        projValue: p.recommendationScore
      })),
    [rosterPlayers]
  );

  const receivingPlayers = useMemo(() => {
    const waivers = (data?.players ?? [])
      .filter((p) => p.rosterState === "waiver")
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 2);
    return waivers.map((p) => ({
      playerName: p.playerName,
      position: p.position,
      team: p.team,
      projValue: p.recommendationScore
    }));
  }, [data]);

  const totalOut = givingPlayers.reduce((sum, p) => sum + p.projValue, 0);
  const totalIn = receivingPlayers.reduce((sum, p) => sum + p.projValue, 0);
  const netDelta = totalIn - totalOut;
  const netLabel = `${netDelta >= 0 ? "+" : ""}${netDelta.toFixed(1)}`;

  const displayCats = hitterCats.slice(0, 4);

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">
          Trade Analyzer
        </h1>
        <p className="mt-1 font-medium text-on-surface-variant">
          Quantifying impact for your{" "}
          <span className="font-bold text-primary">fantasy roster</span>
        </p>
      </div>

      {/* 3-column bento */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Giving Up */}
        <div className="flex flex-col gap-4 rounded-xl bg-surface-container-low p-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-error">
              Giving Up
            </span>
            <span className="text-xl text-error">↓</span>
          </div>
          <div className="space-y-3">
            {givingPlayers.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No roster players available.</p>
            ) : (
              givingPlayers.map((p) => (
                <PlayerTradeCard key={p.playerName} player={p} tone="giving" />
              ))
            )}
          </div>
          <div className="mt-auto border-t border-outline-variant/10 pt-4">
            <p className="text-xs text-on-surface-variant">Total Value Out</p>
            <p className="font-headline text-2xl font-extrabold text-on-surface">
              {totalOut.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Receiving */}
        <div className="flex flex-col gap-4 rounded-xl bg-surface-container-low p-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Receiving
            </span>
            <span className="text-xl text-primary">↑</span>
          </div>
          <div className="space-y-3">
            {receivingPlayers.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No waiver candidates available.</p>
            ) : (
              receivingPlayers.map((p) => (
                <PlayerTradeCard key={p.playerName} player={p} tone="receiving" />
              ))
            )}
          </div>
          <div className="mt-auto border-t border-outline-variant/10 pt-4">
            <p className="text-xs text-on-surface-variant">Total Value In</p>
            <p className="font-headline text-2xl font-extrabold text-on-surface">
              {totalIn.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Projected Delta */}
        <div className="flex flex-col justify-between rounded-xl bg-primary-container p-8 text-on-primary-container shadow-xl shadow-primary/10">
          <div>
            <h3 className="mb-1 font-headline text-lg font-bold">Projected Delta</h3>
            <p className="mb-6 text-sm leading-relaxed opacity-80">
              Net value gain across the remaining weeks of the regular season.
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-5xl font-black tracking-tighter">
                {netLabel}
              </span>
              <span className="text-sm font-bold opacity-70">NET VALUE</span>
            </div>
          </div>
          <p className="mt-8 text-center text-[10px] font-medium opacity-60">
            Calculation based on Ninja Algorithmic Consensus
          </p>
        </div>
      </div>

      {/* Team Strength Impact + Category Comparison */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Team Strength Impact */}
        <div className="rounded-xl bg-surface-container-low p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="font-headline text-xl font-bold text-on-surface">
                Team Strength Impact
              </h3>
              <p className="mt-1 text-xs uppercase tracking-widest text-on-surface-variant">
                Pre-Trade vs Post-Trade Metrics
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-slate-700" />
                <span className="text-[10px] font-bold text-on-surface-variant">PRE-TRADE</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-primary">POST-TRADE</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <TeamRadar />
          </div>
        </div>

        {/* Category Comparison */}
        <div className="rounded-xl bg-surface-container-low p-8">
          <h3 className="mb-8 font-headline text-xl font-bold text-on-surface">
            Category Comparison
          </h3>
          {/* TODO: wire to real category impact data */}
          <div className="space-y-8">
            {displayCats.map((cat, i) => (
              <CategoryBar
                key={cat}
                category={cat}
                deltaLabel={CATEGORY_DELTAS[i]?.label ?? "Stable"}
                deltaPositive={CATEGORY_DELTAS[i]?.positive ?? null}
                description={CATEGORY_DESCRIPTIONS[i] ?? ""}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
