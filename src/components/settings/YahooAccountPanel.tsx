export function YahooAccountPanel({
  connected,
  loading,
  onDisconnect,
}: {
  connected: boolean;
  loading: boolean;
  onDisconnect: () => Promise<void>;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-24 animate-pulse rounded bg-surface-container-high" />
        <div className="h-9 w-full animate-pulse rounded-lg bg-surface-container-high" />
      </div>
    );
  }

  if (connected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          <span className="text-sm font-semibold text-on-surface">Connected</span>
        </div>
        <p className="text-xs text-on-surface-variant">
          Your Yahoo Fantasy account is linked. League data syncs automatically.
        </p>
        <button
          type="button"
          onClick={onDisconnect}
          className="w-full rounded-lg border border-error/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-error transition-colors hover:bg-error/10"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-on-surface-variant/30" />
        <span className="text-sm font-semibold text-on-surface-variant">Not connected</span>
      </div>
      <p className="text-xs text-on-surface-variant">
        Connect your Yahoo Fantasy account to sync leagues and unlock Matchup Analysis.
      </p>
      <a
        href="/api/yahoo/connect"
        className="block w-full rounded-lg bg-amber-500 px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.15em] text-black transition-opacity hover:opacity-90"
      >
        Connect Yahoo Fantasy
      </a>
    </div>
  );
}
