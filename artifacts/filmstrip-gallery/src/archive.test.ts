import assert from "node:assert/strict";
import { parseArchiveTrack } from "./archive.ts";
const data = {
  metadata: {
    title: "Example VHS commercial",
    creator: ["Example uploader"],
    year: "1994",
  },
  files: [{ name: "video name.mp4", format: "h.264 IA", size: "1234" }],
};
const track = parseArchiveTrack("valid-id", data);
assert.equal(track?.artist, "Example uploader");
assert.equal(
  track?.src,
  "https://archive.org/download/valid-id/video%20name.mp4",
);
assert.equal(track?.rights, "Rights not specified; see Archive item");
assert.equal(track?.licenseUrl, undefined);
assert.equal(parseArchiveTrack("../invalid", data), null);
assert.equal(
  parseArchiveTrack("id", {
    ...data,
    metadata: {
      ...data.metadata,
      licenseurl: "https://creativecommons.org.evil.test/licenses/by/4.0/",
    },
  })?.licenseUrl,
  undefined,
);
assert.equal(
  parseArchiveTrack("id", {
    ...data,
    metadata: {
      ...data.metadata,
      licenseurl: "https://creativecommons.org/licenses/by-nc/4.0/",
    },
  })?.licenseUrl,
  "https://creativecommons.org/licenses/by-nc/4.0/",
);
assert.equal(
  parseArchiveTrack("id", {
    ...data,
    metadata: { ...data.metadata, "access-restricted-item": "true" },
  }),
  null,
);
assert.equal(
  parseArchiveTrack("id", {
    ...data,
    files: [{ ...data.files[0], private: true }],
  }),
  null,
);
assert.equal(
  parseArchiveTrack("id", {
    ...data,
    files: [{ ...data.files[0], name: "video.exe" }],
  }),
  null,
);
assert.equal(parseArchiveTrack("id", { ...data, files: [null] }), null);
assert.equal(
  parseArchiveTrack("id", {
    ...data,
    files: [{ ...data.files[0], name: "../file.mp4" }],
  }),
  null,
);
assert.ok(
  parseArchiveTrack("id", {
    ...data,
    files: [{ ...data.files[0], size: "2000000000" }],
  }),
);
assert.equal(
  parseArchiveTrack("id", {
    ...data,
    metadata: { ...data.metadata, rights: "Copyright retained by owner" },
  })?.rights,
  "Copyright retained by owner",
);
console.log("14 VHS Archive parser checks passed");
