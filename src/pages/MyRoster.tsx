import { useRosterData } from "@/hooks/useRosterData";
import { RosterSummaryCard } from "@/components/roster/RosterSummaryCard";
import { PlayerRow } from "@/components/roster/PlayerRow";

const HITTER_COLS = ["AVG", "HR", "RBI", "SB"];
const PITCHER_COLS = ["ERA", "WHIP", "K", "W-S"];

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

export function MyRosterPage() {
  const { players: hitters } = useRosterData("hitter");
  const { players: pitchers } = useRosterData("pitcher");

  return (
    <section className="space-y-8">
      {/* Summary cards — TODO: wire to real data */}
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
