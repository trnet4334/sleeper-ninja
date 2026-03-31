import {
  getLeagues,
  removeLeague,
  setLeagues,
  updateCategorySet,
  updateStatPreference,
  upsertLeague
} from "./storage";

describe("storage", () => {
  it("reads and writes leagues from localStorage", () => {
    const leagues = [{ id: "demo", name: "Demo", yahooLeagueId: "123", season: 2025 }];
    setLeagues(leagues);

    expect(getLeagues([])).toEqual(leagues);
  });

  it("upserts and removes leagues", () => {
    const base = [{ id: "demo", name: "Demo", yahooLeagueId: "123", season: 2025 }];

    expect(
      upsertLeague(base, { id: "demo", name: "Demo 2", yahooLeagueId: "999", season: 2026 })
    ).toEqual([{ id: "demo", name: "Demo 2", yahooLeagueId: "999", season: 2026 }]);
    expect(removeLeague(base, "demo")).toEqual([]);
  });

  it("updates categories and stat preferences per league", () => {
    expect(
      updateCategorySet({}, "demo", { hitter: ["HR"], pitcher: ["K"] })
    ).toEqual({
      demo: { hitter: ["HR"], pitcher: ["K"] }
    });
    expect(
      updateStatPreference({}, "demo", { advanced: ["xwOBA"], daysBack: 14 })
    ).toEqual({
      demo: { advanced: ["xwOBA"], daysBack: 14 }
    });
  });
});
