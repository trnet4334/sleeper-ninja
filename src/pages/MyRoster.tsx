import { useState } from "react";
import { useRosterData } from "@/hooks/useRosterData";
import { useLeagues } from "@/hooks/useLeagues";
import { RosterSummaryCard } from "@/components/roster/RosterSummaryCard";
import { PlayerRow } from "@/components/roster/PlayerRow";
import type { LeagueDefinition } from "@/types/league";

const HITTER_COLS = ["AVG", "HR", "RBI", "SB"];
const PITCHER_COLS = ["ERA", "WHIP", "K", "W-S"];

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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
  empty
}: {
  label: string;
  statCols: string[];
  children: React.ReactNode;
  empty: boolean;
}) {
  return (
    <section className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">{label}</p>
      {empty ? (
        <p className="text-sm text-on-surface-variant">No players on roster.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-surface-container-low">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="py-3 pr-4 pl-5 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                  Pos
                </th>
                <th className="py-3 pr-6 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                  Player
                </th>
                {statCols.map((col) => (
                  <th
                    key={col}
                    className="py-3 pr-4 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant"
                  >
                    {col}
                  </th>
                ))}
                <th className="py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                  Status
                </th>
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

function RosterContent() {
  const { players: hitters } = useRosterData("hitter");
  const { players: pitchers } = useRosterData("pitcher");

  return (
    <section className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <RosterSummaryCard label="Roster Health" value="92%" accent />
        <RosterSummaryCard label="Active Grid" value="12/12" accent />
        <RosterSummaryCard label="Waiver Priority" value="#4" />
        <RosterSummaryCard label="FAAB" value="$72" />
      </div>

      <TableSection label="Hitters" statCols={HITTER_COLS} empty={hitters.length === 0}>
        {hitters.map((player) => (
          <PlayerRow key={player.id} player={player} columns={HITTER_COLS} />
        ))}
      </TableSection>

      <TableSection label="Pitchers" statCols={PITCHER_COLS} empty={pitchers.length === 0}>
        {pitchers.map((player) => (
          <PlayerRow key={player.id} player={player} columns={PITCHER_COLS} />
        ))}
      </TableSection>
    </section>
  );
}

export function MyRosterPage() {
  const { leagues, addLeague } = useLeagues();

  if (leagues.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center py-16">
        <AddLeagueForm onAdd={addLeague} />
      </section>
    );
  }

  return <RosterContent />;
}
