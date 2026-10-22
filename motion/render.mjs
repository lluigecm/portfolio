/*
 * Grava motion/index.html em vídeo. Abre a página no Chromium (Playwright),
 * desenha cada quadro com motion.seek(t), tira um print e entrega ao ffmpeg;
 * a trilha sai da mesma página (motion.audio) e entra no MP4 no fim.
 *
 *   npm run motion                      PT e EN, 1920×1080 a 60 fps
 *   npm run motion -- --lang en         só um idioma
 *   npm run motion -- --url meusite.dev endereço do site no quadro final
 *   npm run motion -- --stills 3.5,14   só imagens daqueles instantes (para conferir)
 *
 * Precisa do ffmpeg no PATH. CHROMIUM_PATH aponta outro Chromium, se o do
 * Playwright não estiver instalado.
 */
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { cpus } from "node:os";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));

function option(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const langs = option("lang", "all") === "all" ? ["pt", "en"] : [option("lang")];
const fps = Number(option("fps", 60));
const workers = Number(option("workers", Math.min(4, cpus().length)));
const outDir = option("out", join(ROOT, "out"));
const site = option("url", "");
const stills = option("stills", "");

/* Servidor local: a página carrega as fontes por caminho relativo. */
const TYPES = { ".html": "text/html; charset=utf-8", ".woff2": "font/woff2", ".js": "text/javascript" };
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
  try {
    const body = await readFile(join(ROOT, path || "index.html"));
    res.writeHead(200, { "content-type": TYPES[extname(path)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const base = `http://127.0.0.1:${server.address().port}/index.html`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
await mkdir(outDir, { recursive: true });

async function open(lang) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const query = new URLSearchParams({ render: "1", lang, ...(site ? { url: site } : {}) });
  await page.goto(`${base}?${query}`);
  await page.evaluate(() => window.motion.ready);
  return page;
}

function run(cmd, args, input) {
  return new Promise((ok, fail) => {
    const child = spawn(cmd, args, { stdio: [input ? "pipe" : "ignore", "ignore", "pipe"] });
    let log = "";
    child.stderr.on("data", (d) => (log += d));
    child.on("error", fail);
    child.on("close", (code) => (code === 0 ? ok() : fail(new Error(`${cmd} saiu com ${code}\n${log.slice(-2000)}`))));
    if (input) input(child.stdin);
  });
}

function write(stream, chunk) {
  return stream.write(chunk) ? Promise.resolve() : new Promise((ok) => stream.once("drain", ok));
}

function wav(base64, rate) {
  const pcm = Buffer.from(base64, "base64");
  const head = Buffer.alloc(44);
  head.write("RIFF", 0);
  head.writeUInt32LE(36 + pcm.length, 4);
  head.write("WAVEfmt ", 8);
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20);
  head.writeUInt16LE(1, 22);
  head.writeUInt32LE(rate, 24);
  head.writeUInt32LE(rate * 2, 28);
  head.writeUInt16LE(2, 32);
  head.writeUInt16LE(16, 34);
  head.write("data", 36);
  head.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([head, pcm]);
}

/* Um trecho de quadros [from, to) num processo do ffmpeg. */
async function segment(lang, from, to, file, progress) {
  const page = await open(lang);
  /* O print pelo CDP com optimizeForSpeed sai igual ao do Playwright, na metade do tempo. */
  const cdp = await page.context().newCDPSession(page);
  await run(
    "ffmpeg",
    ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "png", "-i", "-",
      "-c:v", "libx264", "-preset", "medium", "-crf", "15", "-tune", "animation", "-pix_fmt", "yuv420p", "-r", String(fps), file],
    async (stdin) => {
      for (let i = from; i < to; i++) {
        await page.evaluate((t) => window.motion.seek(t), i / fps);
        const { data } = await cdp.send("Page.captureScreenshot", { format: "png", optimizeForSpeed: true });
        await write(stdin, Buffer.from(data, "base64"));
        progress();
      }
      stdin.end();
    },
  );
  await page.close();
}

try {
  if (stills) {
    for (const lang of langs) {
      const page = await open(lang);
      for (const t of stills.split(",").map(Number)) {
        await page.evaluate((s) => window.motion.seek(s), t);
        const file = join(outDir, `still-${lang}-${t.toFixed(2)}.png`);
        await page.screenshot({ path: file });
        console.log(file);
      }
      await page.close();
    }
  } else {
    for (const lang of langs) {
      const started = Date.now();
      const probe = await open(lang);
      const duration = await probe.evaluate(() => window.motion.duration);
      const rate = 48000;
      const audio = join(outDir, `audio-${lang}.wav`);
      await writeFile(audio, wav(await probe.evaluate((r) => window.motion.audio(r), rate), rate));
      await probe.close();

      const frames = Math.round(duration * fps);
      const size = Math.ceil(frames / workers);
      let done = 0;
      const progress = () => {
        done++;
        if (done % 60 === 0 || done === frames) process.stdout.write(`\r${lang}: ${done}/${frames} quadros`);
      };
      const parts = [];
      for (let w = 0; w < workers; w++) {
        const from = w * size, to = Math.min(frames, from + size);
        if (from < to) parts.push({ from, to, file: join(outDir, `part-${lang}-${w}.mp4`) });
      }
      await Promise.all(parts.map((p) => segment(lang, p.from, p.to, p.file, progress)));
      process.stdout.write("\n");

      const list = join(outDir, `parts-${lang}.txt`);
      await writeFile(list, parts.map((p) => `file '${p.file.replace(/'/g, "'\\''")}'`).join("\n"));
      const out = join(outDir, `luige-motion-${lang}.mp4`);
      await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-i", audio,
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out]);
      await Promise.all([list, audio, ...parts.map((p) => p.file)].map((f) => rm(f, { force: true })));
      console.log(`${out} (${((Date.now() - started) / 1000).toFixed(0)} s)`);
    }
  }
} finally {
  await browser.close();
  server.close();
}
