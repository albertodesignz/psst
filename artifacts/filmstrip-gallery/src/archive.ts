export interface ArchiveTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: string | number;
  src: string;
  poster: string;
  sourceUrl?: string;
  licenseUrl?: string;
  rights?: string;
}

const QUERY =
  'collection:vhsvault AND subject:"commercials" AND mediatype:movies AND collection:vhscommercials AND NOT access-restricted-item:true';
const API = "https://archive.org";
const text = (value: unknown, fallback: string) => {
  const item = Array.isArray(value) ? value[0] : value;
  return typeof item === "string" && item.trim() ? item.trim() : fallback;
};

export function parseArchiveTrack(id: string, data: any): ArchiveTrack | null {
  if (
    !/^[a-zA-Z0-9_.-]+$/.test(id) ||
    !data?.metadata ||
    !Array.isArray(data.files)
  )
    return null;
  const m = data.metadata;
  if ([true, "true", "1", 1].includes(m["access-restricted-item"]) || m.is_dark)
    return null;
  const license = text(m.licenseurl, "");
  // Availability is not a reuse license. Keep the user's exact collection,
  // surface declared rights and do not exclude publicly streamable unlicensed items.
  const licenseUrl =
    /^https?:\/\/(?:www\.)?creativecommons\.org\/(?:licenses|publicdomain)\/[a-z0-9./-]+$/i.test(
      license,
    )
      ? license.replace(/^http:/, "https:")
      : undefined;
  const files = data.files.filter(
    (f: any) =>
      f &&
      typeof f.name === "string" &&
      !f.name
        .split("/")
        .some((part: string) => part === ".." || part === ".") &&
      /\.mp4$/i.test(f.name) &&
      /(?:h\.264|mpeg4|512kb mpeg4)/i.test(f.format ?? "") &&
      !f.private &&
      Number(f.size) > 0,
  );
  files.sort((a: any, b: any) => {
    const rank = (f: any) =>
      (/\b(?:trailer|preview|sample)\b/i.test(f.name) ? 10 : 0) +
      (/h\.264/i.test(f.format) ? 0 : 1);
    return rank(a) - rank(b) || Number(b.size) - Number(a.size);
  });
  const file = files[0];
  if (!file) return null;
  return {
    id,
    title: text(m.title, id),
    artist: text(m.creator, "Creator not listed"),
    album: "VHS Vault · Commercials",
    year: text(m.year, text(m.date, "")).slice(0, 4),
    src: `${API}/download/${encodeURIComponent(id)}/${file.name.split("/").map(encodeURIComponent).join("/")}`,
    poster: `${API}/services/img/${encodeURIComponent(id)}`,
    sourceUrl: `${API}/details/${encodeURIComponent(id)}`,
    licenseUrl,
    rights: licenseUrl
      ? "Uploader-declared license"
      : text(m.rights, "Rights not specified; see Archive item"),
  };
}

async function json(url: string, signal: AbortSignal) {
  const response = await fetch(url, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(12000)]),
    credentials: "omit",
  });
  if (!response.ok)
    throw new Error(`Archive request failed (${response.status}).`);
  const data = await response.json();
  if (data?.error)
    throw new Error("Archive search is unavailable. Try again shortly.");
  return data;
}

function search(page: number, signal: AbortSignal) {
  const params = new URLSearchParams({
    q: QUERY,
    output: "json",
    rows: "25",
    page: String(page),
    "fl[]": "identifier",
    "sort[]": "identifier asc",
  });
  return json(`${API}/advancedsearch.php?${params}`, signal);
}

// A metadata probe avoids replacing the current track with an obviously unavailable file.
function playable(src: string, signal: AbortSignal): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const probe = document.createElement("video");
    let timer: ReturnType<typeof setTimeout>;
    const cleanup = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      probe.onloadedmetadata = null;
      probe.onerror = null;
      probe.removeAttribute("src");
      probe.load();
    };
    const done = (ok: boolean) => {
      cleanup();
      resolve(ok);
    };
    const abort = () => {
      cleanup();
      reject(new DOMException("Cancelled", "AbortError"));
    };
    if (signal.aborted) {
      abort();
      return;
    }
    signal.addEventListener("abort", abort, { once: true });
    probe.preload = "metadata";
    probe.onloadedmetadata = () =>
      done(probe.videoWidth > 0 && Number.isFinite(probe.duration));
    probe.onerror = () => done(false);
    timer = setTimeout(() => done(false), 10000);
    probe.src = src;
    probe.load();
  });
}

export async function randomArchiveTrack(
  seen: Set<string>,
  signal: AbortSignal,
): Promise<ArchiveTrack> {
  const deadline = AbortSignal.any([signal, AbortSignal.timeout(60000)]);
  const first = await search(1, deadline);
  const count = Number(first?.response?.numFound);
  if (!Number.isFinite(count) || count < 1)
    throw new Error("No eligible Archive videos are available right now.");
  // Archive search exposes a bounded result window. Sample that window, not a fixed playlist.
  const pages = Math.ceil(Math.min(count, 10000) / 25);
  const page = 1 + Math.floor(Math.random() * pages);
  const result = page === 1 ? first : await search(page, deadline);
  const candidates = [...(result?.response?.docs ?? [])];
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  let probes = 0;
  for (const candidate of candidates) {
    if (probes >= 5) break;
    const id = candidate?.identifier;
    if (typeof id !== "string" || seen.has(id) || !/^[a-zA-Z0-9_.-]+$/.test(id))
      continue;
    try {
      const data = await json(
        `${API}/metadata/${encodeURIComponent(id)}`,
        deadline,
      );
      const track = parseArchiveTrack(id, data);
      if (track) {
        probes++;
        if (await playable(track.src, deadline)) return track;
      }
    } catch (error) {
      if (deadline.aborted) throw error;
    }
  }
  throw new Error("Could not find a playable VHS commercial. Try Next again.");
}
