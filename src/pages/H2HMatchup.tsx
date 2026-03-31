import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useMatchupAnalysis } from "@/hooks/useMatchupAnalysis";
import { useRosterData } from "@/hooks/useRosterData";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { WinProbabilityRing } from "@/components/matchup/WinProbabilityRing";
import { CategoryRow } from "@/components/matchup/CategoryRow";

export function H2HMatchupPage() {
  const [playerType, setPlayerType] = useState<"hitter" | "pitcher">("hitter");
  const [mode, setMode] = useState<"average" | "conservative" | "optimistic">("average");
  const data = useMatchupAnalysis(playerType, mode);
  const { hitterCats, pitcherCats } = useCategories();
  const { players: myHitters } = useRosterData("hitter");
  const { players: myPitchers } = useRosterData("pitcher");

  const categories = playerType === "hitter" ? hitterCats : pitcherCats;
  const opponentName = data?.opponent ?? "Matchup Analysis";
  const myRoster = [...myHitters, ...myPitchers];

  // TODO: wire to real data when API exposes winProbability and insight
  const winProbability = (data as Record<string, unknown> | null)?.winProbability as number | undefined;
  const insight = (data as Record<string, unknown> | null)?.insight as string | undefined;

  return (
    <section className="space-y-8">
      {/* Heading */}
      <h1 className="font-headline text-2xl font-extrabold text-on-surface">
        H2H Performance vs. {opponentName}
      </h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <SegmentedControl value={playerType} options={["hitter", "pitcher"]} onChange={setPlayerType} />
        <SegmentedControl
          value={mode}
          options={["average", "conservative", "optimistic"]}
          onChange={setMode}
        />
      </div>

      {/* Win probability ring + Ninja Insight card */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <WinProbabilityRing probability={winProbability ?? 50} />
        <div className="flex-1 rounded-2xl border border-white/5 bg-surface-container-low p-5">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Ninja Insight</p>
          <p className="text-sm leading-relaxed text-on-surface">
            {insight ?? "Analyzing matchup…"}
          </p>
        </div>
      </div>

      {/* Category comparison grid */}
      <div className="rounded-2xl border border-white/5 bg-surface-container-low px-5 py-2">
        <div className="mb-3 flex items-center gap-4 border-b border-white/5 pb-3">
          <span className="w-16 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">Cat</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">Result</span>
          <span className="ml-auto flex gap-6 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
            <span>Mine</span>
            <span>Opp</span>
          </span>
        </div>
        {(data?.forecast ?? []).map((item) => (
          <CategoryRow
            key={item.category}
            category={item.category}
            myValue={item.myValue}
            opponentValue={item.opponentValue}
            result={item.result}
          />
        ))}
        {(data?.forecast ?? []).length === 0 &&
          categories.map((cat) => (
            <CategoryRow key={cat} category={cat} myValue="–" opponentValue="–" result="TOSS" />
          ))}
      </div>

      {/* Side-by-side roster columns */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* My Roster */}
        <div className="flex-1 rounded-2xl border border-white/5 bg-surface-container-low p-5">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">My Roster</p>
          <ul className="space-y-3">
            {myRoster.length === 0 && (
              <li className="text-sm text-on-surface-variant">No roster data.</li>
            )}
            {myRoster.map((player) => (
              <li key={player.id} className="flex items-center gap-3">
                <span className="rounded bg-surface-container-high px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
                  {player.position}
                </span>
                <span className="text-sm font-semibold text-on-surface">{player.playerName}</span>
                <span className="ml-auto text-xs text-on-surface-variant">{player.team}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Opponent */}
        <div className="flex-1 rounded-2xl border border-white/5 bg-surface-container-low p-5">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
            {opponentName}
          </p>
          {/* TODO: wire to opponent roster data when API exposes it */}
          <p className="text-sm text-on-surface-variant">Opponent roster unavailable.</p>
        </div>
      </div>
    </section>
  );
}
