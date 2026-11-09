export type Track = {
  src: string;
  artist: string;
  title: string;
  album: string;
  year: string;
  scene: string;
  wave: string;
  text: {
    muted: string;
    secondary: string;
    primary: string;
    line: string;
    track: string;
  };
};

export const TRACKS: Track[] = [
  {
    src: "/images/filmstrip3d-rider.png",
    artist: "Mara Venn",
    title: "Night Rider",
    album: "After the Last Train",
    year: "2019",
    scene: "#4e3027",
    wave: "#fff04a",
    text: {
      muted: "#b7a69c",
      secondary: "#d5c6bb",
      primary: "#fff7ef",
      line: "rgba(255,247,239,.22)",
      track: "rgba(255,247,239,.18)",
    },
  },
  {
    src: "/images/elektrosthal.png",
    artist: "Elektrosthal",
    title: "Borrowed Numbers",
    album: "Red Static",
    year: "2024",
    scene: "#86452f",
    wave: "#00f5ff",
    text: {
      muted: "#f0c6ae",
      secondary: "#ffe0cc",
      primary: "#fff8ef",
      line: "rgba(255,248,239,.24)",
      track: "rgba(255,248,239,.18)",
    },
  },
  {
    src: "/images/filmstrip3d-shadows.png",
    artist: "The Soft Hours",
    title: "Half Past Four",
    album: "Rooms With No View",
    year: "2021",
    scene: "#35454e",
    wave: "#ff4f81",
    text: {
      muted: "#b6c7d0",
      secondary: "#d6e4eb",
      primary: "#f5fbff",
      line: "rgba(245,251,255,.24)",
      track: "rgba(245,251,255,.18)",
    },
  },
  {
    src: "/images/fast.png",
    artist: "FAST",
    title: "No Slow Return",
    album: "Velocity Studies",
    year: "2025",
    scene: "#895633",
    wave: "#b6ff00",
    text: {
      muted: "#efc4a9",
      secondary: "#ffdfc9",
      primary: "#fff8ee",
      line: "rgba(255,248,238,.24)",
      track: "rgba(255,248,238,.18)",
    },
  },
  {
    src: "/images/filmstrip3d-mist.png",
    artist: "Juniper Static",
    title: "Two in the Fog",
    album: "Still / Moving",
    year: "2020",
    scene: "#3d5360",
    wave: "#ff9e3d",
    text: {
      muted: "#b8c9d1",
      secondary: "#d7e6ec",
      primary: "#f5fbff",
      line: "rgba(245,251,255,.24)",
      track: "rgba(245,251,255,.18)",
    },
  },
  {
    src: "/images/mizzsterious.png",
    artist: "Mizzsterious",
    title: "Color Theory",
    album: "Mizzterious Forms",
    year: "2024",
    scene: "#e7c21f",
    wave: "#f95dff",
    text: {
      muted: "#5a4609",
      secondary: "#3d2d03",
      primary: "#171108",
      line: "rgba(23,17,8,.28)",
      track: "rgba(23,17,8,.22)",
    },
  },
  {
    src: "/images/filmstrip3d-rain.png",
    artist: "Low Atlas",
    title: "Wet Glass",
    album: "Weather Systems",
    year: "2022",
    scene: "#3d514d",
    wave: "#73ffbd",
    text: {
      muted: "#b4c9be",
      secondary: "#d4e7dc",
      primary: "#f4fff8",
      line: "rgba(244,255,248,.24)",
      track: "rgba(244,255,248,.18)",
    },
  },
  {
    src: "/images/filmstrip3d-dancer.png",
    artist: "Vera Bloom",
    title: "Ghost Step",
    album: "A Body in Light",
    year: "2018",
    scene: "#51405d",
    wave: "#a78bfa",
    text: {
      muted: "#c8b9d4",
      secondary: "#e0d5e8",
      primary: "#fbf6ff",
      line: "rgba(251,246,255,.24)",
      track: "rgba(251,246,255,.18)",
    },
  },
  {
    src: "/images/filmstrip3d-stairs.png",
    artist: "Northbound",
    title: "Descent",
    album: "The Long Way Home",
    year: "2023",
    scene: "#315c58",
    wave: "#ff5f6d",
    text: {
      muted: "#acd0ce",
      secondary: "#cfe9e5",
      primary: "#f0fffc",
      line: "rgba(240,255,252,.24)",
      track: "rgba(240,255,252,.18)",
    },
  },
];
