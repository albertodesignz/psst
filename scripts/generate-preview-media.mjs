import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require("playwright");
} catch {
  playwright = require(
    path.resolve(path.dirname(process.execPath), "../node_modules/playwright"),
  );
}
const browser = await playwright.chromium.launch({
  channel: "chrome",
  headless: true,
});
try {
  const page = await browser.newPage();
  const data = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 880;
    const ctx = canvas.getContext("2d");
    const audio = new AudioContext();
    await audio.resume();
    const destination = audio.createMediaStreamDestination();
    const gain = audio.createGain();
    gain.gain.value = 0.035;
    gain.connect(destination);
    const tone = audio.createOscillator();
    tone.type = "sine";
    tone.frequency.value = 220;
    tone.connect(gain);
    tone.start();
    const stream = canvas.captureStream(30);
    stream.addTrack(destination.stream.getAudioTracks()[0]);
    const mime = "video/mp4;codecs=avc1.42001E,mp4a.40.2";
    if (!MediaRecorder.isTypeSupported(mime))
      throw new Error("Browser cannot encode the local MP4 sample.");
    const recorder = new MediaRecorder(stream, {
      mimeType: mime,
      videoBitsPerSecond: 1400000,
    });
    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    const done = new Promise((resolve) => {
      recorder.onstop = resolve;
    });
    const started = performance.now();
    const draw = () => {
      const t = (performance.now() - started) / 1000;
      ctx.fillStyle = "#16151b";
      ctx.fillRect(0, 0, 640, 880);
      const grad = ctx.createLinearGradient(0, 0, 640, 880);
      grad.addColorStop(0, "#f9a8ee");
      grad.addColorStop(0.5, "#deeb4b");
      grad.addColorStop(1, "#78cec5");
      ctx.save();
      ctx.translate(320, 395);
      ctx.rotate(t * 0.12);
      for (let i = 0; i < 13; i++) {
        ctx.save();
        ctx.rotate(i * 0.21);
        const size = 340 - i * 20 + Math.sin(t * 1.1 + i) * 16;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
        ctx.restore();
      }
      ctx.restore();
      ctx.fillStyle = "#f7f3ec";
      ctx.font = "bold 96px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("PSST.", 320, 150);
      ctx.font = "14px monospace";
      ctx.fillText("A MOTION STUDY / AVUX CREATIVE", 320, 200);
      ctx.font = "13px monospace";
      ctx.fillStyle = "#d9d6ce";
      ctx.fillText("ORIGINAL LOCAL PREVIEW", 320, 710);
      ctx.fillText("VIDEO.JS 10 / TURN THE VOLUME UP", 320, 737);
      ctx.fillStyle = "#f0e963";
      ctx.fillRect(48, 790, 544 * Math.min(t / 16, 1), 3);
      ctx.textAlign = "left";
      ctx.font = "14px monospace";
      ctx.fillText(String(Math.floor(t)).padStart(2, "0") + " / 16", 48, 825);
      tone.frequency.setTargetAtTime(
        220 + Math.sin(t * 0.75) * 55,
        audio.currentTime,
        0.1,
      );
      if (t < 16) requestAnimationFrame(draw);
      else {
        recorder.stop();
        tone.stop();
        stream.getTracks().forEach((track) => track.stop());
        audio.close();
      }
    };
    draw();
    recorder.start();
    await done;
    const buffer = await new Blob(chunks, { type: "video/mp4" }).arrayBuffer();
    let binary = "";
    for (const b of new Uint8Array(buffer)) binary += String.fromCharCode(b);
    return btoa(binary);
  });
  fs.mkdirSync("artifacts/filmstrip-gallery/public/media", { recursive: true });
  const file = "artifacts/filmstrip-gallery/public/media/psst-motion-study.mp4";
  fs.writeFileSync(file, Buffer.from(data, "base64"));
  console.log(`${file}: ${fs.statSync(file).size} bytes`);
} finally {
  await browser.close();
}
