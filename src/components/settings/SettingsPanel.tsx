import { useState } from "react";
import { CategoryManager } from "./CategoryManager";
import { LeagueManager } from "./LeagueManager";
import { StatPreferencesPanel } from "./StatPreferences";
import { useYahooAuth } from "@/hooks/useYahooAuth";

const tabs = [
  { id: "leagues", label: "Leagues" },
  { id: "categories", label: "Categories" },
  { id: "preferences", label: "Preferences" }
] as const;

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("leagues");
  const { connected } = useYahooAuth();

  return (
    <div className="mt-10 space-y-4">
      <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/50">Settings</div>
      <div role="tablist" aria-label="Settings sections" className="flex flex-wrap gap-2 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`settings-tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={activeTab === tab.id}
            aria-controls={`settings-panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${
              activeTab === tab.id ? "bg-primary text-background" : "bg-surface-container-low text-on-surface-variant"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`settings-panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`settings-tab-${tab.id}`}
            hidden={activeTab !== tab.id}
          >
            {tab.id === "leagues" ? <LeagueManager connected={connected} /> : null}
            {tab.id === "categories" ? <CategoryManager /> : null}
            {tab.id === "preferences" ? <StatPreferencesPanel /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
