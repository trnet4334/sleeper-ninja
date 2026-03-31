import { useState } from "react";
import { useLeagues } from "@/hooks/useLeagues";

export function LeagueManager() {
  const { leagues, addLeague, removeLeague } = useLeagues();
  const [name, setName] = useState("");
  const [yahooLeagueId, setYahooLeagueId] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/50">Leagues</p>
        <div className="mt-3 space-y-2">
          {leagues.map((league) => (
            <div key={league.id} className="flex items-center justify-between rounded-xl bg-surface-container-low px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-on-surface">{league.name}</p>
                <p className="text-[11px] text-on-surface-variant">{league.yahooLeagueId}</p>
              </div>
              {leagues.length > 1 ? (
                <button type="button" onClick={() => removeLeague(league.id)} className="text-xs text-primary">
                  Remove
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="league-name" className="sr-only">New league name</label>
        <input
          id="league-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New league name"
          className="w-full rounded-xl border border-white/10 bg-surface-container-low px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant"
        />
        <label htmlFor="league-yahoo-id" className="sr-only">Yahoo league ID</label>
        <input
          id="league-yahoo-id"
          value={yahooLeagueId}
          onChange={(event) => setYahooLeagueId(event.target.value)}
          placeholder="Yahoo league ID"
          className="w-full rounded-xl border border-white/10 bg-surface-container-low px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant"
        />
        <button
          type="button"
          onClick={() => {
            if (!name.trim() || !yahooLeagueId.trim()) {
              return;
            }
            addLeague({
              id: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_"),
              name: name.trim(),
              yahooLeagueId: yahooLeagueId.trim(),
              season: 2025
            });
            setName("");
            setYahooLeagueId("");
          }}
          className="w-full rounded-xl bg-primary-container px-3 py-2 text-sm font-semibold text-on-primary-container"
        >
          Add league
        </button>
      </div>
    </div>
  );
}
