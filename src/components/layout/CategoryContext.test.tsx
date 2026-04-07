import { fireEvent, render, screen } from "@testing-library/react";
import { useCategoryContext } from "@/hooks/useCategoryContext";
import { CategoryProvider } from "./CategoryContext";

function Probe() {
  const {
    activeLeague,
    activeCategories,
    activeStatPrefs,
    setActiveLeague,
    setCategories,
    setStatPrefs
  } = useCategoryContext();

  return (
    <div>
      <p>{activeLeague?.name}</p>
      <p>{activeCategories.hitter.join(",")}</p>
      <p>{activeStatPrefs.daysBack}</p>
      <button type="button" onClick={() => setActiveLeague("lets_go_fans")}>
        switch
      </button>
      <button
        type="button"
        onClick={() => setCategories({ hitter: ["OPS"], pitcher: ["QS"] })}
      >
        categories
      </button>
      <button
        type="button"
        onClick={() => setStatPrefs({ advanced: ["xSLG"], daysBack: 30 })}
      >
        prefs
      </button>
    </div>
  );
}

describe("CategoryContext", () => {
  it("switches active league and persists category preferences", () => {
    render(
      <CategoryProvider>
        <Probe />
      </CategoryProvider>
    );

    expect(screen.getByText("Viva el Birdos")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "switch" }));
    expect(screen.getByText("Lets Go Fans")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "categories" }));
    expect(screen.getByText("OPS")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "prefs" }));
    expect(screen.getByText("30")).toBeInTheDocument();
  });
});
