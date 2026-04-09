import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { CategoryProvider } from "@/components/layout/CategoryContext";
import { SleeperReportPage } from "./SleeperReport";

const payload = {
  status: "ok" as const,
  leagueId: "demo",
  playerType: "hitter" as const,
  daysBack: 14,
  selectedCategories: ["HR", "OBP"],
  selectedStats: ["HR", "OBP", "xwOBA"],
  summary: {
    availableFas: 4,
    topDelta: 0.12,
    topPlayer: "Utility Bat",
    hotPlayers: 2,
    ilReturns: 3
  },
  players: [
    {
      id: "c1",
      playerName: "Catcher One",
      team: "SEA",
      position: "C",
      playerType: "hitter" as const,
      rosterState: "waiver" as const,
      metrics: { HR: 12, OBP: 0.351, xwOBA: 0.366 },
      trend: [0.3, 0.31, 0.32],
      delta: 0.03,
      recommendationScore: 72
    },
    {
      id: "2b1",
      playerName: "Middle Infield",
      team: "CHC",
      position: "2B/SS",
      playerType: "hitter" as const,
      rosterState: "waiver" as const,
      metrics: { HR: 9, OBP: 0.34, xwOBA: 0.351 },
      trend: [0.28, 0.29, 0.31],
      delta: 0.04,
      recommendationScore: 68
    },
    {
      id: "of1",
      playerName: "Center Fielder",
      team: "ATL",
      position: "CF",
      playerType: "hitter" as const,
      rosterState: "waiver" as const,
      metrics: { HR: 15, OBP: 0.366, xwOBA: 0.38 },
      trend: [0.33, 0.34, 0.36],
      delta: 0.08,
      recommendationScore: 83
    },
    {
      id: "dh1",
      playerName: "Utility Bat",
      team: "HOU",
      position: "DH",
      playerType: "hitter" as const,
      rosterState: "waiver" as const,
      metrics: { HR: 18, OBP: 0.372, xwOBA: 0.391 },
      trend: [0.34, 0.36, 0.39],
      delta: 0.12,
      recommendationScore: 88
    }
  ]
};

function renderPage() {
  return render(
    <MemoryRouter>
      <CategoryProvider>
        <SleeperReportPage />
      </CategoryProvider>
    </MemoryRouter>
  );
}

describe("SleeperReportPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows hitter role tabs and filters UTIL / OF / 2B using player roles", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    renderPage();

    expect(await screen.findByRole("button", { name: "UTIL" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "OF" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2B" })).toBeInTheDocument();

    expect(await screen.findByText("Catcher One")).toBeInTheDocument();
    expect(screen.getByText("Middle Infield")).toBeInTheDocument();
    expect(screen.getByText("Center Fielder")).toBeInTheDocument();
    expect(screen.getAllByText("Utility Bat").length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole("button", { name: "OF" }));

    await waitFor(() => {
      expect(screen.getAllByText("Center Fielder").length).toBeGreaterThan(0);
      expect(screen.queryByText("Catcher One")).not.toBeInTheDocument();
      expect(screen.queryByText("Middle Infield")).not.toBeInTheDocument();
      expect(screen.queryByText("Utility Bat")).not.toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "2B" }));

    await waitFor(() => {
      expect(screen.getAllByText("Middle Infield").length).toBeGreaterThan(0);
      expect(screen.queryByText("Center Fielder")).not.toBeInTheDocument();
    });
  });
});
