import { describe, expect, it } from "vitest";
import { filterSleeperPlayersByTab, type SleeperTab } from "./sleeperReportRoles";

const hitters = [
  { id: "c1", playerType: "hitter" as const, position: "C" },
  { id: "1b1", playerType: "hitter" as const, position: "1B" },
  { id: "2b1", playerType: "hitter" as const, position: "2B/SS" },
  { id: "3b1", playerType: "hitter" as const, position: "3B" },
  { id: "ss1", playerType: "hitter" as const, position: "SS" },
  { id: "lf1", playerType: "hitter" as const, position: "LF" },
  { id: "cf1", playerType: "hitter" as const, position: "CF" },
  { id: "rf1", playerType: "hitter" as const, position: "RF" },
  { id: "of1", playerType: "hitter" as const, position: "OF" },
  { id: "dh1", playerType: "hitter" as const, position: "DH" }
];

const pitchers = [
  { id: "sp1", playerType: "pitcher" as const, position: "SP" },
  { id: "rp1", playerType: "pitcher" as const, position: "RP" },
  { id: "cl1", playerType: "pitcher" as const, position: "CL" }
];

function idsFor(tab: SleeperTab) {
  return filterSleeperPlayersByTab([...hitters, ...pitchers], tab).map((player) => player.id);
}

describe("filterSleeperPlayersByTab", () => {
  it("maps hitter position tabs by player role", () => {
    expect(idsFor("C")).toEqual(["c1"]);
    expect(idsFor("1B")).toEqual(["1b1"]);
    expect(idsFor("2B")).toEqual(["2b1"]);
    expect(idsFor("3B")).toEqual(["3b1"]);
    expect(idsFor("SS")).toEqual(["2b1", "ss1"]);
    expect(idsFor("DH")).toEqual(["dh1"]);
  });

  it("groups all outfield roles under OF", () => {
    expect(idsFor("OF")).toEqual(["lf1", "cf1", "rf1", "of1"]);
  });

  it("makes UTIL include every hitter", () => {
    expect(idsFor("UTIL")).toEqual(hitters.map((player) => player.id));
  });

  it("keeps pitcher tabs unchanged", () => {
    expect(idsFor("SP")).toEqual(["sp1"]);
    expect(idsFor("RP")).toEqual(["rp1", "cl1"]);
  });
});
