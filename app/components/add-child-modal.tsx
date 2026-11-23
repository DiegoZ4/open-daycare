"use client";

import { useEffect, useState, useTransition } from "react";
import { addChild, updateChild } from "@/app/actions/children";
import { classrooms, type Child } from "@/app/data/children";
import { applyDateMask, applyDateMaskStrict, birthDateErrorES, isCompleteMaskedDate, parseDateES } from "@/app/lib/date";

const LABEL_CLASS = "block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B] mb-2";
const INPUT_CLASS =
  "w-full py-[13px] px-4 rounded-[14px] border-[1.5px] bg-white text-[15px] text-[#3F362E]";
const ERROR_CLASS = "mt-[6px] mb-0 text-[12.5px] font-bold text-[#D9583C]";

// "2022-03-12" → "12/03/2022" (dd/mm/yyyy digits, then the mask adds the slashes).
function maskFromISO(iso: string): string {
  return applyDateMask(iso.slice(8, 10) + iso.slice(5, 7) + iso.slice(0, 4));
}

interface FormErrors {
  name?: string;
  birthDate?: string;
  sala?: string;
}

export interface AddChildModalProps {
  mode: "create" | "edit";
  child?: Child; // edit mode only
  onClose: () => void;
}

export function AddChildModal({ mode, child, onClose }: AddChildModalProps) {
  const isEdit = mode === "edit" && child !== undefined;

  const [name, setName] = useState(isEdit ? child.name : "");
  const [birthDate, setBirthDate] = useState(isEdit ? maskFromISO(child.birthDateISO) : "");
  const [sala, setSala] = useState(isEdit ? child.sala : "Soles");
  const [allergiesText, setAllergiesText] = useState(isEdit ? child.allergies.join(", ") : "");
  const [medicalNotes, setMedicalNotes] = useState(isEdit ? (child.medicalNotes ?? "") : "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [pending, startTransition] = useTransition();

  // Esc closes the modal, discarding whatever was typed.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function clearError(field: keyof FormErrors) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSave() {
    const nextErrors: FormErrors = {
      name: name.trim() ? undefined : "El nombre es obligatorio.",
      birthDate: birthDateErrorES(birthDate) ?? undefined,
      sala: sala ? undefined : "La sala es obligatoria.",
    };
    if (nextErrors.name || nextErrors.birthDate || nextErrors.sala) {
      setErrors(nextErrors);
      return;
    }

    const input = {
      name: name.trim(),
      birthDateISO: parseDateES(birthDate) as string, // guaranteed by birthDateErrorES === null
      sala,
      allergiesText,
      medicalNotes: medicalNotes.trim() || undefined,
    };

    startTransition(async () => {
      if (isEdit) await updateChild(child.id, input);
      else await addChild(input);
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-10 px-6"
      style={{ backgroundColor: "rgba(63, 54, 46, 0.5)" }}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-child-modal-title"
        className="w-full max-w-[520px] shrink-0 bg-[#FBF4EC] border border-[#ECE0D0] rounded-[24px] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)] overflow-hidden"
      >
        <div className="flex items-center justify-between py-5 px-[26px] border-b border-[#ECE0D0]">
          <button
            type="button"
            onClick={onClose}
            className="text-[#94887B] font-bold text-[15px]"
          >
            Cancelar
          </button>
          <span
            id="add-child-modal-title"
            className="font-display font-semibold text-[18px] text-[#3F362E]"
          >
            {isEdit ? "Editar niño" : "Agregar niño"}
          </span>
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="text-[#D9583C] font-extrabold text-[15px] disabled:opacity-60"
          >
            Guardar
          </button>
        </div>

        <div className="p-6 px-[26px]">
          <div className="mb-[18px]">
            <label htmlFor="child-name" className={LABEL_CLASS}>
              NOMBRE COMPLETO
            </label>
            <input
              id="child-name"
              type="text"
              placeholder="Ej. Martina López"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                clearError("name");
              }}
              className={`${INPUT_CLASS} ${errors.name ? "border-[#D9583C]" : "border-[#EADFD0]"}`}
            />
            {errors.name ? <p className={ERROR_CLASS}>{errors.name}</p> : null}
          </div>

          <div className="flex gap-[14px] mb-[18px]">
            <div className="flex-1 min-w-0">
              <label htmlFor="child-birth-date" className={LABEL_CLASS}>
                FECHA DE NACIMIENTO
              </label>
              <input
                id="child-birth-date"
                type="text"
                inputMode="numeric"
                placeholder="dd/mm/aaaa"
                value={birthDate}
                onChange={(event) => {
                  // Strict mask drops impossible digits while typing; the
                  // error shows live once the date is complete but invalid.
                  const masked = applyDateMaskStrict(event.target.value);
                  setBirthDate(masked);
                  setErrors((current) => ({
                    ...current,
                    birthDate: isCompleteMaskedDate(masked)
                      ? (birthDateErrorES(masked) ?? undefined)
                      : undefined,
                  }));
                }}
                className={`${INPUT_CLASS} ${
                  errors.birthDate ? "border-[#D9583C]" : "border-[#EADFD0]"
                }`}
              />
              {errors.birthDate ? <p className={ERROR_CLASS}>{errors.birthDate}</p> : null}
            </div>

            <div className="flex-1 min-w-0">
              <label htmlFor="child-sala" className={LABEL_CLASS}>
                SALA
              </label>
              <div className="relative">
                <select
                  id="child-sala"
                  value={sala}
                  onChange={(event) => {
                    setSala(event.target.value);
                    clearError("sala");
                  }}
                  className={`${INPUT_CLASS} ${
                    errors.sala ? "border-[#D9583C]" : "border-[#EADFD0]"
                  } appearance-none pr-10 font-bold`}
                >
                  {classrooms.map((classroom) => (
                    <option key={classroom} value={classroom}>
                      {classroom}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#B0A290"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
              {errors.sala ? <p className={ERROR_CLASS}>{errors.sala}</p> : null}
            </div>
          </div>

          <div className="mb-[18px]">
            <label htmlFor="child-allergies" className={LABEL_CLASS}>
              ALERGIAS (ETIQUETAS)
            </label>
            <input
              id="child-allergies"
              type="text"
              placeholder="Ej. Maní, Lactosa"
              value={allergiesText}
              onChange={(event) => setAllergiesText(event.target.value)}
              className={`${INPUT_CLASS} border-[#EADFD0]`}
            />
          </div>

          <div>
            <label htmlFor="child-medical-notes" className={LABEL_CLASS}>
              NOTAS MÉDICAS
            </label>
            <textarea
              id="child-medical-notes"
              placeholder="Indicaciones, medicación, contactos…"
              value={medicalNotes}
              onChange={(event) => setMedicalNotes(event.target.value)}
              className={`${INPUT_CLASS} border-[#EADFD0] min-h-[90px] resize-y leading-[1.5]`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
