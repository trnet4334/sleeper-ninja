import { useState } from "react";
import { useLeagues } from "@/hooks/useLeagues";
import { useYahooLeagues } from "@/hooks/useYahooLeagues";

export function LeagueManager({ connected }: { connected: boolean }) {
  const { leagues, addLeague, removeLeague } = useLeagues();
  const { leagues: yahooLeagues, loading: yahooLoading } = useYahooLeagues(connected);
  const [name, setName] = useState("");
  const [yahooLeagueId, setYahooLeagueId] = useState("");

  // Deduplicate: Yahoo leagues take priority; hide manual entries with same yahooLeagueId
  const manualLeagues = leagues.filter(
    (l) => !yahooLeagues.some((y) => y.yahooLeagueId === l.yahooLeagueId)
  );

  return (
    <div className="space-y-4">
      {/* Yahoo-synced leagues */}
      {connected && (
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary/70">
            From Yahoo
          </p>
          {yahooLoading ? (
            <div className="space-y-2">
              {[0, 1].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-surface-container-high" />
              ))}
            </div>
          ) : yahooLeagues.length === 0 ? (
            <p className="text-xs text-on-surface-variant">No Yahoo leagues found.</p>
          ) : (
            <div className="space-y-2">
              {yahooLeagues.map((league) => (
                <div
                  key={league.id}
                  className="flex items-center justify-between rounded-xl bg-surface-container-low px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{league.name}</p>
                    <p className="text-[11px] text-on-surface-variant">{league.yahooLeagueId}</p>
                  </div>
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-black uppercase text-primary">
                    Yahoo
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manually-added leagues */}
      {manualLeagues.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/50">
            {connected ? "Manual" : "Leagues"}
          </p>
          <div className="space-y-2">
            {manualLeagues.map((league) => (
              <div
                key={league.id}
                className="flex items-center justify-between rounded-xl bg-surface-container-low px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-on-surface">{league.name}</p>
                  <p className="text-[11px] text-on-surface-variant">{league.yahooLeagueId}</p>
                </div>
                {(yahooLeagues.length + manualLeagues.length) > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeLeague(league.id)}
                    className="text-xs text-primary"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual add form */}
      <div className="space-y-2 border-t border-white/5 pt-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/50">
          Add manually
        </p>
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
            if (!name.trim() || !yahooLeagueId.trim()) return;
            addLeague({
              id: `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${yahooLeagueId.trim()}`,
              name: name.trim(),
              yahooLeagueId: yahooLeagueId.trim(),
              season: new Date().getFullYear()
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
