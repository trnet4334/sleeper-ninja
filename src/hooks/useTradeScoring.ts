import { useMemo } from "react";
import type { PlayersResponse } from "@/lib/apiClient";

type Player = PlayersResponse["players"][number];

export type TimeWindow = "this_week" | "this_month" | "rest_of_season";

export interface CatDelta {
  cat: string;
  delta: number;
  givingTotal: number;
  receivingTotal: number;
  isMyWeakness: boolean | null;
  isMyStrength: boolean | null;
}

export interface AdvantagePoint {
  score: number;
  text: string;
}

export interface RiskFlag {
  level: "high" | "medium" | "low";
  text: string;
}

export interface TradeAnalysis {
  tradeNet: number;
  catDeltas: CatDelta[];
  advantages: AdvantagePoint[];
  disadvantages: AdvantagePoint[];
  riskFlags: RiskFlag[];
  negotiationHint: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Normalize a set of raw metric values into Z-scores (per-category across all players). */
function buildZScoreMap(
  allPlayers: Player[],
  cats: string[]
): Map<string, Map<string, number>> {
  const result = new Map<string, Map<string, number>>();
  for (const cat of cats) {
    const values = allPlayers
      .map((p) => {
        const v = p.metrics[cat];
        return typeof v === "number" ? v : parseFloat(String(v));
      })
      .filter((v) => !isNaN(v));

    const mean = avg(values);
    const sd = stdDev(values) || 1;

    const playerZMap = new Map<string, number>();
    for (const p of allPlayers) {
      const raw = p.metrics[cat];
      const v = typeof raw === "number" ? raw : parseFloat(String(raw));
      playerZMap.set(p.id, isNaN(v) ? 0 : (v - mean) / sd);
    }
    result.set(cat, playerZMap);
  }
  return result;
}

// ─── Scoring functions ────────────────────────────────────────────────────────

function getConsistencyScore(player: Player): number {
  const scores: number[] = Array.isArray((player as unknown as { weeklyScores?: unknown }).weeklyScores)
    ? ((player as unknown as { weeklyScores: number[] }).weeklyScores).slice(-4)
    : [];
  if (scores.length < 2) return 0.5;
  return 1 / (1 + stdDev(scores));
}

function getRosValue(player: Player, window: TimeWindow): number {
  const base = player.recommendationScore / 100;
  if (window === "this_week") return base * 0.6;
  if (window === "this_month") return base * 0.8;
  return base; // rest_of_season
}

function getGapFitScore(
  player: Player,
  catDeltas: CatDelta[],
  zScoreMap: Map<string, Map<string, number>>
): number {
  let score = 0;
  for (const gap of catDeltas) {
    if (gap.isMyWeakness !== true) continue;
    const playerZ = zScoreMap.get(gap.cat)?.get(player.id) ?? 0;
    const gapWeight = Math.max(0, -gap.delta); // gap severity
    score += playerZ * gapWeight;
  }
  return score;
}

function getTradeScore(
  player: Player,
  window: TimeWindow,
  catDeltas: CatDelta[],
  zScoreMap: Map<string, Map<string, number>>
): number {
  const w1 = 0.5, w2 = 0.2, w3 = 0.2, w4 = 0.1;
  const rosValue = getRosValue(player, window);
  const fscoreDelta = player.delta ?? 0;
  const gapFitScore = getGapFitScore(player, catDeltas, zScoreMap);
  const consistencyScore = getConsistencyScore(player);
  return w1 * rosValue + w2 * fscoreDelta + w3 * gapFitScore + w4 * consistencyScore;
}

function getCatDeltas(
  giving: Player[],
  receiving: Player[],
  cats: string[],
  zScoreMap: Map<string, Map<string, number>>,
  myRosterRanks: Map<string, number>
): CatDelta[] {
  return cats.map((cat) => {
    const givingTotal = giving.reduce((s, p) => s + (zScoreMap.get(cat)?.get(p.id) ?? 0), 0);
    const receivingTotal = receiving.reduce((s, p) => s + (zScoreMap.get(cat)?.get(p.id) ?? 0), 0);
    const delta = receivingTotal - givingTotal;
    const rank = myRosterRanks.get(cat) ?? null;
    return {
      cat,
      delta,
      givingTotal,
      receivingTotal,
      isMyWeakness: rank !== null ? rank >= 9 : null,
      isMyStrength: rank !== null ? rank <= 4 : null,
    };
  });
}

function getAdvantages(
  giving: Player[],
  receiving: Player[],
  tradeNet: number,
  catDeltas: CatDelta[]
): AdvantagePoint[] {
  const points: AdvantagePoint[] = [];
  const SCARCITY_WEIGHTS: Record<string, number> = { SB: 1.8, SV: 1.6, ERA: 1.5 };

  if (tradeNet > 0.1)
    points.push({ score: tradeNet, text: `Overall projection positive (+${tradeNet.toFixed(2)})` });

  for (const c of catDeltas) {
    if (c.delta > 0 && c.isMyWeakness === true)
      points.push({
        score: Math.abs(c.delta) * 2,
        text: `Fills your weakness in ${c.cat} (delta +${c.delta.toFixed(2)})`,
      });
  }

  for (const p of receiving) {
    if ((p.delta ?? 0) > 0.5)
      points.push({
        score: p.delta,
        text: `${p.playerName} is running hot (last-14d delta +${p.delta.toFixed(1)})`,
      });
  }

  for (const p of receiving) {
    const eligibilities = (p.position ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    if (eligibilities.length >= 3)
      points.push({
        score: 0.3,
        text: `${p.playerName} has ${eligibilities.join("/")} eligibility — roster flexibility`,
      });
  }

  for (const c of catDeltas) {
    const scarcityW = SCARCITY_WEIGHTS[c.cat] ?? 0;
    if (c.delta > 0 && scarcityW >= 1.5)
      points.push({
        score: scarcityW,
        text: `${c.cat} is a scarce category — improvement here has outsized league value`,
      });
  }

  const rcConsistency = avg(receiving.map(getConsistencyScore));
  const gcConsistency = avg(giving.map(getConsistencyScore));
  if (rcConsistency > gcConsistency + 0.1)
    points.push({
      score: rcConsistency - gcConsistency,
      text: `Incoming players are more consistent week-to-week`,
    });

  return points.sort((a, b) => b.score - a.score).slice(0, 3);
}

function getDisadvantages(
  giving: Player[],
  receiving: Player[],
  tradeNet: number,
  catDeltas: CatDelta[]
): AdvantagePoint[] {
  const points: AdvantagePoint[] = [];

  if (tradeNet < -0.1)
    points.push({ score: Math.abs(tradeNet), text: `Overall projection negative (${tradeNet.toFixed(2)})` });

  for (const c of catDeltas) {
    if (c.delta < -0.3 && c.isMyStrength === true)
      points.push({
        score: Math.abs(c.delta) * 1.5,
        text: `${c.cat} drops ${Math.abs(c.delta).toFixed(2)} σ — this is currently a team strength`,
      });
  }

  for (const p of giving) {
    if ((p.delta ?? 0) > 0.5)
      points.push({
        score: p.delta,
        text: `${p.playerName} is hot right now (+${p.delta.toFixed(1)}) — selling near the peak`,
      });
  }

  for (const p of receiving) {
    if ((p.delta ?? 0) < -0.5)
      points.push({
        score: Math.abs(p.delta),
        text: `${p.playerName} is in a slump (${p.delta.toFixed(1)}) — may be a temporary cold streak`,
      });
  }

  const rcConsistency = avg(receiving.map(getConsistencyScore));
  const gcConsistency = avg(giving.map(getConsistencyScore));
  if (gcConsistency > rcConsistency + 0.1)
    points.push({
      score: gcConsistency - rcConsistency,
      text: `Incoming players have more week-to-week variance — riskier in H2H`,
    });

  return points.sort((a, b) => b.score - a.score).slice(0, 3);
}

function getRiskFlags(
  giving: Player[],
  receiving: Player[],
  tradeNet: number
): RiskFlag[] {
  const flags: RiskFlag[] = [];

  // Medium: weekly impact heuristic from trade_net
  if (tradeNet < -0.5)
    flags.push({
      level: "medium",
      text: `This trade has a meaningful projected value deficit — review category bars carefully`,
    });

  // Low: giving side all hot
  const allGivingHot = giving.length > 0 && giving.every((p) => (p.delta ?? 0) > 0.3);
  if (allGivingHot)
    flags.push({
      level: "low",
      text: `All players you're giving up are performing above projection — timing may not be ideal`,
    });

  return flags.sort((a, b) =>
    ["high", "medium", "low"].indexOf(a.level) - ["high", "medium", "low"].indexOf(b.level)
  );
}

const COMPENSATION_MAP: Record<string, string> = {
  HR: "Ask for a 15+ HR bat or UTIL",
  SB: "Ask for a high Sprint Speed / stolen base specialist",
  AVG: "Ask for a contact hitter with .280+ xBA",
  H: "Ask for a contact hitter with .280+ xBA",
  OBP: "Ask for a high BB% / plate-discipline hitter",
  SLG: "Ask for a Barrel% elite power bat",
  TB: "Ask for an xSLG power hitter",
  R: "Ask for a middle-order lineup bat with run-scoring opportunity",
  RBI: "Ask for a middle-of-the-order RBI producer",
  BB: "Ask for a high-BB% plate-discipline bat",
  K: "Ask for a high-CSW% strikeout starter",
  ERA: "Ask for a sub-3.50 xERA quality starter",
  WHIP: "Ask for a low-BB% control pitcher",
  QS: "Ask for a starter with reliable rotation slots",
  W: "Ask for a starter with strong win-opportunity",
  SV: "Ask for a confirmed closer",
  HLD: "Ask for a high-leverage setup man",
  "SV+H": "Ask for a closer or high-usage reliever",
  "K/BB": "Ask for a CSW%/BB% elite control starter",
  IP: "Ask for a healthy innings-eater starter",
};

function getNegotiationHint(tradeNet: number, catDeltas: CatDelta[]): string | null {
  if (tradeNet >= 0 || tradeNet < -1.0) return null;
  const biggestLoss = [...catDeltas]
    .filter((c) => c.delta < 0)
    .sort((a, b) => a.delta - b.delta)[0];
  return COMPENSATION_MAP[biggestLoss?.cat] ?? "Ask for a bench depth player to balance the trade";
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTradeScoring({
  giving,
  receiving,
  timeWindow,
  allPlayers,
  cats,
  myRosterRanks = new Map(),
}: {
  giving: Player[];
  receiving: Player[];
  timeWindow: TimeWindow;
  allPlayers: Player[];
  cats: string[];
  myRosterRanks?: Map<string, number>;
}): TradeAnalysis {
  return useMemo(() => {
    const empty: TradeAnalysis = {
      tradeNet: 0,
      catDeltas: [],
      advantages: [],
      disadvantages: [],
      riskFlags: [],
      negotiationHint: null,
    };

    if (giving.length === 0 && receiving.length === 0) return empty;
    if (cats.length === 0) return empty;

    const zScoreMap = buildZScoreMap(allPlayers, cats);

    // Build a preliminary catDeltas with no roster ranks to seed gap-fit scoring
    const prelimDeltas = getCatDeltas(giving, receiving, cats, zScoreMap, myRosterRanks);

    const givingScores = giving.map((p) => getTradeScore(p, timeWindow, prelimDeltas, zScoreMap));
    const receivingScores = receiving.map((p) =>
      getTradeScore(p, timeWindow, prelimDeltas, zScoreMap)
    );

    const tradeNet =
      receivingScores.reduce((s, v) => s + v, 0) - givingScores.reduce((s, v) => s + v, 0);

    const catDeltas = getCatDeltas(giving, receiving, cats, zScoreMap, myRosterRanks);
    const advantages = getAdvantages(giving, receiving, tradeNet, catDeltas);
    const disadvantages = getDisadvantages(giving, receiving, tradeNet, catDeltas);
    const riskFlags = getRiskFlags(giving, receiving, tradeNet);
    const negotiationHint = getNegotiationHint(tradeNet, catDeltas);

    return { tradeNet, catDeltas, advantages, disadvantages, riskFlags, negotiationHint };
  }, [giving, receiving, timeWindow, allPlayers, cats, myRosterRanks]);
}
