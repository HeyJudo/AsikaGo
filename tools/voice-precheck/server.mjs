import http from "node:http";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import path from "node:path";

const ORIGIN = "http://localhost:5173";
const OPENAI = "https://api.openai.com/v1";
const EXTENSIONS = ["flac", "mp3", "mp4", "mpeg", "mpga", "m4a", "ogg", "wav", "webm"];
const SUBTYPES = { "x-wav": "wav", wave: "wav", "vnd.wave": "wav", "x-m4a": "m4a", mpeg: "mp3" };

export function buildInstructions(md) {
  const start = md.indexOf("## 1.");
  const end = md.indexOf("## 3.");
  return md.slice(start, end);
}

export function readApiKey(env, secretsListOutput) {
  if (env.OPENAI_API_KEY) return env.OPENAI_API_KEY;
  const match = /^OpenAI:ApiKey = (.+)$/m.exec(secretsListOutput());
  if (match) return match[1].trim();
  throw new Error(
    'No OpenAI key. Run: dotnet user-secrets set "OpenAI:ApiKey" "<key>" --project src/AsikaGo.Api (from backend/)',
  );
}

const MAX_BODY = 26 * 1024 * 1024;

class TooLarge extends Error {}

async function readBody(req) {
  if (Number(req.headers["content-length"]) > MAX_BODY) throw new TooLarge();
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new TooLarge();
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// First bytes identify the container; browsers often send a wrong or generic Content-Type.
function sniff(b) {
  const at = (i, text) => b.subarray(i, i + text.length).toString("latin1") === text;
  if (at(0, "OggS")) return "ogg";
  if (b.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) return "webm";
  if (at(0, "RIFF") && at(8, "WAVE")) return "wav";
  if (at(0, "fLaC")) return "flac";
  if (at(4, "ftyp")) return "mp4";
  if (at(0, "ID3") || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0)) return "mp3";
  return undefined;
}

function fileName(contentType, name, bytes) {
  const sniffed = sniff(bytes);
  if (sniffed) return `audio.${sniffed}`;
  const named = /\.([a-z0-9]+)$/i.exec(name ?? "")?.[1].toLowerCase();
  if (EXTENSIONS.includes(named)) return `audio.${named}`;
  const subtype = (contentType ?? "").split(";")[0].split("/")[1]?.trim();
  const ext = SUBTYPES[subtype] ?? subtype;
  return `audio.${EXTENSIONS.includes(ext) ? ext : "webm"}`;
}

export function createServer({ apiKey, instructions, fetch }) {
  const auth = { Authorization: `Bearer ${apiKey}` };

  async function live(body) {
    const { sdp } = JSON.parse(body.toString());
    const res = await fetch(`${OPENAI}/live/sessions`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        session: { model: "gpt-live-1", instructions },
        transport: { type: "webrtc", sdp },
      }),
    });
    const data = await res.json();
    if (!res.ok) return [502, { error: data.error?.message ?? `OpenAI returned ${res.status}` }];
    return [200, { sdp: data.transport.sdp }];
  }

  async function transcribe(body, contentType, name) {
    const form = new FormData();
    form.append("model", "gpt-transcribe");
    form.append("file", new Blob([body], { type: contentType ?? "audio/webm" }), fileName(contentType, name, body));
    const res = await fetch(`${OPENAI}/audio/transcriptions`, { method: "POST", headers: auth, body: form });
    const data = await res.json();
    if (!res.ok) return [502, { error: data.error?.message ?? `OpenAI returned ${res.status}` }];
    return [200, { text: data.text, seconds: data.usage?.seconds ?? null }];
  }

  return http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", ORIGIN);
    const origin = req.headers.origin;
    if (origin !== undefined && origin !== ORIGIN) {
      res.writeHead(403, { "Content-Type": "application/json", Connection: "close" });
      return res.end(JSON.stringify({ error: "Origin not allowed." }));
    }
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      return res.end();
    }
    let status = 404;
    let json = { error: "Not found" };
    try {
      const url = new URL(req.url, "http://localhost");
      if (req.method === "POST" && (url.pathname === "/live" || url.pathname === "/transcribe")) {
        const body = await readBody(req);
        [status, json] =
          url.pathname === "/live"
            ? await live(body)
            : await transcribe(body, req.headers["content-type"], url.searchParams.get("name"));
      }
    } catch (err) {
      status = err instanceof TooLarge ? 413 : 502;
      json = { error: err instanceof TooLarge ? "Audio is over 25 MB." : err.message };
    }
    res.writeHead(status, { "Content-Type": "application/json", ...(status === 413 && { Connection: "close" }) });
    res.end(JSON.stringify(json));
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const repoRoot = path.resolve(import.meta.dirname, "../..");
  const apiKey = readApiKey(process.env, () =>
    execFileSync("dotnet", ["user-secrets", "list", "--project", path.join(repoRoot, "backend/src/AsikaGo.Api")], {
      encoding: "utf8",
    }),
  );
  const instructions = buildInstructions(readFileSync(path.join(repoRoot, "docs/qa/ai-qa-cases.md"), "utf8"));
  createServer({ apiKey, instructions, fetch }).listen(4000, "127.0.0.1", () =>
    console.log("Voice server ready on http://127.0.0.1:4000"),
  );
}
