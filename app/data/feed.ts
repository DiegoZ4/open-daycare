export type PostType =
  | "meal"
  | "nap"
  | "activity"
  | "achievement"
  | "mood"
  | "photo"
  | "announcement";

export interface Actor {
  name: string;
  initials: string;
  backgroundColor: string;
  textColor: string;
}

export interface Post {
  id: string;
  type: PostType;
  author: Actor;
  time: string;
  publishedByYou: boolean;
  audience: string;
  text: string;
  photoPlaceholder?: string;
  // Data URLs (máx 4) — posts created from the new-post modal. Posts without
  // photos keep rendering the dashed photoPlaceholder (see PostCard).
  photos?: string[];
  hearts: number;
  comments: number;
}

export interface Classroom {
  name: string;
  childrenCount: number;
  date: string;
}

export interface StaffUser {
  name: string;
  role: string;
  initials: string;
}

// The new-post modal's TIPO pills (pastel colors from the comp) — also the
// source for the feed badges (see PostCard's POST_TYPE_BADGE).
export const POST_TYPES: Array<{
  key: PostType;
  label: string;
  bg: string;
  text: string;
}> = [
  { key: "meal", label: "Comida", bg: "#F7E7A6", text: "#9A7B1E" },
  { key: "nap", label: "Siesta", bg: "#E7DCF6", text: "#7B5FC0" },
  { key: "activity", label: "Actividad", bg: "#C7E7F1", text: "#2E89A6" },
  { key: "achievement", label: "Logro", bg: "#CFEBD8", text: "#3E9B6C" },
  { key: "mood", label: "Ánimo", bg: "#F9D2DE", text: "#C56486" },
  { key: "photo", label: "Foto", bg: "#FBD8CC", text: "#D9684A" },
  { key: "announcement", label: "Anuncio", bg: "#CCD8F4", text: "#4E72C8" },
];

const mateo: Actor = {
  name: "Mateo",
  initials: "M",
  backgroundColor: "#A9D9E8",
  textColor: "#1F7A93",
};

export const classroom: Classroom = {
  name: "Sala Soles",
  childrenCount: 12,
  date: "martes 17 jun",
};

export const staffUser: StaffUser = {
  name: "Caro Giménez",
  role: "Maestra · Soles",
  initials: "C",
};

export const posts: Post[] = [
  {
    id: "first-potty-use",
    type: "achievement",
    author: mateo,
    time: "14:20",
    publishedByYou: true,
    audience: "familia de Mateo",
    text: "¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.",
    hearts: 3,
    comments: 1,
  },
  {
    id: "morning-tempera-painting",
    type: "activity",
    author: mateo,
    time: "09:40",
    publishedByYou: true,
    audience: "familia de Mateo",
    text: "Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón mezclando colores.",
    photoPlaceholder: "Foto · pintando con témperas",
    hearts: 5,
    comments: 2,
  },
  {
    id: "friday-park-trip",
    type: "announcement",
    author: {
      // Announcement posts render the megaphone SVG instead of initials (see PostCard).
      name: "Anuncio general",
      initials: "",
      backgroundColor: "#CCD8F4",
      textColor: "#4E72C8",
    },
    time: "07:50",
    publishedByYou: true,
    audience: "toda la sala",
    text: "El viernes salimos al parque por la mañana. Recuerden mandar gorra y una botellita de agua.",
    hearts: 8,
    comments: 0,
  },
];
