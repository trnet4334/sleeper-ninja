import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, afterEach } from "vitest";
import { CategoryProvider } from "@/components/layout/CategoryContext";
import {
  H2HMatchupPage,
  MyRosterPage,
  SleeperReportPage,
  StatExplorerPage,
  TradeAnalyzerPage
} from ".";

function wrap(node: React.ReactNode) {
  return render(
    <MemoryRouter>
      <CategoryProvider>{node}</CategoryProvider>
    </MemoryRouter>
  );
}

describe("prototype pages", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders sleeper report with analysis sections", async () => {
    wrap(<SleeperReportPage />);
    expect(screen.getByText("Market Inefficiencies")).toBeInTheDocument();
    expect(await screen.findByText(/Sleeper Candidates:/)).toBeInTheDocument();
  });

  it("renders roster page with player cards", async () => {
    wrap(<MyRosterPage />);
    expect(await screen.findByText("Aaron Judge")).toBeInTheDocument();
  });

  it("renders matchup page with ninja insight and roster columns when connected", async () => {
    vi.spyOn(global, "fetch").mockImplementation((input) => {
      const url = typeof input === "string" ? input : (input as Request).url;
      if (url.includes("/api/yahoo/status")) {
        return Promise.resolve(
          new Response(JSON.stringify({ connected: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          })
        );
      }
      return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
    });

    wrap(<H2HMatchupPage />);
    expect(await screen.findByText("Ninja Insight")).toBeInTheDocument();
    expect(await screen.findByText("My Roster")).toBeInTheDocument();
  });

  it("renders matchup connect prompt when not connected", async () => {
    vi.spyOn(global, "fetch").mockImplementation((input) => {
      const url = typeof input === "string" ? input : (input as Request).url;
      if (url.includes("/api/yahoo/status")) {
        return Promise.resolve(
          new Response(JSON.stringify({ connected: false }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          })
        );
      }
      return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
    });

    wrap(<H2HMatchupPage />);
    expect(await screen.findByText("Connect Yahoo Fantasy")).toBeInTheDocument();
  });

  it("renders trade and explorer analytical modules", async () => {
    wrap(<TradeAnalyzerPage />);
    expect(await screen.findByText("Trade Analyzer")).toBeInTheDocument();

    wrap(<StatExplorerPage />);
    expect(await screen.findByText("Detailed Analytics")).toBeInTheDocument();
  });
});
