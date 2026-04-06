import { useYahooAuth } from "@/hooks/useYahooAuth";
import { LeagueManager } from "@/components/settings/LeagueManager";
import { CategoryManager } from "@/components/settings/CategoryManager";
import { StatPreferencesPanel } from "@/components/settings/StatPreferences";
import { YahooAccountPanel } from "@/components/settings/YahooAccountPanel";

export function SettingsPage() {
  const { connected, loading, disconnect } = useYahooAuth();

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">
          Settings
        </h1>
        <p className="mt-1 font-medium text-on-surface-variant">
          Manage your <span className="font-bold text-primary">leagues, categories, and preferences</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-surface-container-low p-6">
          <h2 className="mb-6 font-headline text-lg font-bold text-on-surface">Leagues</h2>
          <LeagueManager connected={connected} />
        </div>

        <div className="rounded-xl bg-surface-container-low p-6">
          <h2 className="mb-6 font-headline text-lg font-bold text-on-surface">Categories</h2>
          <CategoryManager />
        </div>

        <div className="rounded-xl bg-surface-container-low p-6">
          <h2 className="mb-6 font-headline text-lg font-bold text-on-surface">Preferences</h2>
          <StatPreferencesPanel />
        </div>
      </div>

      <div className="rounded-xl bg-surface-container-low p-6">
        <h2 className="mb-6 font-headline text-lg font-bold text-on-surface">Yahoo Account</h2>
        <div className="max-w-sm">
          <YahooAccountPanel
            connected={connected}
            loading={loading}
            onDisconnect={disconnect}
          />
        </div>
      </div>
    </section>
  );
}
