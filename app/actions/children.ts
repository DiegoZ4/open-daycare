"use server";

import { revalidatePath } from "next/cache";
import {
  children,
  deriveChildFields,
  initialsFromName,
  parentAvatarForIndex,
  parentsSummaryFor,
  parseAllergiesText,
} from "@/app/data/children";
import type { Parent } from "@/app/data/children";
import { computeAgeES, currentMonthYearES, formatDateES } from "@/app/lib/date";

// Form input the modal sends after client-side validation. The date arrives
// as ISO (parsed from the masked dd/mm/yyyy input); allergies as free text.
export interface ChildFormInput {
  name: string;
  birthDateISO: string;
  sala: string;
  allergiesText: string;
  medicalNotes?: string;
}

// In-memory persistence (project decision): mutations to the exported mock
// array + revalidatePath. Data resets when the dev server restarts; a real DB
// replaces only this file, without touching the UI.

/** Creates a child from the modal input and refreshes the children list. */
export async function addChild(input: ChildFormInput): Promise<string> {
  const derived = deriveChildFields({
    name: input.name,
    birthDateISO: input.birthDateISO,
    sala: input.sala,
    allergies: parseAllergiesText(input.allergiesText),
  });

  children.push({
    ...derived,
    name: input.name,
    sala: input.sala,
    allergies: parseAllergiesText(input.allergiesText),
    birthDateISO: input.birthDateISO,
    enrollment: currentMonthYearES(),
    medicalNotes: input.medicalNotes,
    parents: [],
  });

  revalidatePath("/children");
  return derived.id;
}

/** Updates name/date/sala/allergies/notes of a child, preserving the rest. */
export async function updateChild(id: string, input: ChildFormInput): Promise<void> {
  const child = children.find((candidate) => candidate.id === id);
  if (!child) return;

  child.name = input.name;
  child.initials = initialsFromName(input.name);
  child.sala = input.sala;
  child.allergies = parseAllergiesText(input.allergiesText);
  child.birthDateISO = input.birthDateISO;
  child.birthDate = formatDateES(input.birthDateISO);
  child.age = computeAgeES(input.birthDateISO);
  child.medicalNotes = input.medicalNotes;
  // parents, parentsSummary, enrollment, needsParentLink and avatar colors stay.

  revalidatePath("/children");
  revalidatePath(`/children/${id}`);
}

// Input the link-parent modal sends after client-side validation.
export interface ParentFormInput {
  name: string;
  email: string;
  relationship: string; // "Mamá" | "Papá" | "Tutor/a"
}

export type LinkParentResult = { ok: true } | { ok: false; error: "duplicate-email" };

/**
 * Adds a pending parent to a child from the link-parent modal, preserving the
 * rest. The client blocks duplicate emails first; this rejection is the
 * safety net. Data resets when the dev server restarts (see addChild).
 */
export async function linkParent(
  childId: string,
  input: ParentFormInput,
): Promise<LinkParentResult> {
  const child = children.find((candidate) => candidate.id === childId);
  if (!child) return { ok: false, error: "duplicate-email" };

  const email = input.email.trim().toLowerCase();
  if (child.parents.some((parent) => parent.email.toLowerCase() === email)) {
    return { ok: false, error: "duplicate-email" };
  }

  const avatar = parentAvatarForIndex(child.parents.length);
  const parent: Parent = {
    name: input.name.trim(),
    email: email,
    initials: initialsFromName(input.name),
    avatarBackgroundColor: avatar.background,
    relationship: input.relationship,
    status: "pending",
    statusLabel: "invitación enviada",
  };
  child.parents.push(parent);
  child.parentsSummary = parentsSummaryFor(child.parents.length);
  // Linking a parent resolves the "VINCULAR" chip marker.
  delete child.needsParentLink;

  revalidatePath("/children");
  revalidatePath(`/children/${childId}`);
  return { ok: true };
}
