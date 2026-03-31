import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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
  it("renders sleeper report with analysis sections", async () => {
    wrap(<SleeperReportPage />);
    expect(screen.getByText("Market Inefficiencies")).toBeInTheDocument();
    expect(await screen.findByText(/Sleeper Candidates:/)).toBeInTheDocument();
  });

  it("renders roster page with player cards", async () => {
    wrap(<MyRosterPage />);
    expect(await screen.findByText("Aaron Judge")).toBeInTheDocument();
  });

  it("renders matchup page with ninja insight and roster columns", async () => {
    wrap(<H2HMatchupPage />);
    expect(await screen.findByText("Ninja Insight")).toBeInTheDocument();
    expect(await screen.findByText("My Roster")).toBeInTheDocument();
  });

  it("renders trade and explorer analytical modules", async () => {
    wrap(<TradeAnalyzerPage />);
    expect(await screen.findByText("Category Comparison")).toBeInTheDocument();

    wrap(<StatExplorerPage />);
    expect(await screen.findByText("Detailed Analytics")).toBeInTheDocument();
  });
});
