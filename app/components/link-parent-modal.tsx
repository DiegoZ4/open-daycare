"use client";

import { useEffect, useState, useTransition } from "react";
import { linkParent } from "@/app/actions/children";
import { parentRelationships, type Child } from "@/app/data/children";

const LABEL_CLASS = "block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B] mb-[6px]";
const INPUT_CLASS =
  "w-full py-[13px] px-4 rounded-[14px] border-[1.5px] bg-white text-[15px] text-[#3F362E]";
const ERROR_CLASS = "mt-[6px] mb-0 text-[12.5px] font-bold text-[#D9583C]";

interface FormErrors {
  name?: string;
  email?: string;
}

// Same pragmatic pattern as the comp's mock: "diego@" and "diego@x" fail.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailFormatError(email: string): string | undefined {
  if (email.trim() === "") return undefined; // emptiness is handled at save
  if (!EMAIL_PATTERN.test(email.trim())) return "El email no tiene un formato válido.";
  return undefined;
}

function duplicateEmailError(child: Child, email: string): string | undefined {
  const normalized = email.trim().toLowerCase();
  const taken = child.parents.some((parent) => parent.email.toLowerCase() === normalized);
  return taken ? "Ese email ya está vinculado a este niño." : undefined;
}

export interface LinkParentModalProps {
  child: Child;
  onClose: () => void;
}

export function LinkParentModal({ child, onClose }: LinkParentModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // The comp renders "Mamá" as the selected pill on open.
  const [relationship, setRelationship] = useState<string>(parentRelationships[0]);
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

  function handleInvite() {
    const nextErrors: FormErrors = {
      name: name.trim() ? undefined : "El nombre es obligatorio.",
      email:
        email.trim() === ""
          ? "El email es obligatorio."
          : (emailFormatError(email) ?? duplicateEmailError(child, email)),
    };
    if (nextErrors.name || nextErrors.email) {
      setErrors(nextErrors);
      return;
    }

    startTransition(async () => {
      const result = await linkParent(child.id, {
        name: name.trim(),
        email: email.trim(),
        relationship,
      });
      // Safety net: the client already blocks duplicates.
      if (!result.ok) {
        setErrors({ email: "Ese email ya está vinculado a este niño." });
        return;
      }
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-4 px-6"
      style={{ backgroundColor: "rgba(63, 54, 46, 0.5)" }}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      // When opened from the ChildCard chip, this overlay lives inside the
      // card's <Link>: swallow clicks so they don't activate the link.
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="link-parent-modal-title"
        className="w-full max-w-[480px] shrink-0 bg-[#FBF4EC] border border-[#ECE0D0] rounded-[24px] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)] max-h-[calc(100dvh-2rem)] overflow-y-auto"
      >
        <div className="flex items-center justify-between py-4 px-[26px] border-b border-[#ECE0D0]">
          <div>
            <div
              id="link-parent-modal-title"
              className="font-display font-semibold text-[18px] text-[#3F362E]"
            >
              Vincular padre
            </div>
            <div className="text-[13px] text-[#A89A8B]">a {child.name}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex items-center justify-center shrink-0 w-[34px] h-[34px] rounded-[10px] bg-[#F0E6D8] text-[#94887B]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="pt-[18px] pb-[18px] px-[26px]">
          <div className="flex gap-[11px] bg-[#E3ECFB] rounded-[14px] py-[10px] px-[14px] mb-4">
            <svg
              className="shrink-0 mt-[1px]"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4E72C8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <span className="text-[13.5px] text-[#3F5694] leading-[1.45]">
              Le enviaremos un correo con un código para que active su cuenta. Solo verá el
              feed de {child.name}.
            </span>
          </div>

          <div className="mb-[14px]">
            <label htmlFor="parent-name" className={LABEL_CLASS}>
              NOMBRE DEL PADRE/MADRE
            </label>
            <input
              id="parent-name"
              type="text"
              placeholder="Ej. Diego Fernández"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                clearError("name");
              }}
              className={`${INPUT_CLASS} ${errors.name ? "border-[#D9583C]" : "border-[#EADFD0]"}`}
            />
            {errors.name ? <p className={ERROR_CLASS}>{errors.name}</p> : null}
          </div>

          <div className="mb-[14px]">
            <label htmlFor="parent-email" className={LABEL_CLASS}>
              EMAIL
            </label>
            <input
              id="parent-email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearError("email");
                // Live format error, like the birth date in the child modal:
                // it shows as soon as the non-empty value stops matching.
                const formatError = emailFormatError(event.target.value);
                if (formatError) {
                  setErrors((current) => ({ ...current, email: formatError }));
                }
              }}
              className={`${INPUT_CLASS} ${errors.email ? "border-[#D9583C]" : "border-[#EADFD0]"}`}
            />
            {errors.email ? <p className={ERROR_CLASS}>{errors.email}</p> : null}
          </div>

          <div className="mb-4">
            <div className={LABEL_CLASS}>PARENTESCO</div>
            <div className="flex gap-[9px]">
              {parentRelationships.map((option) => {
                const selected = relationship === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRelationship(option)}
                    className={`flex-1 py-[9px] rounded-full font-extrabold text-[14px] border-[1.5px] cursor-pointer ${
                      selected
                        ? "border-[#9FB8EC] bg-[#CCD8F4] text-[#4E72C8]"
                        : "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#FBF1D6] border-[1.5px] border-dashed border-[#E6D08A] rounded-[16px] py-[12px] text-center mb-4">
            <div className="text-[12px] font-extrabold tracking-[0.7px] text-[#A88526] mb-1">
              CÓDIGO DE INVITACIÓN
            </div>
            <div className="font-display font-semibold text-[28px] tracking-[6px] text-[#8A7234]">
              7K4P9
            </div>
            <div className="text-[13px] text-[#A88526] mt-1">Vence en 7 días</div>
          </div>

          <button
            type="button"
            onClick={handleInvite}
            disabled={pending}
            className="flex items-center justify-center gap-[9px] w-full py-3 rounded-[14px] bg-gradient-to-b from-[#F4977E] to-[#EE8164] text-white font-extrabold text-[15.5px] shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)] disabled:opacity-60 cursor-pointer"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4z" />
              <path d="M22 2 11 13" />
            </svg>
            Enviar invitación
          </button>
        </div>
      </div>
    </div>
  );
}
