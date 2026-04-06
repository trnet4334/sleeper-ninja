import { useEffect, useMemo, useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useSleeperAnalysis } from "@/hooks/useSleeperAnalysis";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlayerDetailCard } from "@/components/ui/PlayerDetailCard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { StatChip } from "@/components/ui/StatChip";

type Tab = "hitter" | "sp" | "rp";
type SortDir = "asc" | "desc";

function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="ml-1 text-[8px] text-on-surface-variant/30">⇅</span>;
  return <span className="ml-1 text-[8px] text-primary">{dir === "asc" ? "▲" : "▼"}</span>;
}

const TAB_LABELS: Record<Tab, string> = {
  hitter: "Hitter Analytics",
  sp: "SP Analytics",
  rp: "RP Analytics",
};

function formatValue(value: number | string): string {
  const num = typeof value === "number" ? value : parseFloat(String(value));
  if (isNaN(num)) return String(value);
  return parseFloat(num.toFixed(3)).toString();
}

function RoleTag({ role }: { role: string }) {
  const color =
    role === "SP"
      ? "bg-primary/10 text-primary"
      : role === "CL"
        ? "bg-rose-400/15 text-rose-400"
        : "bg-tertiary/10 text-tertiary";
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${color}`}>
      {role || "—"}
    </span>
  );
}

export function SleeperReportPage() {
  const [tab, setTab] = useState<Tab>("hitter");
  const { hitterCats, pitcherCats } = useCategories();

  // SP and RP both query the pitcher data source
  const apiPlayerType = tab === "hitter" ? "hitter" : "pitcher";
  const { data, loading } = useSleeperAnalysis(apiPlayerType);

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sortKey, setSortKey] = useState<string>("recommendationScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const categories = tab === "hitter" ? hitterCats : pitcherCats;

  // Filter pitchers by role when on SP / RP tab.
  // Compound roles like "SP,RP" appear in both tabs.
  const filteredPlayers = useMemo(() => {
    const all = data?.players ?? [];
    if (tab === "sp") return all.filter((p) => !p.position || p.position.includes("SP"));
    if (tab === "rp") return all.filter((p) => p.position.includes("RP") || p.position === "CL");
    return all;
  }, [data?.players, tab]);

  const players = useMemo(() => {
    return [...filteredPlayers].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;
      if (sortKey === "delta") {
        aVal = a.delta; bVal = b.delta;
      } else if (sortKey === "recommendationScore") {
        aVal = a.recommendationScore; bVal = b.recommendationScore;
      } else if (sortKey === "playerName" || sortKey === "team" || sortKey === "position") {
        aVal = (a[sortKey] ?? "").toString().toLowerCase();
        bVal = (b[sortKey] ?? "").toString().toLowerCase();
      } else {
        const av = a.metrics[sortKey]; const bv = b.metrics[sortKey];
        aVal = typeof av === "number" ? av : parseFloat(String(av ?? "NaN"));
        bVal = typeof bv === "number" ? bv : parseFloat(String(bv ?? "NaN"));
        if (isNaN(aVal as number)) aVal = -Infinity;
        if (isNaN(bVal as number)) bVal = -Infinity;
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredPlayers, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const activePlayer = players.find((p) => p.id === selectedPlayerId) ?? null;

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  const visibleMetricColumns = useMemo(
    () => data?.selectedStats.filter((stat) => !["EV", "Sprint Speed"].includes(stat)).slice(0, 3) ?? [],
    [data?.selectedStats]
  );

  const topPlayer = players[0];
  const hotThreshold = tab === "hitter" ? 0.05 : 0.5;
  const hotCount = players.filter((p) => p.delta >= hotThreshold).length;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Market Inefficiencies"
        subtitle="Exploiting sabermetric gaps in current league rosters."
        tags={["Live Feed", "V3.4 Engine"]}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-headline text-xl font-bold uppercase tracking-[0.18em] text-on-surface">
            {TAB_LABELS[tab]}
          </h3>
          <SegmentedControl
            value={tab}
            options={["hitter", "sp", "rp"] as const}
            onChange={setTab}
            aria-label="Player type"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <StatChip key={category} label={category} tone="primary" />
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Available FAs" value={String(players.length)} note="Board Depth" />
        <MetricCard
          label="Top Delta"
          value={topPlayer ? topPlayer.delta.toFixed(3) : "0.000"}
          note={topPlayer?.playerName ?? "No signal"}
          tone="tertiary"
        />
        <MetricCard
          label={tab === "hitter" ? "Hot Hitters" : tab === "sp" ? "Hot Starters" : "Hot Arms"}
          value={String(hotCount)}
          note="Active Hot Streaks"
          tone="neutral"
        />
        <MetricCard label="IL Returns" value={String(data?.summary.ilReturns ?? 0)} note="72h Window" tone="error" />
      </div>

      {/* F-score + Delta legend */}
      <div className="rounded-shell border border-white/5 bg-surface-container-lowest/60 px-5 py-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">F-Score</span>
          <span className="text-[10px] text-on-surface-variant">— how we rank sleepers</span>
        </div>
        <p className="text-[12px] leading-relaxed text-on-surface-variant max-w-2xl">
          F-Score 的設計目標是「幫你贏比項」，而不是評估球員真實能力。
          我們只納入聯盟計分相關指標，並用 Z-score 衡量每位球員相對於可用球員池的表現。
          進階數據（xStat）作為修正工具，過濾掉短期運氣成分，讓你看到真正被市場低估的球員。
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-[11px] text-on-surface-variant">
          <span><span className="font-semibold text-on-surface">60%</span> 比項 Z-score × 稀缺性權重</span>
          <span><span className="font-semibold text-on-surface">15%</span> xStat 修正（過濾運氣）</span>
          <span><span className="font-semibold text-on-surface">10%</span> 接觸品質 / 穩定性</span>
          <span><span className="font-semibold text-on-surface">15%</span> 近期熱度 + 傷兵調整</span>
        </div>
        <div className="border-t border-white/5 pt-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary">Delta</span>
            <span className="text-[10px] text-on-surface-variant">— 運氣濾鏡</span>
          </div>
          <p className="text-[12px] leading-relaxed text-on-surface-variant max-w-2xl">
            打者顯示 <span className="font-medium text-on-surface">xwOBA − AVG</span>，
            投手顯示 <span className="font-medium text-on-surface">ERA − xERA</span>。
            正值代表實際成績被運氣拖累、真實能力被低估，是進場時機的訊號。
            負值則表示成績有虛高成分，需注意回歸風險。
          </p>
        </div>
      </div>

      {/* Candidates table */}
      <div className="rounded-shell border border-white/5 bg-surface-container-lowest">
        <div className="flex flex-col gap-4 border-b border-white/5 bg-surface-container-low/60 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">
            Sleeper Candidates:{" "}
            {tab === "hitter" ? "Hitters" : tab === "sp" ? "Starting Pitchers" : "Relief Pitchers"}
          </span>
          <span className="w-fit rounded-md bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
            Alpha Algorithm
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                {(["playerName", "team"] as const).map((key) => (
                  <th
                    key={key}
                    scope="col"
                    className="cursor-pointer select-none px-6 py-4 hover:text-on-surface"
                    onClick={() => handleSort(key)}
                  >
                    {key === "playerName" ? "Player" : "Team"}
                    <SortArrow active={sortKey === key} dir={sortDir} />
                  </th>
                ))}
                {tab !== "hitter" && (
                  <th
                    scope="col"
                    className="cursor-pointer select-none px-6 py-4 hover:text-on-surface"
                    onClick={() => handleSort("position")}
                  >
                    Role<SortArrow active={sortKey === "position"} dir={sortDir} />
                  </th>
                )}
                {visibleMetricColumns.map((metric) => (
                  <th
                    key={metric}
                    scope="col"
                    className="cursor-pointer select-none px-6 py-4 hover:text-on-surface"
                    onClick={() => handleSort(metric)}
                  >
                    {metric}<SortArrow active={sortKey === metric} dir={sortDir} />
                  </th>
                ))}
                <th
                  scope="col"
                  className="cursor-pointer select-none px-6 py-4 hover:text-on-surface"
                  onClick={() => handleSort("delta")}
                >
                  Delta<SortArrow active={sortKey === "delta"} dir={sortDir} />
                </th>
                <th
                  scope="col"
                  className="cursor-pointer select-none px-6 py-4 text-right hover:text-on-surface"
                  onClick={() => handleSort("recommendationScore")}
                >
                  Score<SortArrow active={sortKey === "recommendationScore"} dir={sortDir} />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {players.map((player) => (
                <tr
                  key={player.id}
                  tabIndex={0}
                  className="cursor-pointer hover:bg-surface-container-high/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  onClick={() => { setSelectedPlayerId(player.id); setModalOpen(true); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedPlayerId(player.id);
                      setModalOpen(true);
                    }
                  }}
                >
                  <td className="px-6 py-4 font-semibold text-on-surface">{player.playerName}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{player.team}</td>
                  {tab !== "hitter" && (
                    <td className="px-6 py-4">
                      <RoleTag role={player.position} />
                    </td>
                  )}
                  {visibleMetricColumns.map((metric) => (
                    <td key={metric} className="px-6 py-4 text-on-surface">
                      {player.metrics[metric] != null ? formatValue(player.metrics[metric]) : "—"}
                    </td>
                  ))}
                  <td className="px-6 py-4 font-headline font-bold text-primary">
                    {player.delta.toFixed(3)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="rounded-md bg-tertiary-container/20 px-2 py-1 text-xs font-bold text-tertiary">
                      {player.recommendationScore}
                    </span>
                  </td>
                </tr>
              ))}
              {players.length === 0 && !loading && (
                <tr>
                  <td colSpan={visibleMetricColumns.length + (tab !== "hitter" ? 5 : 4)}
                    className="px-6 py-10 text-center text-sm text-on-surface-variant">
                    No {tab === "sp" ? "starting pitchers" : "relief pitchers"} found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

      <div aria-live="polite" aria-atomic="true">
        {loading ? <p className="text-sm text-on-surface-variant">Loading editorial board...</p> : null}
      </div>
    </section>
  );
}
