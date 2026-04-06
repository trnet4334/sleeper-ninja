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

// api/yahoo/status.ts
var status_exports = {};
__export(status_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(status_exports);

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
var YAHOO_COOKIE_NAME = "yahoo_token";
async function deriveKey(secret) {
  const encoder = new TextEncoder();
  const raw = encoder.encode(secret.padEnd(32, "0").slice(0, 32));
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}
function fromBase64url(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
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

// api/yahoo/status.ts
async function handler(request, env = process.env) {
  const cookieSecret = env.COOKIE_SECRET ?? "";
  const cookieHeader = request.headers.get("Cookie");
  const token = await parseCookieToken(cookieHeader, cookieSecret);
  return json({ connected: token !== null });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
