import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { readFileSync } from "node:fs";
import { buildInstructions, readApiKey, createServer } from "./server.mjs";

const casesPath = new URL("../../docs/qa/ai-qa-cases.md", import.meta.url);

function fakeFetch(status, body) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  };
  fn.calls = calls;
  return fn;
}

async function start(fetchFn) {
  const server = createServer({ apiKey: "sk-test", instructions: "INSTR", fetch: fetchFn });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return { server, base: `http://127.0.0.1:${server.address().port}` };
}

test("buildInstructions keeps sections 1 and 2 only", () => {
  const out = buildInstructions(readFileSync(casesPath, "utf8"));
  assert.ok(out.includes("You are the AsikaGo assistant"));
  assert.ok(out.includes("Sole Proprietorship"));
  assert.ok(!out.includes("## 3. Coverage"));
  assert.ok(!out.includes("Q01"));
});

test("readApiKey prefers the env var", () => {
  assert.equal(readApiKey({ OPENAI_API_KEY: "sk-env" }, () => { throw new Error("no"); }), "sk-env");
});

test("readApiKey parses user-secrets output", () => {
  const out = "ConnectionStrings:Default = x\nOpenAI:ApiKey = sk-test\n";
  assert.equal(readApiKey({}, () => out), "sk-test");
});

test("readApiKey throws when missing", () => {
  assert.throws(() => readApiKey({}, () => "ConnectionStrings:Default = x\n"), /No OpenAI key\. Run: dotnet user-secrets set/);
});

test("POST /live forwards the offer", async () => {
  const f = fakeFetch(201, { session: { id: "live_1" }, transport: { type: "webrtc", sdp: "ANSWER" } });
  const { server, base } = await start(f);
  try {
    const res = await fetch(`${base}/live`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sdp: "OFFER" }),
    });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { sdp: "ANSWER" });
    assert.equal(f.calls.length, 1);
    assert.equal(f.calls[0].url, "https://api.openai.com/v1/live/sessions");
    assert.equal(f.calls[0].init.headers.Authorization, "Bearer sk-test");
    assert.deepEqual(JSON.parse(f.calls[0].init.body), {
      session: { model: "gpt-live-1", instructions: "INSTR" },
      transport: { type: "webrtc", sdp: "OFFER" },
    });
  } finally {
    server.close();
  }
});

test("POST /transcribe forwards the audio", async () => {
  const f = fakeFetch(200, { text: "Sari-sari store po", languages: [], usage: { type: "duration", seconds: 7 } });
  const { server, base } = await start(f);
  try {
    const audio = Buffer.from([1, 2, 3, 4, 5]);
    const res = await fetch(`${base}/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "audio/webm" },
      body: audio,
    });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { text: "Sari-sari store po", seconds: 7 });
    assert.equal(f.calls[0].url, "https://api.openai.com/v1/audio/transcriptions");
    assert.equal(f.calls[0].init.headers.Authorization, "Bearer sk-test");
    const form = f.calls[0].init.body;
    assert.ok(form instanceof FormData);
    assert.equal(form.get("model"), "gpt-transcribe");
    const file = form.get("file");
    assert.equal(file.type, "audio/webm");
    assert.equal(file.size, audio.length);
    assert.equal(file.name, "audio.webm");
  } finally {
    server.close();
  }
});

test("POST /transcribe without usage gives null seconds", async () => {
  const { server, base } = await start(fakeFetch(200, { text: "hi", languages: [] }));
  try {
    const res = await fetch(`${base}/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "audio/mp4" },
      body: Buffer.from([1]),
    });
    assert.deepEqual(await res.json(), { text: "hi", seconds: null });
  } finally {
    server.close();
  }
});

test("OpenAI error becomes 502", async () => {
  const { server, base } = await start(fakeFetch(400, { error: { message: "bad model" } }));
  try {
    const res = await fetch(`${base}/live`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sdp: "OFFER" }),
    });
    assert.equal(res.status, 502);
    assert.deepEqual(await res.json(), { error: "bad model" });
  } finally {
    server.close();
  }
});

test("CORS", async () => {
  const { server, base } = await start(fakeFetch(200, {}));
  try {
    const res = await fetch(`${base}/live`, { method: "OPTIONS" });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:5173");
    assert.equal(res.headers.get("access-control-allow-methods"), "POST");
    assert.equal(res.headers.get("access-control-allow-headers"), "Content-Type");
  } finally {
    server.close();
  }
});

test("unknown route is 404", async () => {
  const { server, base } = await start(fakeFetch(200, {}));
  try {
    const res = await fetch(`${base}/nope`, { method: "POST" });
    assert.equal(res.status, 404);
  } finally {
    server.close();
  }
});

function rawPost(base, path, headers) {
  return new Promise((resolve, reject) => {
    const req = http.request(`${base}${path}`, { method: "POST", headers }, (res) => {
      let text = "";
      res.on("data", (d) => (text += d));
      res.on("end", () => resolve({ status: res.statusCode, json: JSON.parse(text) }));
    });
    req.on("error", reject);
    req.end("{}");
  });
}

test("oversized body returns 413", async () => {
  const f = fakeFetch(200, {});
  const { server, base } = await start(f);
  try {
    const res = await rawPost(base, "/transcribe", { "Content-Length": String(27 * 1024 * 1024) });
    assert.equal(res.status, 413);
    assert.deepEqual(res.json, { error: "Audio is over 25 MB." });
    assert.equal(f.calls.length, 0);
  } finally {
    server.close();
  }
});

test("foreign Origin returns 403", async () => {
  const f = fakeFetch(200, {});
  const { server, base } = await start(f);
  try {
    const res = await rawPost(base, "/live", { Origin: "https://evil.example", "Content-Type": "text/plain" });
    assert.equal(res.status, 403);
    assert.deepEqual(res.json, { error: "Origin not allowed." });
    assert.equal(f.calls.length, 0);
  } finally {
    server.close();
  }
});

async function forwardedName(query, contentType) {
  const f = fakeFetch(200, { text: "x" });
  const { server, base } = await start(f);
  try {
    await fetch(`${base}/transcribe${query}`, { method: "POST", headers: { "Content-Type": contentType }, body: Buffer.from([1]) });
    return f.calls[0].init.body.get("file").name;
  } finally {
    server.close();
  }
}

test("name query sets the extension", async () => {
  assert.equal(await forwardedName("?name=memo.WAV", "application/octet-stream"), "audio.wav");
});

test("x-wav maps to wav", async () => {
  assert.equal(await forwardedName("", "audio/x-wav"), "audio.wav");
});
