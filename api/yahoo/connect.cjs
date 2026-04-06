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

// api/yahoo/connect.ts
var connect_exports = {};
__export(connect_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(connect_exports);

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
function buildYahooAuthUrl(env, state = "sleeper-ninja") {
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

// api/yahoo/connect.ts
function handler(request = new Request("http://localhost/api/yahoo/connect"), env = process.env) {
  void request;
  if (!hasYahooConfig(env)) {
    return json({ status: "missing_config" }, { status: 500 });
  }
  const authUrl = buildYahooAuthUrl(env);
  return new Response(null, {
    status: 302,
    headers: { Location: authUrl }
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
