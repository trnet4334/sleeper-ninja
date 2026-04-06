import { describe, expect, it } from "vitest";
import { handler as playersHandler } from "./players";
import { handler as analysisHandler } from "./analysis";
import { handler as matchupHandler } from "./matchup";
import { expandStats } from "../_shared/data";

describe("data api", () => {
  it("expands related stats from requested categories", () => {
    expect(expandStats(["HR", "OBP"], ["EV"])).toEqual(
      expect.arrayContaining(["Barrel%", "HardHit%", "xSLG", "xwOBA", "BB%", "EV"])
    );
  });

  it("serves category-aware player results", async () => {
    const response = await playersHandler(
      new Request(
        "http://localhost/api/data/players?leagueId=viva_el_birdos&playerType=hitter&cats=HR,OBP&stats=EV&daysBack=14"
      )
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.playerType).toBe("hitter");
    expect(payload.players[0].metrics).toHaveProperty("HR");
    expect(payload.players[0].metrics).toHaveProperty("xwOBA");
  });

  it("summarizes analysis cards from the same query contract", async () => {
    const response = await analysisHandler(
      new Request(
        "http://localhost/api/data/analysis?leagueId=viva_el_birdos&playerType=pitcher&cats=ERA,QS&stats=CSW%25&daysBack=14"
      )
    );
    const payload = await response.json();

    expect(payload.summary.availableFas).toBeGreaterThan(0);
    expect(payload.summary.topPlayer).toBeTruthy();
    expect(payload.selectedStats).toContain("xERA");
  });

  it("returns matchup forecasts and pickup suggestions for requested categories", async () => {
    const response = await matchupHandler(
      new Request(
        "http://localhost/api/data/matchup?leagueId=viva_el_birdos&playerType=hitter&cats=HR,SB,OBP&stats=xwOBA&mode=average"
      )
    );
    const payload = await response.json();

    expect(payload.opponent).toBe("Midtown Mashers");
    expect(payload.forecast).toHaveLength(3);
    expect(payload.weakCategories.length).toBeGreaterThan(0);
    expect(payload.pickups.length).toBeGreaterThan(0);
  });
});
