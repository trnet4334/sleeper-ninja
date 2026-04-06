import { useRef, useState } from "react";
import type { PlayersResponse } from "@/lib/apiClient";

type Player = PlayersResponse["players"][number];

const MAX_PLAYERS = 5;

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function TradePlayerSearch({
  label,
  tone,
  selected,
  allPlayers,
  onAdd,
  onRemove,
}: {
  label: string;
  tone: "giving" | "receiving";
  selected: Player[];
  allPlayers: Player[];
  onAdd: (player: Player) => void;
  onRemove: (playerId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedIds = new Set(selected.map((p) => p.id));
  const results = query.trim()
    ? (() => {
        const q = query.toLowerCase();
        return allPlayers
          .filter((p) => !selectedIds.has(p.id) && p.playerName.toLowerCase().includes(q))
          .sort((a, b) => {
            const aName = a.playerName.toLowerCase();
            const bName = b.playerName.toLowerCase();
            const aStarts = aName.startsWith(q) ? 0 : 1;
            const bStarts = bName.startsWith(q) ? 0 : 1;
            if (aStarts !== bStarts) return aStarts - bStarts;
            return b.recommendationScore - a.recommendationScore;
          })
          .slice(0, 10);
      })()
    : [];

  const accentClass = tone === "giving" ? "text-error border-error/30" : "text-primary border-primary/30";
  const badgeClass = tone === "giving" ? "bg-error/10 text-error" : "bg-primary/10 text-primary";
  const atCapacity = selected.length >= MAX_PLAYERS;

  function handleSelect(player: Player) {
    onAdd(player);
    setQuery("");
    setOpen(false);
  }

  function handleBlur(e: React.FocusEvent) {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <span className={`text-[10px] font-black uppercase tracking-widest ${accentClass.split(" ")[0]}`}>
        {label}
      </span>

      {/* Search input */}
      <div ref={containerRef} className="relative" onBlur={handleBlur}>
        <input
          type="text"
          value={query}
          disabled={atCapacity}
          placeholder={atCapacity ? "已達上限 (5)" : "搜尋球員..."}
          className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => { if (query.trim()) setOpen(true); }}
        />

        {/* Dropdown */}
        {open && results.length > 0 && (
          <ul className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-outline-variant/20 bg-surface-container-low shadow-xl">
            {results.map((player) => (
              <li key={player.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-container-high"
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(player); }}
                >
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-surface-container-high">
                    <span className="text-[9px] font-bold text-primary">{getInitials(player.playerName)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-on-surface">{player.playerName}</p>
                    <p className="text-[10px] text-on-surface-variant">{player.position} · {player.team}</p>
                  </div>
                  <span className={`ml-auto shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold ${badgeClass}`}>
                    {player.recommendationScore.toFixed(0)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="space-y-2">
          {selected.map((player) => (
            <div
              key={player.id}
              className={`flex items-center gap-3 rounded-lg border ${accentClass.split(" ")[1] ?? "border-outline-variant/10"} bg-surface-container-lowest px-3 py-2.5`}
            >
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/30">
                <span className="text-[9px] font-bold text-primary">{getInitials(player.playerName)}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-on-surface">{player.playerName}</p>
                <p className="text-[10px] text-on-surface-variant">{player.position} · {player.team}</p>
              </div>
              <span className="text-xs font-bold tabular-nums text-on-surface-variant">
                {player.recommendationScore.toFixed(0)}
              </span>
              <button
                type="button"
                className="ml-1 text-on-surface-variant/50 hover:text-error transition-colors"
                onClick={() => onRemove(player.id)}
                aria-label={`Remove ${player.playerName}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {selected.length === 0 && !query && (
        <p className="text-[10px] text-on-surface-variant/50">未選擇球員</p>
      )}
    </div>
  );
}
