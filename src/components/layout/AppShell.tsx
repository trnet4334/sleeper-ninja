import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { navItems } from "@/lib/navigation";
import { useLeagues } from "@/hooks/useLeagues";
import { useYahooAuth } from "@/hooks/useYahooAuth";
import { cx } from "@/lib/utils";
import { YahooConnectBanner } from "@/components/auth/YahooConnectBanner";
import { LeagueTabBar } from "./LeagueTabBar";

const sectionOrder = ["Fantasy HQ", "Tools", "Config"] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  useLeagues();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { connected, loading: authLoading } = useYahooAuth();

  const groupedNav = useMemo(
    () =>
      sectionOrder.map((section) => ({
        section,
        items: navItems.filter((item) => item.section === section)
      })),
    []
  );

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="flex min-h-screen">
        <aside
          id="main-nav"
          aria-label="Main navigation"
          className={cx(
            "fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto bg-surface px-6 py-8 shadow-ambient transition-transform lg:translate-x-0",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="mb-10">
            <p className="font-headline text-2xl font-extrabold tracking-tight text-amber-600">Sleeper Ninja</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
              Pro Analyst Edition
            </p>
          </div>

          <nav className="space-y-8">
            {groupedNav.map((group) => (
              <div key={group.section}>
                <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/50">
                  {group.section}
                </div>
                <ul className="mt-2 space-y-1">
                  {group.items.map((item) => {
                    const active = location.pathname === item.path;
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
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col lg:ml-72">
          <header className="sticky top-0 z-30 border-b border-white/5 bg-background/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                aria-expanded={mobileNavOpen}
                aria-controls="main-nav"
                className="rounded-md bg-primary-container px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-on-primary-container lg:hidden"
                onClick={() => setMobileNavOpen((value) => !value)}
              >
                Menu
              </button>

              <LeagueTabBar />
            </div>
          </header>

          {!connected && !authLoading && <YahooConnectBanner />}
          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
