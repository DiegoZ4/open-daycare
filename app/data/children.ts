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
  age: string;
  parentsSummary: string;
  allergyTag?: string;
  needsParentLink?: boolean;
  birthDate: string;
  enrollment: string;
  medicalNotes?: string;
  parents: Parent[];
}

export interface ClassroomSummary {
  name: string;
  childrenCount: number;
}

// The list shows "SALA SOLES · 8 niños"; the Feed header mock says "12 niños"
// (as in the original comps). This discrepancy goes away once there is a DB.
export const classroomSummary: ClassroomSummary = {
  name: "Sala Soles",
  childrenCount: 8,
};

// Card meta renders as "{age} · {parentsSummary}".
// Right slot: allergyTag → allergy chip, needsParentLink → "VINCULAR" chip,
// otherwise a chevron (see ChildCard).
// parents count matches parentsSummary (2/1/0); medicalNotes renders in the
// profile's "Alergias y notas" box. Profile data not defined by the comps
// (only Mateo's is) was invented as plausible mock.
export const children: Child[] = [
  {
    id: "mateo-fernandez",
    name: "Mateo Fernández",
    initials: "M",
    avatarBackgroundColor: "#A9D9E8",
    avatarTextColor: "#1F7A93",
    age: "3 años",
    parentsSummary: "2 padres vinculados",
    allergyTag: "MANÍ",
    birthDate: "12 mar 2022",
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
    parentsSummary: "1 padre vinculado",
    birthDate: "28 jul 2024",
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
    parentsSummary: "2 padres vinculados",
    birthDate: "3 sep 2022",
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
    parentsSummary: "sin padres vinculados",
    needsParentLink: true,
    birthDate: "15 ene 2024",
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
    parentsSummary: "1 padre vinculado",
    allergyTag: "LACTOSA",
    birthDate: "22 nov 2022",
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
    parentsSummary: "1 padre vinculado",
    birthDate: "9 may 2024",
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
    parentsSummary: "1 padre vinculado",
    birthDate: "17 abr 2023",
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
    parentsSummary: "1 padre vinculado",
    birthDate: "30 ago 2024",
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
