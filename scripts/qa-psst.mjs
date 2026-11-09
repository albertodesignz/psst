import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({ chromium } = require(
    path.resolve(path.dirname(process.execPath), "../node_modules/playwright"),
  ));
}
const base = process.env.PSST_URL ?? "http://127.0.0.1:5173/";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
const pass = (name) => {
  results.push({ name, status: "passed" });
  console.log(`PASS ${name}`);
};
fs.mkdirSync(".local/qa", { recursive: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base);
  await page.waitForFunction(
    () => document.querySelector("video")?.duration > 15,
  );
  assert.equal(await page.locator("video").count(), 1);
  await page.screenshot({ path: ".local/qa/psst-desktop.png", fullPage: true });
  pass("Local media loads and exactly one Video.js media element is present");
  await page.getByTestId("button-header-play-toggle").click();
  await page.waitForFunction(
    () =>
      document.querySelector("video").currentTime > 0.5 &&
      !document.querySelector("video").paused,
  );
  await page.getByTestId("button-header-play-toggle").click();
  const pausedTime = await page
    .locator("video")
    .evaluate((video) => video.currentTime);
  await page.waitForTimeout(300);
  assert.ok(
    Math.abs(
      (await page.locator("video").evaluate((video) => video.currentTime)) -
        pausedTime,
    ) < 0.1,
  );
  pass("Play advances real media; Pause stops its clock");
  const title = await page.locator("h1").textContent();
  await page.getByRole("slider", { name: "Seek video" }).focus();
  await page.keyboard.press("Home");
  for (let i = 0; i < 30; i++) await page.keyboard.press("ArrowRight");
  await page.waitForFunction(
    () => document.querySelector("video").currentTime > 2,
  );
  assert.equal(await page.locator("h1").textContent(), title);
  pass("Keyboard seeking changes media time without navigating covers");
  await page.getByRole("slider", { name: "Volume", exact: true }).focus();
  await page.keyboard.press("Home");
  assert.equal(
    await page.locator("video").evaluate((video) => video.volume),
    0,
  );
  await page.getByRole("button", { name: "Unmute", exact: true }).click();
  assert.equal(
    await page.locator("video").evaluate((video) => video.muted),
    false,
  );
  assert.ok(
    (await page.locator("video").evaluate((video) => video.volume)) > 0,
  );
  await page.getByRole("slider", { name: "Volume", exact: true }).focus();
  await page.keyboard.press("End");
  for (let i = 0; i < 10; i++) await page.keyboard.press("ArrowLeft");
  assert.ok(
    Math.abs(
      (await page.locator("video").evaluate((video) => video.volume)) - 0.5,
    ) < 0.02,
  );
  await page.getByRole("button", { name: "Mute", exact: true }).click();
  assert.equal(
    await page.locator("video").evaluate((video) => video.muted),
    true,
  );
  await page.getByRole("button", { name: "Unmute", exact: true }).click();
  pass("Zero volume remains silent; volume and mute/unmute control media");
  await page.getByRole("button", { name: "Enter fullscreen" }).click();
  await page.waitForFunction(() => !!document.fullscreenElement);
  await page.getByRole("button", { name: "Exit fullscreen" }).click();
  await page.waitForFunction(() => !document.fullscreenElement);
  pass("Enter and exit fullscreen include the media controls");
  await page.getByTestId("button-header-play-toggle").click();
  await page.getByTestId("button-header-next-track").click();
  await page.waitForFunction(
    () => document.querySelector("video")?.readyState >= 1,
  );
  assert.notEqual(await page.locator("h1").textContent(), title);
  assert.equal(
    await page.locator("video").evaluate((video) => video.paused),
    true,
  );
  assert.ok(
    (await page.locator("video").evaluate((video) => video.currentTime)) < 0.2,
  );
  for (let i = 0; i < 12; i++)
    await page.getByTestId("button-header-next-track").click();
  assert.equal(await page.locator("video").count(), 1);
  pass("Changing covers stops and resets media, including repeated navigation");
  await page.getByRole("button", { name: "Open menu" }).click();
  assert.equal(await page.locator("#gallery-info").isVisible(), true);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#gallery-info").count(), 0);
  assert.equal(
    await page
      .getByRole("button", { name: "Open menu" })
      .evaluate((button) => document.activeElement === button),
    true,
  );
  pass("Information panel closes with Escape and returns focus");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByTestId("button-header-play-toggle").click();
  assert.equal(
    await page
      .locator(".wave span")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  await page.locator(".carousel-stage").focus();
  await page.keyboard.press("k");
  assert.equal(
    await page.locator("video").evaluate((video) => video.paused),
    true,
  );
  pass("Reduced motion stops decorative animation; gallery keyboard works");
  assert.deepEqual(errors, []);
  pass("No uncaught browser errors on desktop");

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  await mobile.goto(base);
  await mobile.waitForFunction(
    () => document.querySelector("video")?.duration > 15,
  );
  assert.ok(
    await mobile.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await mobile.getByTestId("button-header-play-toggle").tap();
  await mobile.waitForFunction(
    () => document.querySelector("video").currentTime > 0.2,
  );
  await mobile.getByTestId("button-header-next-track").tap();
  await mobile.screenshot({
    path: ".local/qa/psst-mobile.png",
    fullPage: true,
  });
  pass("390px mobile viewport plays/navigates without horizontal overflow");

  const failure = await browser.newPage();
  await failure.route("**/media/psst-motion-study.mp4", (route) =>
    route.abort(),
  );
  await failure.goto(base);
  await failure.getByRole("alert").waitFor();
  assert.equal(
    await failure.getByTestId("button-header-play-toggle").isDisabled(),
    true,
  );
  await failure.unroute("**/media/psst-motion-study.mp4");
  await failure.getByRole("button", { name: "Retry video" }).click();
  await failure.waitForFunction(
    () => document.querySelector("video")?.duration > 15,
  );
  await failure.getByTestId("button-header-play-toggle").click();
  await failure.waitForFunction(
    () => document.querySelector("video").currentTime > 0.2,
  );
  pass("Failed media shows error; Retry restores a playable video");
} catch (error) {
  results.push({
    name: "Suite stopped",
    status: "failed",
    detail: error.stack,
  });
  throw error;
} finally {
  fs.writeFileSync(".local/qa/results.json", JSON.stringify(results, null, 2));
  await browser.close();
}
