import { useCallback, useMemo, useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useSleeperAnalysis } from "@/hooks/useSleeperAnalysis";
import { CategoryBar } from "@/components/trade/CategoryBar";
import { TradePlayerSearch } from "@/components/trade/TradePlayerSearch";
import { useTradeScoring, type TimeWindow } from "@/hooks/useTradeScoring";
import type { PlayersResponse } from "@/lib/apiClient";

type Player = PlayersResponse["players"][number];

const TIME_WINDOWS: { label: string; value: TimeWindow }[] = [
  { label: "本週", value: "this_week" },
  { label: "本月", value: "this_month" },
  { label: "賽季剩餘", value: "rest_of_season" },
];

export function TradeAnalyzerPage() {
  const { hitterCats } = useCategories();
  const { data: hitterData } = useSleeperAnalysis("hitter");
  const { data: pitcherData } = useSleeperAnalysis("pitcher");

  const [timeWindow, setTimeWindow] = useState<TimeWindow>("rest_of_season");
  const [giving, setGiving] = useState<Player[]>([]);
  const [receiving, setReceiving] = useState<Player[]>([]);
  const [confirmedGiving, setConfirmedGiving] = useState<Player[]>([]);
  const [confirmedReceiving, setConfirmedReceiving] = useState<Player[]>([]);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const allPlayers = useMemo(
    () => [...(hitterData?.players ?? []), ...(pitcherData?.players ?? [])],
    [hitterData, pitcherData]
  );

  // Fall back to common batting stats when league categories aren't configured
  const FALLBACK_CATS = ["HR", "SB", "AVG", "OBP", "BB", "TB"];
  const cats = useMemo(
    () => (hitterCats.length > 0 ? hitterCats : FALLBACK_CATS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hitterCats]
  );

  const handleAddGiving = useCallback(
    (player: Player) => setGiving((prev) => (prev.length >= 5 ? prev : [...prev, player])),
    []
  );
  const handleRemoveGiving = useCallback(
    (id: string) => setGiving((prev) => prev.filter((p) => p.id !== id)),
    []
  );
  const handleAddReceiving = useCallback(
    (player: Player) => setReceiving((prev) => (prev.length >= 5 ? prev : [...prev, player])),
    []
  );
  const handleRemoveReceiving = useCallback(
    (id: string) => setReceiving((prev) => prev.filter((p) => p.id !== id)),
    []
  );

  const handleConfirm = useCallback(() => {
    setConfirmedGiving(giving);
    setConfirmedReceiving(receiving);
    setHasConfirmed(true);
  }, [giving, receiving]);

  const analysis = useTradeScoring({
    giving: confirmedGiving,
    receiving: confirmedReceiving,
    timeWindow,
    allPlayers,
    cats,
  });

  const isEmpty = !hasConfirmed || (confirmedGiving.length === 0 && confirmedReceiving.length === 0);
  const confirmDisabled = giving.length === 0 && receiving.length === 0;



  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">
            Trade Analyzer
          </h1>
          <p className="mt-1 font-medium text-on-surface-variant">
            Quantifying impact for your{" "}
            <span className="font-bold text-primary">fantasy roster</span>
          </p>
        </div>
        {/* Time window switcher */}
        <div className="flex gap-0 rounded-lg border border-outline-variant/10 bg-surface-container-low p-1">
          {TIME_WINDOWS.map((w) => (
            <button
              key={w.value}
              onClick={() => setTimeWindow(w.value)}
              className={`rounded px-3 py-1.5 text-xs font-bold transition-all ${
                timeWindow === w.value
                  ? "bg-primary text-on-primary shadow"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Player search row */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 rounded-xl bg-surface-container-low p-6 lg:col-span-6">
          <TradePlayerSearch
            label="你放出"
            tone="giving"
            selected={giving}
            allPlayers={allPlayers}
            onAdd={handleAddGiving}
            onRemove={handleRemoveGiving}
          />
        </div>
        <div className="col-span-12 rounded-xl bg-surface-container-low p-6 lg:col-span-6">
          <TradePlayerSearch
            label="你獲得"
            tone="receiving"
            selected={receiving}
            allPlayers={allPlayers}
            onAdd={handleAddReceiving}
            onRemove={handleRemoveReceiving}
          />
        </div>
      </div>

      {/* Confirm button */}
      <div className="flex justify-center">
        <button
          onClick={handleConfirm}
          disabled={confirmDisabled}
          className="rounded-lg bg-primary px-10 py-3 font-headline text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          開始分析
        </button>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="rounded-xl border border-outline-variant/10 bg-surface-container-low py-14 text-center">
          <p className="text-sm text-on-surface-variant">選好雙方球員後，分析結果將自動出現</p>
        </div>
      )}

      {/* Analysis — visible after confirm */}
      {!isEmpty && (
        <div className="space-y-4">
          {/* 比項影響 */}
          <div className="rounded-xl bg-surface-container-low p-6">
            <h3 className="mb-6 font-headline text-lg font-bold text-on-surface">比項影響</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {analysis.catDeltas.map((cd) => {
                const deltaLabel =
                  cd.delta === 0 ? "Stable" : `${cd.delta > 0 ? "+" : ""}${cd.delta.toFixed(2)}σ`;
                return (
                  <CategoryBar
                    key={cd.cat}
                    category={cd.cat}
                    delta={cd.delta}
                    deltaLabel={deltaLabel}
                    weaknessBadge={cd.isMyWeakness === true}
                    strengthBadge={cd.isMyStrength === true}
                  />
                );
              })}
            </div>
          </div>

          {/* 優點 */}
          {analysis.advantages.length > 0 && (
            <div className="rounded-xl bg-surface-container-low p-6">
              <h3 className="mb-4 font-headline text-lg font-bold text-on-surface">✅ 優點</h3>
              <ul className="space-y-3">
                {analysis.advantages.map((a, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 text-primary">✓</span>
                    <p className="text-sm leading-snug text-on-surface-variant">{a.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 缺點 */}
          {analysis.disadvantages.length > 0 && (
            <div className="rounded-xl bg-surface-container-low p-6">
              <h3 className="mb-4 font-headline text-lg font-bold text-on-surface">❌ 缺點</h3>
              <ul className="space-y-3">
                {analysis.disadvantages.map((d, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 text-rose-400">×</span>
                    <p className="text-sm leading-snug text-on-surface-variant">{d.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 風險警示 */}
          {analysis.riskFlags.length > 0 && (
            <div className="rounded-xl bg-surface-container-low p-6">
              <h3 className="mb-4 font-headline text-lg font-bold text-on-surface">⚠️ 風險警示</h3>
              <div className="space-y-3">
                {analysis.riskFlags.map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[8px] font-black uppercase ${
                        f.level === "high"
                          ? "bg-rose-500/15 text-rose-300"
                          : f.level === "medium"
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary-container/20 text-secondary"
                      }`}
                    >
                      {f.level}
                    </span>
                    <p className="text-sm leading-snug text-on-surface-variant">{f.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 談判建議 */}
          {analysis.negotiationHint !== null && (
            <div className="rounded-xl bg-primary-container p-6 text-on-primary-container">
              <h3 className="mb-2 font-headline text-lg font-bold">💬 談判建議</h3>
              <p className="text-sm leading-relaxed opacity-90">{analysis.negotiationHint}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer methodology bar */}
      <footer className="flex items-center gap-4 border-t border-outline-variant/10 py-6">
        <div className="flex items-center gap-2 rounded-full bg-tertiary-container/20 px-3 py-1 text-[10px] font-bold text-tertiary">
          <span className="text-xs">ℹ</span>
          NINJA ANALYTICS ENGINE V2.4
        </div>
        <p className="text-[10px] text-on-surface-variant">
          Projections are updated every 15 minutes based on latest practice reports and weather telemetry.
        </p>
      </footer>
    </section>
  );
}
