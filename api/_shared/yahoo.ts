// ---------------------------------------------------------------------------
// Yahoo OAuth token record
// ---------------------------------------------------------------------------

export interface YahooTokenRecord {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO-8601
}

export interface YahooOAuthExchangeResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export function toTokenRecord(token: YahooOAuthExchangeResult): YahooTokenRecord {
  const expiresAt = new Date(Date.now() + token.expiresIn * 1000).toISOString();
  return {
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
    expiresAt
  };
}

export function isTokenExpired(record: YahooTokenRecord, now = new Date()) {
  return new Date(record.expiresAt).getTime() <= now.getTime();
}

// ---------------------------------------------------------------------------
// Yahoo OAuth URL helpers
// ---------------------------------------------------------------------------

export function readYahooEnv(env: Record<string, string | undefined>) {
  return {
    clientId: env.YAHOO_CLIENT_ID ?? "",
    clientSecret: env.YAHOO_CLIENT_SECRET ?? "",
    baseUrl: env.VITE_APP_URL ?? env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:5173"
  };
}

export function hasYahooConfig(env: Record<string, string | undefined>) {
  const config = readYahooEnv(env);
  return Boolean(config.clientId && config.clientSecret);
}

export function buildYahooAuthUrl(env: Record<string, string | undefined>, state = "sleeper-ninja") {
  const config = readYahooEnv(env);
  const callbackUrl = `${config.baseUrl}/api/yahoo/callback`;
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    language: "en-us",
    scope: "fspt-r",
    state
  });
  return `https://api.login.yahoo.com/oauth2/request_auth?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Cookie constants and helpers
// ---------------------------------------------------------------------------

export const YAHOO_COOKIE_NAME = "yahoo_token";

export function setCookieHeader(encrypted: string): string {
  return [
    `${YAHOO_COOKIE_NAME}=${encrypted}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=2592000",
    "Path=/"
  ].join("; ");
}

export function clearCookieHeader(): string {
  return [
    `${YAHOO_COOKIE_NAME}=`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0",
    "Path=/"
  ].join("; ");
}

// ---------------------------------------------------------------------------
// AES-256-GCM token encryption / decryption
// ---------------------------------------------------------------------------

async function deriveKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const raw = encoder.encode(secret.padEnd(32, "0").slice(0, 32));
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

function toBase64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function fromBase64url(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export async function encryptToken(payload: object, secret: string): Promise<string> {
  const key = await deriveKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(payload));

  const cipherBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);

  // AES-GCM appends 16-byte auth tag at the end of the ciphertext
  const cipherBytes = new Uint8Array(cipherBuf);
  const ciphertext = cipherBytes.slice(0, -16);
  const authTag = cipherBytes.slice(-16);

  return [toBase64url(iv.buffer), toBase64url(authTag.buffer), toBase64url(ciphertext.buffer)].join(":");
}

export async function decryptToken(encrypted: string, secret: string): Promise<object | null> {
  try {
    const parts = encrypted.split(":");
    if (parts.length !== 3) return null;

    const [ivB64, authTagB64, ciphertextB64] = parts;
    const iv = fromBase64url(ivB64);
    const authTag = fromBase64url(authTagB64);
    const ciphertext = fromBase64url(ciphertextB64);

    // Reassemble: ciphertext + authTag (Web Crypto expects them concatenated)
    const combined = new Uint8Array(ciphertext.length + authTag.length);
    combined.set(ciphertext);
    combined.set(authTag, ciphertext.length);

    const key = await deriveKey(secret);
    const ivBuf = iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength) as ArrayBuffer;
    const decryptBuf = combined.buffer.slice(combined.byteOffset, combined.byteOffset + combined.byteLength) as ArrayBuffer;
    const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBuf }, key, decryptBuf);
    return JSON.parse(new TextDecoder().decode(plainBuf)) as object;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie token parsing
// ---------------------------------------------------------------------------

export async function parseCookieToken(
  cookieHeader: string | null,
  secret: string
): Promise<YahooTokenRecord | null> {
  if (!cookieHeader) return null;

  // Parse cookie string into key-value pairs
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

  const record = payload as YahooTokenRecord;
  if (!record.accessToken || !record.refreshToken || !record.expiresAt) return null;

  return record;
}
