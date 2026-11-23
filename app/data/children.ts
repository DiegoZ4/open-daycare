import { computeAgeES, formatDateES } from "@/app/lib/date";

export interface Parent {
  name: string;
  initials: string;
  // Parent avatars render white initials over this color (see profile page).
  avatarBackgroundColor: string;
  relationship: string;
  status: "active" | "pending";
  statusLabel: string;
}

export interface Child {
  id: string;
  name: string;
  initials: string;
  avatarBackgroundColor: string;
  avatarTextColor: string;
  age: string; // "3 años" | "8 meses" — derived from birthDateISO on create/edit
  sala: string; // "Soles" for the 8 seed children
  parentsSummary: string;
  allergies: string[]; // replaces allergyTag ("Maní" → chip "MANÍ")
  needsParentLink?: boolean;
  birthDate: string; // "12 mar 2022" (display, derived from birthDateISO)
  birthDateISO: string; // "2022-03-12" (source for the mask and the age)
  enrollment: string;
  medicalNotes?: string;
  parents: Parent[];
}

export interface ClassroomSummary {
  name: string;
  childrenCount: number;
}

// Hardcoded classroom options for the add-child modal (Soles is the comp's).
export const classrooms = ["Soles", "Lunas", "Estrellas"] as const;

// The list shows "SALA SOLES · N niños"; the Feed header mock says "12 niños"
// (as in the original comps). This discrepancy goes away once there is a DB.
export const classroomSummary: ClassroomSummary = {
  name: "Sala Soles",
  childrenCount: 8,
};

// Avatar palette pairs from the comps (background / text), cycled by index
// for children created through the modal.
const AVATAR_PALETTE = [
  { background: "#A9D9E8", text: "#1F7A93" },
  { background: "#F4B8CC", text: "#C44A7A" },
  { background: "#B9DEC4", text: "#3E8B62" },
  { background: "#F4DC8E", text: "#9A7B1E" },
  { background: "#C9B6E8", text: "#7B5FC0" },
] as const;

export function avatarForIndex(index: number): { background: string; text: string } {
  const pair = AVATAR_PALETTE[Math.abs(index) % AVATAR_PALETTE.length];
  return { background: pair.background, text: pair.text };
}

/** "Mateo Fernández" → "mateo-fernandez" (accents stripped). */
export function slugifyName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** First available id for a name, appending "-2", "-3"... on collision. */
export function uniqueChildId(name: string, existing: Child[]): string {
  const base = slugifyName(name) || "nino";
  const taken = new Set(existing.map((child) => child.id));
  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

/** Single initial, as the comps render it ("Mateo Fernández" → "M"). */
export function initialsFromName(name: string): string {
  const first = name.trim().charAt(0).toUpperCase();
  return first || "N";
}

export function parentsSummaryFor(count: number): string {
  if (count === 0) return "sin padres vinculados";
  if (count === 1) return "1 padre vinculado";
  return `${count} padres vinculados`;
}

/** "Maní, Lactosa" → ["Maní", "Lactosa"] (trim + drop empties). */
export function parseAllergiesText(text: string): string[] {
  return text
    .split(",")
    .map((allergy) => allergy.trim())
    .filter(Boolean);
}

/** Builds the derived fields for a child from the modal input. */
export function deriveChildFields(input: {
  name: string;
  birthDateISO: string;
  sala: string;
  allergies: string[];
}): Pick<Child, "id" | "initials" | "avatarBackgroundColor" | "avatarTextColor" | "age" | "parentsSummary" | "birthDate"> {
  return {
    id: uniqueChildId(input.name, children),
    initials: initialsFromName(input.name),
    avatarBackgroundColor: avatarForIndex(children.length).background,
    avatarTextColor: avatarForIndex(children.length).text,
    age: computeAgeES(input.birthDateISO),
    parentsSummary: parentsSummaryFor(0),
    birthDate: formatDateES(input.birthDateISO),
  };
}

// Card meta renders as "{age} · {parentsSummary}".
// Right slot: first allergy → allergy chip, needsParentLink → "VINCULAR" chip,
// otherwise a chevron (see ChildCard).
// parents count matches parentsSummary (2/1/0); medicalNotes renders in the
// profile's "Alergias y notas" box. Profile data not defined by the comps
// (only Mateo's is) was invented as plausible mock. The stored `age` strings
// keep the comps' original values; ages are recomputed from birthDateISO
// only on create/edit.
export const children: Child[] = [
  {
    id: "mateo-fernandez",
    name: "Mateo Fernández",
    initials: "M",
    avatarBackgroundColor: "#A9D9E8",
    avatarTextColor: "#1F7A93",
    age: "3 años",
    sala: "Soles",
    parentsSummary: "2 padres vinculados",
    allergies: ["Maní"],
    birthDate: "12 mar 2022",
    birthDateISO: "2022-03-12",
    enrollment: "feb 2025",
    medicalNotes: "Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila.",
    parents: [
      {
        name: "Lucía Fernández",
        initials: "L",
        avatarBackgroundColor: "#C9B6E8",
        relationship: "Mamá",
        status: "active",
        statusLabel: "activa",
      },
      {
        name: "Diego Fernández",
        initials: "D",
        avatarBackgroundColor: "#A9C7E8",
        relationship: "Papá",
        status: "pending",
        statusLabel: "invitación enviada",
      },
    ],
  },
  {
    id: "sofia-mendez",
    name: "Sofía Méndez",
    initials: "S",
    avatarBackgroundColor: "#F4B8CC",
    avatarTextColor: "#C44A7A",
    age: "2 años",
    sala: "Soles",
    parentsSummary: "1 padre vinculado",
    allergies: [],
    birthDate: "28 jul 2024",
    birthDateISO: "2024-07-28",
    enrollment: "mar 2026",
    parents: [
      {
        name: "Mariana Méndez",
        initials: "M",
        avatarBackgroundColor: "#F4B8CC",
        relationship: "Mamá",
        status: "active",
        statusLabel: "activa",
      },
    ],
  },
  {
    id: "benjamin-ruiz",
    name: "Benjamín Ruiz",
    initials: "B",
    avatarBackgroundColor: "#B9DEC4",
    avatarTextColor: "#3E8B62",
    age: "3 años",
    sala: "Soles",
    parentsSummary: "2 padres vinculados",
    allergies: [],
    birthDate: "3 sep 2022",
    birthDateISO: "2022-09-03",
    enrollment: "feb 2025",
    parents: [
      {
        name: "Carla Ruiz",
        initials: "C",
        avatarBackgroundColor: "#C9B6E8",
        relationship: "Mamá",
        status: "active",
        statusLabel: "activa",
      },
      {
        name: "Pablo Ruiz",
        initials: "P",
        avatarBackgroundColor: "#A9C7E8",
        relationship: "Papá",
        status: "active",
        statusLabel: "activa",
      },
    ],
  },
  {
    id: "valentina-soto",
    name: "Valentina Soto",
    initials: "V",
    avatarBackgroundColor: "#F4DC8E",
    avatarTextColor: "#9A7B1E",
    age: "2 años",
    sala: "Soles",
    parentsSummary: "sin padres vinculados",
    allergies: [],
    needsParentLink: true,
    birthDate: "15 ene 2024",
    birthDateISO: "2024-01-15",
    enrollment: "ago 2026",
    parents: [],
  },
  {
    id: "tomas-diaz",
    name: "Tomás Díaz",
    initials: "T",
    avatarBackgroundColor: "#C9B6E8",
    avatarTextColor: "#7B5FC0",
    age: "3 años",
    sala: "Soles",
    parentsSummary: "1 padre vinculado",
    allergies: ["Lactosa"],
    birthDate: "22 nov 2022",
    birthDateISO: "2022-11-22",
    enrollment: "feb 2025",
    medicalNotes: "Alergia a la lactosa. Ofrecer alternativa vegetal en la merienda.",
    parents: [
      {
        name: "Andrés Díaz",
        initials: "A",
        avatarBackgroundColor: "#A9C7E8",
        relationship: "Papá",
        status: "pending",
        statusLabel: "invitación enviada",
      },
    ],
  },
  {
    id: "emma-castro",
    name: "Emma Castro",
    initials: "E",
    avatarBackgroundColor: "#F4B8CC",
    avatarTextColor: "#C44A7A",
    age: "2 años",
    sala: "Soles",
    parentsSummary: "1 padre vinculado",
    allergies: [],
    birthDate: "9 may 2024",
    birthDateISO: "2024-05-09",
    enrollment: "mar 2026",
    parents: [
      {
        name: "Javier Castro",
        initials: "J",
        avatarBackgroundColor: "#B9DEC4",
        relationship: "Papá",
        status: "active",
        statusLabel: "activa",
      },
    ],
  },
  {
    id: "lucas-romero",
    name: "Lucas Romero",
    initials: "L",
    avatarBackgroundColor: "#A9D9E8",
    avatarTextColor: "#1F7A93",
    age: "3 años",
    sala: "Soles",
    parentsSummary: "1 padre vinculado",
    allergies: [],
    birthDate: "17 abr 2023",
    birthDateISO: "2023-04-17",
    enrollment: "mar 2025",
    parents: [
      {
        name: "Paula Romero",
        initials: "P",
        avatarBackgroundColor: "#F4B8CC",
        relationship: "Mamá",
        status: "active",
        statusLabel: "activa",
      },
    ],
  },
  {
    id: "olivia-vega",
    name: "Olivia Vega",
    initials: "O",
    avatarBackgroundColor: "#B9DEC4",
    avatarTextColor: "#3E8B62",
    age: "2 años",
    sala: "Soles",
    parentsSummary: "1 padre vinculado",
    allergies: [],
    birthDate: "30 ago 2024",
    birthDateISO: "2024-08-30",
    enrollment: "ago 2026",
    parents: [
      {
        name: "Martín Vega",
        initials: "M",
        avatarBackgroundColor: "#A9C7E8",
        relationship: "Papá",
        status: "active",
        statusLabel: "activa",
      },
    ],
  },
];
