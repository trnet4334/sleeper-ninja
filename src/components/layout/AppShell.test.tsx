import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CategoryProvider } from "./CategoryContext";
import { AppShell } from "./AppShell";

describe("AppShell", () => {
  it("renders the prototype-aligned shell navigation", () => {
    render(
      <MemoryRouter>
        <CategoryProvider>
          <AppShell>
            <div>content</div>
          </AppShell>
        </CategoryProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Sleeper Ninja")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Viva el Birdos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "FA Sleeper Report" })).toBeInTheDocument();
  });
});
