import type { Metadata } from "next";
import Link from "next/link";
import { FormField, formControlClass } from "@/app/components/form-field";

export const metadata: Metadata = {
  title: "Agregar niño · OpenDayCare",
};

export default function NewChildPage() {
  return (
    <div className="min-h-screen flex items-start justify-center py-10 px-6">
      <div className="w-full max-w-[520px] bg-[#FBF4EC] border border-[#ECE0D0] rounded-[24px] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)] overflow-hidden">
        <header className="flex items-center justify-between py-5 px-[26px] border-b border-[#ECE0D0]">
          <Link href="/children" className="text-[#94887B] font-bold text-[15px]">
            Cancelar
          </Link>
          <span className="font-display font-semibold text-[18px] text-[#3F362E]">
            Agregar niño
          </span>
          <Link href="/children" className="text-[#D9583C] font-extrabold text-[15px]">
            Guardar
          </Link>
        </header>
        <div className="py-6 px-[26px]">
          <FormField label="NOMBRE COMPLETO" className="mb-[18px]">
            <input type="text" placeholder="Ej. Martina López" className={formControlClass} />
          </FormField>

          <div className="flex gap-[14px] mb-[18px]">
            <FormField label="FECHA DE NACIMIENTO" className="flex-1">
              <input type="text" placeholder="dd/mm/aaaa" className={formControlClass} />
            </FormField>
            <FormField label="SALA" className="flex-1">
              {/* Fake select from the comp: static value + chevron, no interactivity. */}
              <div className={`${formControlClass} flex items-center gap-2 font-bold`}>
                Soles
                <span className="flex-1" />
                <svg
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
            </FormField>
          </div>

          <FormField label="ALERGIAS (ETIQUETAS)" className="mb-[18px]">
            <input type="text" placeholder="Ej. Maní, Lactosa" className={formControlClass} />
          </FormField>

          <FormField label="NOTAS MÉDICAS">
            <textarea
              placeholder="Indicaciones, medicación, contactos…"
              className={`${formControlClass} min-h-[90px] resize-y leading-[1.5]`}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}
