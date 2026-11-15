export type PostType = "achievement" | "activity" | "announcement";

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
