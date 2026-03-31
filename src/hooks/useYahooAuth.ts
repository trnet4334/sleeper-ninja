import { useEffect, useState } from "react";

export interface YahooAuthState {
  connected: boolean;
  loading: boolean;
}

export function useYahooAuth(): YahooAuthState {
  const [state, setState] = useState<YahooAuthState>({ connected: false, loading: true });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/yahoo/status");
        const payload = (await response.json()) as { connected: boolean };
        if (!cancelled) {
          setState({ connected: payload.connected, loading: false });
        }
      } catch {
        if (!cancelled) {
          setState({ connected: false, loading: false });
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
