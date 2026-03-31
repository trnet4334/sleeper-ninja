export function YahooConnectBanner() {
  return (
    <div className="flex items-center justify-between border-b border-amber-500/20 bg-amber-500/10 px-4 py-3 sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-amber-400">
        Connect Yahoo Fantasy to sync your roster and live data.
      </p>
      <a
        href="/api/yahoo/connect"
        className="ml-4 shrink-0 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-black transition-opacity hover:opacity-90"
      >
        Connect
      </a>
    </div>
  );
}
