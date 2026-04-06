import { useCallback, useEffect, useState } from "react";

export interface YahooAuthState {
  connected: boolean;
  loading: boolean;
  disconnect: () => Promise<void>;
}

export function useYahooAuth(): YahooAuthState {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/yahoo/status");
        if (!response.ok) {
          if (!cancelled) { setConnected(false); setLoading(false); }
          return;
        }
        const raw = (await response.json()) as { connected?: unknown };
        const isConnected = raw != null && typeof raw.connected === "boolean" ? raw.connected : false;
        if (!cancelled) {
          setConnected(isConnected);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setConnected(false);
          setLoading(false);
        }
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  const disconnect = useCallback(async () => {
    try {
      const response = await fetch("/api/yahoo/disconnect", { method: "POST" });
      if (response.ok) {
        setConnected(false);
      }
      // non-ok: intentional no-op — user can retry; spec says leave state unchanged
    } catch {
      // no-op: leave state unchanged
    }
  }, []);

  return { connected, loading, disconnect };
}
