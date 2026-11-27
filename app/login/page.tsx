import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión · OpenDayCare",
};

// Sun icon shared by the brand tile (login panel and activation card).
function SunIcon({ size, strokeWidth }: { size: number; strokeWidth: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen grid bg-[#FBF4EC] lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel — hidden below lg per SPEC 03 (mobile keeps only the form). */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden px-[60px] py-[56px] text-white bg-[linear-gradient(155deg,#F6A98E_0%,#F2937A_45%,#EC7E62_100%)]">
        <div className="absolute -top-[140px] -right-[120px] w-[420px] h-[420px] rounded-full bg-[rgba(255,255,255,0.12)]" />
        <div className="absolute -bottom-[110px] -left-[80px] w-[300px] h-[300px] rounded-full bg-[rgba(255,255,255,0.10)]" />

        <div className="relative flex items-center gap-[13px]">
          <div className="flex items-center justify-center w-[46px] h-[46px] rounded-[14px] bg-[rgba(255,255,255,0.22)]">
            <SunIcon size={26} strokeWidth={2.2} />
          </div>
          <span className="font-display font-semibold text-[21px] tracking-[0.5px]">
            OpenDayCare
          </span>
        </div>

        <div className="relative">
          <h1 className="mb-[18px] font-display font-semibold text-[42px] leading-[1.12]">
            El día de cada niño,
            <br />
            compartido con su familia.
          </h1>
          <p className="max-w-[430px] text-[17px] leading-[1.6] text-[rgba(255,255,255,0.92)]">
            Publicá momentos, gestioná las salas y mantené a las familias cerca,
            desde un solo lugar.
          </p>
        </div>

        <div className="relative text-[14px] text-[rgba(255,255,255,0.9)]">
          🌿 Guardería Sala Soles
        </div>
      </div>

      {/* Form column. The "INGRESO COMO" role selector is intentionally
          omitted per SPEC 03 — single form until real auth exists. */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[392px]">
          <h2 className="mb-[6px] font-display font-semibold text-[30px] text-[#3F362E]">
            Iniciar sesión
          </h2>
          <p className="mb-[28px] text-[15px] text-[#94887B]">
            Ingresá para ver el día de hoy.
          </p>

          {/* Real auth form: signInWithPassword against Supabase (SPEC 09).
              Fields start empty — the comp prefills are gone. */}
          <LoginForm />

          <p className="mt-6 text-center text-[14.5px] text-[#94887B]">
            ¿Te invitó la guardería?{" "}
            <Link
              href="/activate-account"
              className="font-extrabold text-[#C5503A]"
            >
              Activá tu cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
