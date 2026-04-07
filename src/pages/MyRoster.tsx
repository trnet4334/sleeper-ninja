import { useEffect, useRef, useState } from "react";
import { useLeagues } from "@/hooks/useLeagues";
import { useYahooAuth } from "@/hooks/useYahooAuth";
import { useYahooRoster } from "@/hooks/useYahooRoster";
import type { YahooPlayer } from "@/hooks/useYahooRoster";
import { RosterSummaryCard } from "@/components/roster/RosterSummaryCard";
import { PlayerRow } from "@/components/roster/PlayerRow";
import type { LeagueDefinition } from "@/types/league";

const HITTER_COLS = ["AVG", "HR", "RBI", "SB"];
const PITCHER_COLS = ["ERA", "WHIP", "K", "W-S"];
const IL_POSITIONS = ["IL", "IL10", "IL60"];

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function yahooPlayerToRow(player: YahooPlayer) {
  return {
    id: `${player.playerName}-${player.team}`,
    playerName: player.playerName,
    team: player.team,
    position: player.position.split(",")[0].trim(),
    playerType: "hitter" as const,
    rosterState: "roster" as const,
    metrics: {} as Record<string, number | string>,
    trend: [],
    delta: 0,
    recommendationScore: 0
  };
}

function SkeletonRow({ cols }: { cols: string[] }) {
  return (
    <tr className="animate-pulse">
      <td className="py-2 pr-4">
        <span className="block h-4 w-8 rounded bg-surface-container-high" />
      </td>
      <td className="py-2 pr-6">
        <span className="block h-4 w-32 rounded bg-surface-container-high" />
      </td>
      {cols.map((col) => (
        <td key={col} className="py-2 pr-4">
          <span className="block h-4 w-10 rounded bg-surface-container-high" />
        </td>
      ))}
      <td className="py-2">
        <span className="block h-4 w-12 rounded bg-surface-container-high" />
      </td>
    </tr>
  );
}

function AddLeagueForm({ onAdd }: { onAdd: (league: LeagueDefinition) => void }) {
  const [name, setName] = useState("");
  const [yahooLeagueId, setYahooLeagueId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("League name is required."); return; }
    onAdd({
      id: slugify(name.trim()) || `league-${Date.now()}`,
      name: name.trim(),
      yahooLeagueId: yahooLeagueId.trim(),
      season: new Date().getFullYear(),
    });
  };

  return (
    <div className="rounded-shell border border-white/5 bg-surface-container-lowest px-8 py-10 max-w-md mx-auto text-center space-y-6">
      <div className="space-y-2">
        <p className="text-base font-semibold text-on-surface">No leagues yet</p>
        <p className="text-sm text-on-surface-variant">Add your first league to get started.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
            League Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            placeholder="e.g. Viva el Birdos"
            className="w-full rounded-lg border border-white/10 bg-surface-container-low px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary/50 focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
            Yahoo League ID <span className="font-normal normal-case tracking-normal opacity-60">(optional)</span>
          </label>
          <input
            type="text"
            value={yahooLeagueId}
            onChange={(e) => setYahooLeagueId(e.target.value)}
            placeholder="e.g. 12345"
            className="w-full rounded-lg border border-white/10 bg-surface-container-low px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary/50 focus:outline-none"
          />
        </div>
        {error && <p className="text-xs text-rose-400">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
        >
          Add League
        </button>
      </form>
    </div>
  );
}

function TableSection({
  label,
  statCols,
  children,
  empty,
  loading
}: {
  label: string;
  statCols: string[];
  children: React.ReactNode;
  empty: boolean;
  loading?: boolean;
}) {
  return (
    <section className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">{label}</p>
      {loading ? (
        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-surface-container-low">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="py-3 pr-4 pl-5 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">Pos</th>
                <th className="py-3 pr-6 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">Player</th>
                {statCols.map((col) => (
                  <th key={col} className="py-3 pr-4 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">{col}</th>
                ))}
                <th className="py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">Status</th>
              </tr>
            </thead>
            <tbody className="[&>tr]:border-b [&>tr]:border-white/5 [&>tr:last-child]:border-0 [&>tr]:pl-5">
              <SkeletonRow cols={statCols} />
              <SkeletonRow cols={statCols} />
              <SkeletonRow cols={statCols} />
            </tbody>
          </table>
        </div>
      ) : empty ? (
        <p className="text-sm text-on-surface-variant">No players on roster.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-surface-container-low">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="py-3 pr-4 pl-5 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">Pos</th>
                <th className="py-3 pr-6 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">Player</th>
                {statCols.map((col) => (
                  <th key={col} className="py-3 pr-4 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">{col}</th>
                ))}
                <th className="py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">Status</th>
              </tr>
            </thead>
            <tbody className="[&>tr]:border-b [&>tr]:border-white/5 [&>tr:last-child]:border-0 [&>tr]:pl-5">
              {children}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function LeagueTabs({
  leagues,
  activeLeagueId,
  onSelect
}: {
  leagues: LeagueDefinition[];
  activeLeagueId: string | null;
  onSelect: (id: string) => void;
}) {
  if (leagues.length <= 1) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {leagues.map((league) => {
        const isActive = league.id === activeLeagueId;
        return (
          <button
            key={league.id}
            type="button"
            onClick={() => onSelect(league.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              isActive
                ? "bg-primary text-on-primary"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {league.name}
            <span className="ml-1.5 opacity-60">{league.season}</span>
          </button>
        );
      })}
    </div>
  );
}

function RosterContent({ activeYahooLeagueId }: { activeYahooLeagueId: string }) {
  const { hitters, pitchers, loading } = useYahooRoster(activeYahooLeagueId);

  return (
    <section className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <RosterSummaryCard label="Roster Health" value="—" accent />
        <RosterSummaryCard label="Active Grid" value="—" accent />
        <RosterSummaryCard label="Waiver Priority" value="—" />
        <RosterSummaryCard label="FAAB" value="—" />
      </div>

      <TableSection label="Hitters" statCols={HITTER_COLS} empty={!loading && hitters.length === 0} loading={loading}>
        {hitters.map((player) => (
          <PlayerRow
            key={`${player.playerName}-${player.team}`}
            player={yahooPlayerToRow(player)}
            columns={HITTER_COLS}
            il={IL_POSITIONS.includes(player.selectedPosition)}
          />
        ))}
      </TableSection>

      <TableSection label="Pitchers" statCols={PITCHER_COLS} empty={!loading && pitchers.length === 0} loading={loading}>
        {pitchers.map((player) => (
          <PlayerRow
            key={`${player.playerName}-${player.team}`}
            player={yahooPlayerToRow(player)}
            columns={PITCHER_COLS}
            il={IL_POSITIONS.includes(player.selectedPosition)}
          />
        ))}
      </TableSection>
    </section>
  );
}

export function MyRosterPage() {
  const { leagues, activeLeague, activeLeagueId, setActiveLeague, addLeague } = useLeagues();
  const { connected, loading: authLoading } = useYahooAuth();
  const [autoImporting, setAutoImporting] = useState(false);
  const importAttempted = useRef(false);

  useEffect(() => {
    if (authLoading || !connected || leagues.length > 0 || importAttempted.current) return;

    importAttempted.current = true;
    let cancelled = false;
    setAutoImporting(true);

    async function importLeagues() {
      try {
        const response = await fetch("/api/yahoo/leagues");
        if (!response.ok || cancelled) return;
        const payload = (await response.json()) as { leagues: Array<{ id: string; name: string; yahooLeagueId: string; season: number }> };
        if (!cancelled) {
          (payload.leagues ?? []).forEach((league) => addLeague(league));
        }
      } finally {
        if (!cancelled) setAutoImporting(false);
      }
    }

    void importLeagues();
    return () => { cancelled = true; };
  }, [authLoading, connected, leagues.length, addLeague]);

  const isLoading = authLoading || autoImporting;

  if (isLoading) {
    return (
      <section className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-on-surface-variant animate-pulse">Loading leagues…</p>
      </section>
    );
  }

  if (leagues.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center py-16">
        <AddLeagueForm onAdd={addLeague} />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <LeagueTabs leagues={leagues} activeLeagueId={activeLeagueId} onSelect={setActiveLeague} />
      <RosterContent activeYahooLeagueId={activeLeague?.yahooLeagueId ?? ""} />
    </section>
  );
}
