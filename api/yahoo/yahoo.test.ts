import { describe, expect, it, vi, beforeEach } from "vitest";
import { handler as connectHandler } from "./connect";
import { handler as callbackHandler } from "./callback";
import { handler as statusHandler } from "./status";
import { handler as disconnectHandler } from "./disconnect";
import { handler as transactionsHandler } from "./transactions";
import { handler as rosterHandler } from "./roster";
import { handler as matchupHandler } from "./matchup";
import { handler as leaguesHandler, parseYahooLeagues } from "./leagues";
import { buildYahooAuthUrl, encryptToken, toTokenRecord } from "../_shared/yahoo";

const env = {
  YAHOO_CLIENT_ID: "client",
  YAHOO_CLIENT_SECRET: "secret",
  VITE_APP_URL: "https://example.com",
  COOKIE_SECRET: "test-secret-32-chars-padded-here"
};

describe("connect", () => {
  it("redirects to Yahoo auth URL when env is configured", () => {
    const response = connectHandler(new Request("https://example.com/api/yahoo/connect"), env);
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toContain("client_id=client");
    expect(buildYahooAuthUrl(env)).toContain(
      "redirect_uri=https%3A%2F%2Fexample.com%2Fapi%2Fyahoo%2Fcallback"
    );
  });

  it("returns 500 when env vars missing", () => {
    const response = connectHandler(new Request("https://example.com/api/yahoo/connect"), {});
    expect(response.status).toBe(500);
  });
});

describe("callback", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 400 when code param is missing", async () => {
    const response = await callbackHandler(
      new Request("https://example.com/api/yahoo/callback"),
      env
    );
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.status).toBe("missing_code");
  });

  it("redirects and sets cookie after successful token exchange", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: "access-abc",
          refresh_token: "refresh-abc",
          expires_in: 3600
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const response = await callbackHandler(
      new Request("https://example.com/api/yahoo/callback?code=test-code"),
      env
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toContain("connected=true");
    expect(response.headers.get("Set-Cookie")).toContain("yahoo_token=");
    expect(response.headers.get("Set-Cookie")).toContain("HttpOnly");
  });
});

describe("status", () => {
  it("returns connected: false when no cookie present", async () => {
    const response = await statusHandler(
      new Request("https://example.com/api/yahoo/status"),
      env
    );
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.connected).toBe(false);
  });

  it("returns connected: true when valid cookie present", async () => {
    const record = toTokenRecord({
      accessToken: "access-xyz",
      refreshToken: "refresh-xyz",
      expiresIn: 3600
    });
    const encrypted = await encryptToken(record, env.COOKIE_SECRET);

    const response = await statusHandler(
      new Request("https://example.com/api/yahoo/status", {
        headers: { Cookie: `yahoo_token=${encrypted}` }
      }),
      env
    );
    const payload = await response.json();
    expect(payload.connected).toBe(true);
  });
});

describe("disconnect", () => {
  it("clears the cookie and returns disconnected", () => {
    const response = disconnectHandler();
    expect(response.status).toBe(200);
    const setCookie = response.headers.get("Set-Cookie") ?? "";
    expect(setCookie).toContain("Max-Age=0");
  });
});

describe("transactions", () => {
  it("returns 400 when league_id is missing", async () => {
    const response = await transactionsHandler(
      new Request("https://example.com/api/yahoo/transactions"),
      env
    );
    expect(response.status).toBe(400);
  });

  it("returns 401 when no cookie present", async () => {
    const response = await transactionsHandler(
      new Request("https://example.com/api/yahoo/transactions?league_id=123"),
      env
    );
    expect(response.status).toBe(401);
  });
});

describe("roster", () => {
  it("returns 400 when league_id is missing", async () => {
    const response = await rosterHandler(
      new Request("https://example.com/api/yahoo/roster"),
      env
    );
    expect(response.status).toBe(400);
  });

  it("returns 401 when no cookie present", async () => {
    const response = await rosterHandler(
      new Request("https://example.com/api/yahoo/roster?league_id=123"),
      env
    );
    expect(response.status).toBe(401);
  });

  it("returns roster data when valid cookie present", async () => {
    const record = toTokenRecord({
      accessToken: "access-xyz",
      refreshToken: "refresh-xyz",
      expiresIn: 3600
    });
    const encrypted = await encryptToken(record, env.COOKIE_SECRET);

    const response = await rosterHandler(
      new Request("https://example.com/api/yahoo/roster?league_id=123", {
        headers: { Cookie: `yahoo_token=${encrypted}` }
      }),
      env
    );
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.leagueId).toBe("123");
    expect(Array.isArray(payload.roster)).toBe(true);
  });
});

describe("matchup", () => {
  it("returns 400 when league_id is missing", async () => {
    const response = await matchupHandler(
      new Request("https://example.com/api/yahoo/matchup"),
      env
    );
    expect(response.status).toBe(400);
  });

  it("returns 401 when no cookie present", async () => {
    const response = await matchupHandler(
      new Request("https://example.com/api/yahoo/matchup?league_id=123"),
      env
    );
    expect(response.status).toBe(401);
  });

  it("returns matchup data when valid cookie present", async () => {
    const record = toTokenRecord({
      accessToken: "access-xyz",
      refreshToken: "refresh-xyz",
      expiresIn: 3600
    });
    const encrypted = await encryptToken(record, env.COOKIE_SECRET);

    const response = await matchupHandler(
      new Request("https://example.com/api/yahoo/matchup?league_id=123", {
        headers: { Cookie: `yahoo_token=${encrypted}` }
      }),
      env
    );
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.opponent).toBe("Midtown Mashers");
  });
});

describe("parseYahooLeagues", () => {
  it("returns empty array for unexpected shape", () => {
    expect(parseYahooLeagues(null)).toEqual([]);
    expect(parseYahooLeagues({})).toEqual([]);
    expect(parseYahooLeagues({ fantasy_content: {} })).toEqual([]);
  });

  it("parses a single league from Yahoo response", () => {
    const fixture = {
      fantasy_content: {
        users: {
          "0": {
            user: [
              { guid: "abc" },
              {
                games: {
                  "0": {
                    game: [
                      { game_key: "mlb" },
                      {
                        leagues: {
                          "0": {
                            league: [
                              { league_id: "12345", name: "My League", season: "2025" }
                            ]
                          },
                          count: 1
                        }
                      }
                    ]
                  },
                  count: 1
                }
              }
            ]
          },
          count: 1
        }
      }
    };
    const result = parseYahooLeagues(fixture);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "my_league",
      name: "My League",
      yahooLeagueId: "12345",
      season: 2025
    });
  });
});

describe("leagues", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 when no cookie present", async () => {
    const response = await leaguesHandler(
      new Request("https://example.com/api/yahoo/leagues"),
      env
    );
    expect(response.status).toBe(401);
  });

  it("returns leagues array when valid cookie present", async () => {
    const record = toTokenRecord({
      accessToken: "access-xyz",
      refreshToken: "refresh-xyz",
      expiresIn: 3600
    });
    const encrypted = await encryptToken(record, env.COOKIE_SECRET);

    const fixture = {
      fantasy_content: {
        users: {
          "0": {
            user: [
              { guid: "abc" },
              {
                games: {
                  "0": {
                    game: [
                      { game_key: "mlb" },
                      {
                        leagues: {
                          "0": {
                            league: [
                              { league_id: "99999", name: "Test League", season: "2025" }
                            ]
                          },
                          count: 1
                        }
                      }
                    ]
                  },
                  count: 1
                }
              }
            ]
          },
          count: 1
        }
      }
    };

    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(fixture), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    const response = await leaguesHandler(
      new Request("https://example.com/api/yahoo/leagues", {
        headers: { Cookie: `yahoo_token=${encrypted}` }
      }),
      env
    );
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.leagues).toHaveLength(1);
    expect(payload.leagues[0].yahooLeagueId).toBe("99999");
    expect(payload.leagues[0].name).toBe("Test League");
  });

  it("returns 502 when Yahoo API fails", async () => {
    const record = toTokenRecord({
      accessToken: "access-xyz",
      refreshToken: "refresh-xyz",
      expiresIn: 3600
    });
    const encrypted = await encryptToken(record, env.COOKIE_SECRET);

    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("error", { status: 500 })
    );

    const response = await leaguesHandler(
      new Request("https://example.com/api/yahoo/leagues", {
        headers: { Cookie: `yahoo_token=${encrypted}` }
      }),
      env
    );
    expect(response.status).toBe(502);
  });
});
