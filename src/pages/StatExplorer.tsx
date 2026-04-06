import { useEffect, useMemo, useState } from "react";
import { useSleeperAnalysis } from "@/hooks/useSleeperAnalysis";
import { BreakoutCard } from "@/components/statexplorer/BreakoutCard";
import { PlayerDetailCard } from "@/components/ui/PlayerDetailCard";
import type { PlayersResponse } from "@/lib/apiClient";

type Player = PlayersResponse["players"][number];
type Role = "hitter" | "sp" | "closer";

const PAGE_SIZE = 10;

const STAT_COLS = ["AVG", "HR", "RBI", "xwOBA", "SB"] as const;

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function trendBadge(delta: number, score: number) {
  if (score >= 90)
    return (
      <span className="rounded-full bg-tertiary-container/20 text-tertiary border border-tertiary/20 px-3 py-1 text-[10px] font-black">
        ELITE
      </span>
    );
  if (score >= 75)
    return (
      <span className="rounded-full bg-tertiary-container/20 text-tertiary border border-tertiary/20 px-3 py-1 text-[10px] font-black">
        MVP
      </span>
    );
  if (score >= 60)
    return (
      <span className="rounded-full bg-primary-container/20 text-primary border border-primary/20 px-3 py-1 text-[10px] font-black">
        SPEED
      </span>
    );
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
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);


  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setModalOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  const { data: hitterData } = useSleeperAnalysis("hitter");
  const { data: pitcherData } = useSleeperAnalysis("pitcher");

  const allPlayers = useMemo(() => {
    const source =
      role === "hitter" ? hitterData?.players ?? [] : pitcherData?.players ?? [];
    const byRole = filterByRole(source, role);
    if (!search.trim()) return byRole;
    const q = search.toLowerCase();
    return byRole
      .filter((p) => p.playerName.toLowerCase().includes(q))
      .sort((a, b) => {
        const aStarts = a.playerName.toLowerCase().startsWith(q) ? 0 : 1;
        const bStarts = b.playerName.toLowerCase().startsWith(q) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return b.recommendationScore - a.recommendationScore;
      });
  }, [role, search, hitterData, pitcherData]);

  const breakoutPlayers = useMemo(
    () => [...allPlayers].sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, 6),
    [allPlayers]
  );

  const activePlayer = useMemo(
    () => allPlayers.find((p) => p.id === selectedPlayerId) ?? null,
    [allPlayers, selectedPlayerId]
  );

  const totalPages = Math.max(1, Math.ceil(allPlayers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagePlayers = allPlayers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const showStart = allPlayers.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showEnd = Math.min(safePage * PAGE_SIZE, allPlayers.length);

  function handleRoleChange(r: Role) {
    setRole(r);
    setPage(1);
    setCarouselIdx(0);
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  const TABS: { label: string; value: Role }[] = [
    { label: "Hitter", value: "hitter" },
    { label: "SP", value: "sp" },
    { label: "RP", value: "closer" }
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
      {(() => {
        const PAGE_SIZE = 4;
        const totalPages = Math.max(1, Math.ceil(breakoutPlayers.length / PAGE_SIZE));
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-primary">
                Hot Trend
              </span>
              <h3 className="font-headline text-xl font-extrabold text-on-surface">Breakout Alerts</h3>
            </div>

            {breakoutPlayers.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No players available.</p>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <button
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-xl text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-30"
                    onClick={() => setCarouselIdx((i) => Math.max(0, i - 1))}
                    disabled={carouselIdx === 0}
                    aria-label="Previous"
                  >
                    ‹
                  </button>
                  <div className="flex-1 overflow-hidden">
                    <div
                      className="flex transition-transform duration-300 ease-in-out"
                      style={{ transform: `translateX(-${carouselIdx * 100}%)` }}
                    >
                      {Array.from({ length: totalPages }).map((_, pageIdx) => (
                        <div key={pageIdx} className="w-full flex-none grid grid-cols-2 gap-3">
                          {breakoutPlayers.slice(pageIdx * PAGE_SIZE, pageIdx * PAGE_SIZE + PAGE_SIZE).map((player) => (
                            <BreakoutCard key={player.id} player={player} />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-xl text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-30"
                    onClick={() => setCarouselIdx((i) => Math.min(totalPages - 1, i + 1))}
                    disabled={carouselIdx >= totalPages - 1}
                    aria-label="Next"
                  >
                    ›
                  </button>
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center gap-1.5">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCarouselIdx(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === carouselIdx ? "w-4 bg-primary" : "w-1.5 bg-on-surface-variant/30"
                        }`}
                        aria-label={`Go to page ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })()}

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

        <div className="inline-flex flex-col">
        <div className="overflow-hidden rounded-xl bg-surface-container-low shadow-2xl">
          <div className="overflow-x-auto">
            <table className="border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant/10 bg-surface-container-high">
                  <th className="w-44 py-3 pl-4 pr-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    Player
                  </th>
                  <th className="w-12 py-3 px-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    Team
                  </th>
                  {STAT_COLS.map((col) => (
                    <th
                      key={col}
                      className="w-16 py-3 px-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant"
                    >
                      {col}
                    </th>
                  ))}
                  <th className="py-3 px-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
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
                      tabIndex={0}
                      className="cursor-pointer transition-colors hover:bg-surface-container-highest/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                      onClick={() => { setSelectedPlayerId(player.id); setModalOpen(true); }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedPlayerId(player.id);
                          setModalOpen(true);
                        }
                      }}
                    >
                      <td className="w-44 py-2.5 pl-4 pr-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-surface-container-high flex-shrink-0 border border-outline-variant/20 flex items-center justify-center">
                            <span className="font-headline text-[9px] font-bold text-primary">
                              {getInitials(player.playerName)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-xs font-bold text-on-surface">
                              {player.playerName}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
                              {player.position}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="w-12 py-2.5 px-2 text-xs font-semibold text-on-surface-variant">
                        {player.team}
                      </td>
                      {STAT_COLS.map((col) => (
                        <td key={col} className="w-16 py-2.5 px-2 tabular-nums text-xs font-bold text-on-surface">
                          {player.metrics[col] != null ? String(player.metrics[col]) : "–"}
                        </td>
                      ))}
                      <td className="py-2.5 px-2">{trendBadge(player.delta, player.recommendationScore)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-2">
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
      </div>

      {modalOpen && activePlayer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${activePlayer.playerName} detail`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md">
            <PlayerDetailCard player={activePlayer} onClose={() => setModalOpen(false)} />
          </div>
        </div>
      )}
    </section>
  );
}
