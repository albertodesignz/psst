import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch {
  ({ chromium } = require(path.resolve(path.dirname(process.execPath), "../node_modules/playwright")));
}
const base = process.env.PSST_URL ?? "http://127.0.0.1:5173/";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const p = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto(base);
  await p.waitForFunction(() => document.querySelector("video")?.duration > 15);
  const before = await p.locator("h1").textContent();
  const box = await p.locator(".carousel-stage").boundingBox();
  await p.mouse.move(650, box.y + box.height / 2 - 100);
  await p.mouse.down();
  await p.mouse.move(240, box.y + box.height / 2 - 100, { steps: 12 });
  await p.mouse.up();
  await p.waitForTimeout(800);
  if ((await p.locator("h1").textContent()) === before)
    throw new Error("Drag did not navigate");
  console.log("PASS mouse drag navigates and snaps");
  const info = await p.evaluate(() => ({
    width: innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  if (info.document > info.width) throw new Error("Horizontal overflow");
  await p.locator("video").evaluate((v) => (v.currentTime = v.duration - 0.5));
  await p.getByTestId("button-header-play-toggle").click();
  await p.waitForFunction(() => document.querySelector("video").ended);
  if (
    (await p
      .getByTestId("button-header-play-toggle")
      .getAttribute("aria-label")) !== "Play"
  )
    throw new Error("End state not paused");
  await p.getByTestId("button-header-play-toggle").click();
  await p.waitForFunction(
    () =>
      document.querySelector("video").currentTime > 0.1 &&
      !document.querySelector("video").ended,
  );
  console.log("PASS end-of-video returns Play and replays");
  await p.getByTestId("button-header-play-toggle").click();
  for (const size of [
    { width: 320, height: 568 },
    { width: 844, height: 390 },
  ]) {
    await p.setViewportSize(size);
    if (
      await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)
    )
      throw new Error("Overflow " + JSON.stringify(size));
    console.log("PASS responsive layout " + JSON.stringify(size));
  }
  const m = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await m.goto(base);
  await m.waitForFunction(() => document.querySelector("video")?.duration > 15);
  const old = await m.locator("h1").textContent();
  const cdp = await m.context().newCDPSession(m);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 310, y: 280 }],
  });
  for (let x = 300; x >= 70; x -= 20)
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y: 282 }],
    });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await m.waitForTimeout(800);
  if ((await m.locator("h1").textContent()) === old)
    throw new Error("Touch swipe did not navigate");
  console.log("PASS touch swipe navigates");
} finally {
  await browser.close();
}
