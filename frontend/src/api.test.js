import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { apiFetch, responseError } from "./api.js";

const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;
afterEach(() => { globalThis.fetch = originalFetch; globalThis.window = originalWindow; });

test("writes include a fresh CSRF token and session credentials", async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return url.endsWith("/csrf")
      ? Response.json({ token: "fresh-token", headerName: "X-XSRF-TOKEN" })
      : Response.json({ id: 42 }, { status: 201 });
  };
  const response = await apiFetch("/api/v1/leads", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: '{"name":"Prospect"}',
  });
  assert.equal(response.status, 201);
  assert.equal(calls.length, 2);
  assert.equal(calls[1].options.headers.get("X-XSRF-TOKEN"), "fresh-token");
  assert.equal(calls[1].options.headers.get("Content-Type"), "application/json");
  assert.equal(calls[1].options.credentials, "same-origin");
});

test("a failed CSRF request prevents the write", async () => {
  let requests = 0;
  globalThis.fetch = async () => { requests++; return new Response(null, { status: 503 }); };
  await assert.rejects(apiFetch("/api/v1/leads/1", { method: "DELETE" }), /verify your session/);
  assert.equal(requests, 1);
});

test("API failures are returned as failures without fabricated data", async () => {
  globalThis.fetch = async () => new Response(null, { status: 500 });
  const result = await apiFetch("/api/v1/leads");
  assert.equal(result.ok, false);
  assert.equal(result.status, 500);
  globalThis.fetch = async () => { throw new TypeError("Network unavailable"); };
  await assert.rejects(apiFetch("/api/v1/leads"), /Network unavailable/);
});

test("expired sessions notify the application but invalid login does not", async () => {
  const events = [];
  globalThis.window = { dispatchEvent: (event) => events.push(event.type) };
  globalThis.fetch = async (url) => url.endsWith("/csrf")
    ? Response.json({ token: "token", headerName: "X-XSRF-TOKEN" })
    : new Response(null, { status: 401 });
  await apiFetch("/api/v1/auth/login", { method: "POST" });
  assert.deepEqual(events, []);
  await apiFetch("/api/v1/leads");
  assert.deepEqual(events, ["blms-session-expired"]);
});

test("error messages preserve server validation details and handle non-JSON errors", async () => {
  assert.equal((await responseError(Response.json({ error: "Email already exists" }, { status: 409 }), "Save failed")).message, "Email already exists");
  assert.equal((await responseError(new Response("Bad gateway", { status: 502 }), "Save failed")).message, "Save failed (502)");
});
