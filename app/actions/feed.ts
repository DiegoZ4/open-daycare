"use server";

import { revalidatePath } from "next/cache";
import { children, slugifyName } from "@/app/data/children";
import { posts, type Actor, type Post, type PostType } from "@/app/data/feed";

// Input the new-post modal sends after client-side validation. Photos arrive
// as data URLs (máx 4); childIds as ids of app/data/children.
export interface NewPostInput {
  childIds: string[];
  allRoom: boolean;
  type: PostType;
  text: string;
  photos: string[];
}

/** "Mateo Fernández" → "Mateo", as the feed's author names render. */
function firstName(name: string): string {
  return name.split(" ")[0] ?? name;
}

/** Current time as "HH:MM", like the feed's post times. */
function currentTimeHM(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/** "familia de Mateo" / "familias de Mateo y Sofía" / "familias de A, B y C". */
function audienceFor(firstNames: string[], allRoom: boolean): string {
  if (allRoom) return "toda la sala";
  if (firstNames.length === 1) return `familia de ${firstNames[0]}`;
  if (firstNames.length === 2) return `familias de ${firstNames[0]} y ${firstNames[1]}`;
  return `familias de ${firstNames.slice(0, -1).join(", ")} y ${
    firstNames[firstNames.length - 1]
  }`;
}

/** First available post id from the text slug, appending "-2", "-3"... */
function uniquePostId(text: string): string {
  const base = slugifyName(text).split("-").slice(0, 4).join("-") || "publicacion";
  const taken = new Set(posts.map((post) => post.id));
  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

// In-memory persistence (project decision): unshift to the exported mock
// array + revalidatePath. Data resets when the dev server restarts; a real
// DB replaces only this file, without touching the UI.
export async function createPost(input: NewPostInput): Promise<void> {
  const selected = children.filter((child) => input.childIds.includes(child.id));
  const allRoom = input.allRoom || selected.length === children.length;

  let author: Actor;
  if (allRoom || selected.length === 0) {
    // Same actor shape as the announcement post in the mock: the avatar
    // renders the megaphone SVG for this name (see PostCard).
    author = {
      name: "Anuncio general",
      initials: "",
      backgroundColor: "#CCD8F4",
      textColor: "#4E72C8",
    };
  } else {
    const child = selected[0];
    author = {
      name: firstName(child.name),
      initials: child.initials,
      backgroundColor: child.avatarBackgroundColor,
      textColor: child.avatarTextColor,
    };
  }

  const photos = input.photos.slice(0, 4);

  const post: Post = {
    id: uniquePostId(input.text),
    type: input.type,
    author,
    time: currentTimeHM(),
    publishedByYou: true,
    audience: audienceFor(selected.map((child) => firstName(child.name)), allRoom),
    text: input.text.trim(),
    photos: photos.length > 0 ? photos : undefined,
    hearts: 0,
    comments: 0,
  };

  posts.unshift(post);
  revalidatePath("/");
}
