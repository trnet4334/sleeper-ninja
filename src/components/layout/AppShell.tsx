import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { navItems } from "@/lib/navigation";
import { useLeagues } from "@/hooks/useLeagues";
import { useYahooAuth } from "@/hooks/useYahooAuth";
import { cx } from "@/lib/utils";
import { YahooConnectBanner } from "@/components/auth/YahooConnectBanner";

const sectionOrder = ["Fantasy HQ", "Tools", "News", "Config"] as const;
const LEAGUE_COLLAPSED_COUNT = 3;

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { leagues, activeLeagueId, setActiveLeague } = useLeagues();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [leaguesExpanded, setLeaguesExpanded] = useState(false);
  const { connected, loading: authLoading } = useYahooAuth();

  const groupedNav = useMemo(
    () =>
      sectionOrder.map((section) => ({
        section,
        items: navItems.filter((item) => item.section === section)
      })),
    []
  );

  const visibleLeagues = leaguesExpanded ? leagues : leagues.slice(0, LEAGUE_COLLAPSED_COUNT);
  const hasMore = leagues.length > LEAGUE_COLLAPSED_COUNT;

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="flex min-h-screen">
        {/* Mobile overlay */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        <aside
          id="main-nav"
          aria-label="Main navigation"
          className={cx(
            "fixed inset-y-0 left-0 z-40 flex w-72 flex-col overflow-y-auto bg-surface px-6 py-8 shadow-ambient transition-transform lg:translate-x-0",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="mb-10">
            <p className="font-headline text-2xl font-extrabold tracking-tight text-amber-600">Sleeper Ninja</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
              Pro Analyst Edition
            </p>
          </div>

          <nav className="flex-1 space-y-8">
            {groupedNav.map((group) => (
              <div key={group.section}>
                <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/50">
                  {group.section}
                </div>
                <ul className="mt-2 space-y-1">
                  {group.items.map((item) => {
                    const active = location.pathname === item.path;
                    const isRoster = item.path === "/roster";
                    return (
                      <li key={item.path}>
                        <button
                          type="button"
                          onClick={() => {
                            navigate(item.path);
                            setMobileNavOpen(false);
                          }}
                          className={cx(
                            "flex w-full items-center gap-3 rounded-r-xl py-3 pl-6 pr-4 text-left text-base font-medium transition-all",
                            active
                              ? "border-l-2 border-primary bg-primary/5 text-primary"
                              : "text-on-surface-variant hover:text-primary"
                          )}
                        >
                          <span className={cx("h-2 w-2 rounded-full", active ? "bg-primary" : "bg-on-surface-variant/20")} />
                          {item.label}
                        </button>

                        {isRoster && leagues.length > 0 && (
                          <ul className="mt-1 space-y-0.5 pl-10">
                            {visibleLeagues.map((league) => {
                              const leagueActive = league.id === activeLeagueId;
                              return (
                                <li key={league.id}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveLeague(league.id);
                                      navigate("/roster");
                                      setMobileNavOpen(false);
                                    }}
                                    className={cx(
                                      "flex w-full items-center gap-2 rounded-lg py-2 pl-3 pr-3 text-left text-sm transition-all",
                                      leagueActive
                                        ? "bg-primary/8 font-semibold text-primary"
                                        : "text-on-surface-variant/70 hover:text-on-surface"
                                    )}
                                  >
                                    <span className={cx("h-1.5 w-1.5 shrink-0 rounded-full", leagueActive ? "bg-primary" : "bg-on-surface-variant/20")} />
                                    <span className="truncate">{league.name}</span>
                                  </button>
                                </li>
                              );
                            })}
                            {hasMore && (
                              <li>
                                <button
                                  type="button"
                                  onClick={() => setLeaguesExpanded((v) => !v)}
                                  className="flex w-full items-center gap-2 rounded-lg py-1.5 pl-3 pr-3 text-left text-xs text-on-surface-variant/50 transition-colors hover:text-on-surface-variant"
                                >
                                  <span className="text-[10px]">{leaguesExpanded ? "▲" : "▼"}</span>
                                  {leaguesExpanded ? "Show less" : `Show ${leagues.length - LEAGUE_COLLAPSED_COUNT} more`}
                                </button>
                              </li>
                            )}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

        </aside>

        <div className="flex min-h-screen flex-1 flex-col lg:ml-72">
          {/* Mobile hamburger */}
          <button
            type="button"
            aria-expanded={mobileNavOpen}
            aria-controls="main-nav"
            aria-label="Open navigation"
            className="fixed left-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-md bg-surface-container-low text-on-surface shadow-sm lg:hidden"
            onClick={() => setMobileNavOpen((v) => !v)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {!connected && !authLoading && <YahooConnectBanner />}
          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
