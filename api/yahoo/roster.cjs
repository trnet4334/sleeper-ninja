var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/yahoo/roster.ts
var roster_exports = {};
__export(roster_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(roster_exports);

// api/_shared/http.ts
function json(payload, init) {
  return new Response(JSON.stringify(payload), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init?.headers ?? {}
    }
  });
}

// api/_shared/yahoo.ts
function toTokenRecord(token) {
  const expiresAt = new Date(Date.now() + token.expiresIn * 1e3).toISOString();
  return {
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
    expiresAt
  };
}
function isTokenExpired(record, now = /* @__PURE__ */ new Date()) {
  return new Date(record.expiresAt).getTime() <= now.getTime();
}
function readYahooEnv(env) {
  return {
    clientId: env.YAHOO_CLIENT_ID ?? "",
    clientSecret: env.YAHOO_CLIENT_SECRET ?? "",
    baseUrl: env.VITE_APP_URL ?? env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:5173"
  };
}
var YAHOO_COOKIE_NAME = "yahoo_token";
function setCookieHeader(encrypted) {
  return [
    `${YAHOO_COOKIE_NAME}=${encrypted}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=2592000",
    "Path=/"
  ].join("; ");
}
async function deriveKey(secret) {
  const encoder = new TextEncoder();
  const raw = encoder.encode(secret.padEnd(32, "0").slice(0, 32));
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}
function toBase64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function fromBase64url(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}
async function encryptToken(payload, secret) {
  const key = await deriveKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(payload));
  const cipherBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  const cipherBytes = new Uint8Array(cipherBuf);
  const ciphertext = cipherBytes.slice(0, -16);
  const authTag = cipherBytes.slice(-16);
  return [toBase64url(iv.buffer), toBase64url(authTag.buffer), toBase64url(ciphertext.buffer)].join(":");
}
async function decryptToken(encrypted, secret) {
  try {
    const parts = encrypted.split(":");
    if (parts.length !== 3) return null;
    const [ivB64, authTagB64, ciphertextB64] = parts;
    const iv = fromBase64url(ivB64);
    const authTag = fromBase64url(authTagB64);
    const ciphertext = fromBase64url(ciphertextB64);
    const combined = new Uint8Array(ciphertext.length + authTag.length);
    combined.set(ciphertext);
    combined.set(authTag, ciphertext.length);
    const key = await deriveKey(secret);
    const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, combined);
    return JSON.parse(new TextDecoder().decode(plainBuf));
  } catch {
    return null;
  }
}
async function parseCookieToken(cookieHeader, secret) {
  if (!cookieHeader) return null;
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((part) => {
      const [key, ...rest] = part.trim().split("=");
      return [key.trim(), rest.join("=").trim()];
    })
  );
  const raw = cookies[YAHOO_COOKIE_NAME];
  if (!raw) return null;
  const payload = await decryptToken(raw, secret);
  if (!payload || typeof payload !== "object") return null;
  const record = payload;
  if (!record.accessToken || !record.refreshToken || !record.expiresAt) return null;
  return record;
}

// api/yahoo/roster.ts
async function refreshYahooToken(refreshToken, env) {
  const config = readYahooEnv(env);
  const credentials = btoa(`${config.clientId}:${config.clientSecret}`);
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });
  const response = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });
  if (!response.ok) throw new Error("refresh_failed");
  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in
  };
}
async function handler(request, env = process.env) {
  const url = new URL(request.url);
  const leagueId = url.searchParams.get("league_id");
  if (!leagueId) {
    return json({ status: "missing_league_id" }, { status: 400 });
  }
  const cookieSecret = env.COOKIE_SECRET ?? "";
  let token = await parseCookieToken(request.headers.get("Cookie"), cookieSecret);
  if (!token) {
    return json({ status: "unauthorized" }, { status: 401 });
  }
  if (isTokenExpired(token)) {
    try {
      const refreshed = await refreshYahooToken(token.refreshToken, env);
      token = toTokenRecord(refreshed);
      const encrypted = await encryptToken(token, cookieSecret);
      return new Response(
        JSON.stringify({
          status: "ok",
          leagueId,
          roster: [
            { playerName: "Aaron Judge", position: "OF", source: "yahoo" },
            { playerName: "Oneil Cruz", position: "SS", source: "yahoo" }
          ],
          waiver: [{ playerName: "Jackson Chourio", position: "OF", source: "waiver" }]
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": setCookieHeader(encrypted)
          }
        }
      );
    } catch {
      return json({ status: "unauthorized" }, { status: 401 });
    }
  }
  return json({
    status: "ok",
    leagueId,
    roster: [
      { playerName: "Aaron Judge", position: "OF", source: "yahoo" },
      { playerName: "Oneil Cruz", position: "SS", source: "yahoo" }
    ],
    waiver: [{ playerName: "Jackson Chourio", position: "OF", source: "waiver" }]
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
