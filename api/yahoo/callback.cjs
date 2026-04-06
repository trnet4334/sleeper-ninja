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

// api/yahoo/callback.ts
var callback_exports = {};
__export(callback_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(callback_exports);

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
function readYahooEnv(env) {
  return {
    clientId: env.YAHOO_CLIENT_ID ?? "",
    clientSecret: env.YAHOO_CLIENT_SECRET ?? "",
    baseUrl: env.VITE_APP_URL ?? env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:5173"
  };
}
function hasYahooConfig(env) {
  const config = readYahooEnv(env);
  return Boolean(config.clientId && config.clientSecret);
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

// api/yahoo/callback.ts
async function exchangeCode(code, env) {
  const config = readYahooEnv(env);
  const callbackUrl = `${config.baseUrl}/api/yahoo/callback`;
  const credentials = btoa(`${config.clientId}:${config.clientSecret}`);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: callbackUrl
  });
  const response = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });
  if (!response.ok) {
    throw new Error(`Yahoo token exchange failed: ${response.status}`);
  }
  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in
  };
}
async function handler(request, env = process.env) {
  if (!hasYahooConfig(env)) {
    return json({ status: "missing_config" }, { status: 500 });
  }
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return json({ status: "missing_code" }, { status: 400 });
  }
  const cookieSecret = env.COOKIE_SECRET;
  if (!cookieSecret) {
    return json({ status: "missing_cookie_secret" }, { status: 500 });
  }
  try {
    const tokenResult = await exchangeCode(code, env);
    const record = toTokenRecord(tokenResult);
    const encrypted = await encryptToken(record, cookieSecret);
    const config = readYahooEnv(env);
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${config.baseUrl}/?connected=true`,
        "Set-Cookie": setCookieHeader(encrypted)
      }
    });
  } catch {
    return json({ status: "exchange_failed" }, { status: 502 });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
