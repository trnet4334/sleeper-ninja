import { useMemo, useState } from "react";
import { useSleeperAnalysis } from "@/hooks/useSleeperAnalysis";
import { BreakoutCard } from "@/components/statexplorer/BreakoutCard";
import type { PlayersResponse } from "@/lib/apiClient";

type Player = PlayersResponse["players"][number];
type Role = "hitter" | "sp" | "closer";

const PAGE_SIZE = 10;

const STAT_COLS = ["AVG", "HR", "RBI", "xwOBA", "SB"] as const;

function trendBadge(delta: number) {
  if (delta > 0.5)
    return (
      <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black text-primary">
        HOT
      </span>
    );
  if (delta < -0.5)
    return (
      <span className="rounded-full bg-rose-500/15 px-3 py-1 text-[10px] font-black text-rose-300">
        COLD
      </span>
    );
  return (
    <span className="rounded-full bg-secondary-container/20 px-3 py-1 text-[10px] font-black text-secondary">
      STEADY
    </span>
  );
}

function filterByRole(players: Player[], role: Role): Player[] {
  if (role === "hitter") return players.filter((p) => p.playerType === "hitter");
  if (role === "sp") return players.filter((p) => p.playerType === "pitcher" && p.position === "SP");
  return players.filter(
    (p) => p.playerType === "pitcher" && (p.position === "CL" || p.position === "RP")
  );
}

export function StatExplorerPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<Role>("hitter");
  const [page, setPage] = useState(1);

  const { data: hitterData } = useSleeperAnalysis("hitter");
  const { data: pitcherData } = useSleeperAnalysis("pitcher");

  const allPlayers = useMemo(() => {
    const source =
      role === "hitter" ? hitterData?.players ?? [] : pitcherData?.players ?? [];
    const byRole = filterByRole(source, role);
    if (!search.trim()) return byRole;
    const q = search.toLowerCase();
    return byRole.filter((p) => p.playerName.toLowerCase().includes(q));
  }, [role, search, hitterData, pitcherData]);

  const breakoutPlayers = useMemo(
    () => [...allPlayers].sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, 6),
    [allPlayers]
  );

  const totalPages = Math.max(1, Math.ceil(allPlayers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagePlayers = allPlayers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const showStart = allPlayers.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showEnd = Math.min(safePage * PAGE_SIZE, allPlayers.length);

  function handleRoleChange(r: Role) {
    setRole(r);
    setPage(1);
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  const TABS: { label: string; value: Role }[] = [
    { label: "Hitter", value: "hitter" },
    { label: "SP", value: "sp" },
    { label: "Closer", value: "closer" }
  ];

  return (
    <section className="space-y-10">
      {/* Search & Filters */}
      <div className="space-y-4">
        {/* Search bar */}
        <div className="relative w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
            🔍
          </span>
          <input
            className="w-full rounded-xl border-none bg-surface-container-lowest py-4 pl-12 pr-4 text-on-surface ring-1 ring-outline-variant/10 placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Search for any MLB player or team…"
            type="text"
            value={search}
            onChange={handleSearch}
          />
        </div>

        {/* Role tabs */}
        <div className="flex items-center gap-0 border-b border-outline-variant/10">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              className={`px-8 py-3 font-headline text-sm font-semibold tracking-wide transition-all ${
                role === tab.value
                  ? "border-b-2 border-primary text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              onClick={() => handleRoleChange(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Breakout Alerts */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-primary">
            Hot Trend
          </span>
          <h3 className="font-headline text-xl font-extrabold text-on-surface">Breakout Alerts</h3>
        </div>
        <div className="-mx-2 flex snap-x gap-4 overflow-x-auto px-2 pb-4">
          {breakoutPlayers.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No players available.</p>
          ) : (
            breakoutPlayers.map((player) => (
              <BreakoutCard key={player.id} player={player} />
            ))
          )}
        </div>
      </div>

      {/* Detailed Analytics table */}
      <div className="space-y-4">
        <div className="flex items-end justify-between px-1">
          <div>
            <h3 className="font-headline text-2xl font-extrabold text-on-surface">
              Detailed Analytics
            </h3>
            <p className="text-sm text-on-surface-variant">Advanced Sabermetrics • Last 14 Days</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-surface-container-low shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant/10 bg-surface-container-high">
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    Player
                  </th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    Team
                  </th>
                  {STAT_COLS.map((col) => (
                    <th
                      key={col}
                      className="p-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant"
                    >
                      {col}
                    </th>
                  ))}
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {pagePlayers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-sm text-on-surface-variant"
                    >
                      No players match the current filter.
                    </td>
                  </tr>
                ) : (
                  pagePlayers.map((player) => (
                    <tr
                      key={player.id}
                      className="transition-colors hover:bg-surface-container-highest/50"
                    >
                      <td className="p-5">
                        <div className="font-headline font-bold text-on-surface">
                          {player.playerName}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
                          {player.position}
                        </div>
                      </td>
                      <td className="p-5 text-sm font-semibold text-on-surface-variant">
                        {player.team}
                      </td>
                      {STAT_COLS.map((col) => (
                        <td key={col} className="p-5 tabular-nums text-sm font-bold text-on-surface">
                          {player.metrics[col] != null ? String(player.metrics[col]) : "–"}
                        </td>
                      ))}
                      <td className="p-5">{trendBadge(player.delta)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-1 pt-2">
          <p className="text-xs font-medium text-on-surface-variant">
            {allPlayers.length === 0
              ? "No results"
              : `Showing ${showStart}–${showEnd} of ${allPlayers.length} results`}
          </p>
          <div className="flex gap-2">
            <button
              className={`rounded px-4 py-2 text-xs font-bold transition-colors ${
                safePage <= 1
                  ? "cursor-not-allowed bg-surface-container-high text-on-surface-variant/40"
                  : "bg-surface-container-high text-on-surface-variant hover:text-primary"
              }`}
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              PREV
            </button>
            <button
              className={`rounded px-4 py-2 text-xs font-bold transition-all shadow-lg ${
                safePage >= totalPages
                  ? "cursor-not-allowed bg-surface-container-high text-on-surface-variant/40 shadow-none"
                  : "bg-primary-container text-on-primary-container shadow-primary/10"
              }`}
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
