import { useState } from "react";
import { useLeagues } from "@/hooks/useLeagues";
import { cx } from "@/lib/utils";
import type { LeagueDefinition } from "@/types/league";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function LeagueTabBar() {
  const { leagues, activeLeagueId, setActiveLeague, addLeague } = useLeagues();
  const [newLeagueName, setNewLeagueName] = useState("");
  const [newLeagueId, setNewLeagueId] = useState("");

  const handleAddLeague = () => {
    if (!newLeagueName.trim() || !newLeagueId.trim()) {
      return;
    }

    const league: LeagueDefinition = {
      id: slugify(newLeagueName),
      name: newLeagueName.trim(),
      yahooLeagueId: newLeagueId.trim(),
      season: 2025
    };

    addLeague(league);
    setNewLeagueName("");
    setNewLeagueId("");
  };

  return (
    <div className="flex flex-1 items-center gap-4">
      <div className="flex min-w-0 flex-1 flex-wrap gap-3">
        {leagues.map((league) => {
          const active = league.id === activeLeagueId;
          return (
            <div key={league.id} className="flex items-center">
              <button
                type="button"
                aria-selected={active}
                onClick={() => setActiveLeague(league.id)}
                className={cx(
                  "border-b-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors",
                  active ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-200"
                )}
              >
                {league.name}
              </button>
            </div>
          );
        })}
      </div>

      <div className="hidden items-center gap-2 xl:flex">
        <label htmlFor="tabbar-league-name" className="sr-only">League name</label>
        <input
          id="tabbar-league-name"
          value={newLeagueName}
          onChange={(event) => setNewLeagueName(event.target.value)}
          placeholder="League name"
          className="w-32 rounded-md border border-white/10 bg-surface-container-low px-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant"
        />
        <label htmlFor="tabbar-yahoo-id" className="sr-only">Yahoo ID</label>
        <input
          id="tabbar-yahoo-id"
          value={newLeagueId}
          onChange={(event) => setNewLeagueId(event.target.value)}
          placeholder="Yahoo ID"
          className="w-24 rounded-md border border-white/10 bg-surface-container-low px-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant"
        />
      </div>

      <button
        type="button"
        onClick={handleAddLeague}
        className="h-9 w-9 rounded-md bg-primary-container text-lg font-bold text-on-primary-container transition-transform active:scale-95"
        aria-label="Add league"
      >
        +
      </button>
    </div>
  );
}
