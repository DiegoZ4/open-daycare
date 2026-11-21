import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Activar cuenta · OpenDayCare",
};

// Inline mock values from activar-cuenta.dc.html — shell only, no data files
// per SPEC 03.
const invitation = {
  code: "7K4P9",
  email: "lucia.fernandez@gmail.com",
  childInitials: "M",
  childName: "Mateo",
  classroom: "Sala Soles",
  avatarBackgroundColor: "#A9D9E8",
  avatarTextColor: "#1F7A93",
};

// Exact control styling from activar-cuenta.dc.html: 14px/16px padding, 1.5px
// #EADFD0 border, 14px radius, 15px text. Kept local per SPEC 03 — this comp
// uses 700 labels and 14/16 padding, unlike the shared form-field.tsx.
const inputClass =
  "w-full py-[14px] px-4 rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-[15px] text-[#3F362E]";

const labelClass =
  "mb-2 text-[12px] font-bold tracking-[0.7px] text-[#94887B]";

export default function ActivateAccountPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBF4EC] p-6 sm:p-10">
      <div className="w-full max-w-[440px]">
        <div className="mb-[22px] flex h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-[linear-gradient(155deg,#F8C3A8,#F2937A)] shadow-[0_12px_26px_-10px_rgba(238,129,100,0.65)]">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </div>

        <h1 className="mb-2 font-display font-semibold text-[32px] leading-[1.15] text-[#3F362E]">
          Bienvenida a OpenDayCare
        </h1>
        <p className="mb-[26px] text-[15.5px] leading-[1.55] text-[#94887B]">
          Te invitaron a seguir el día de tu hijo. Creá tu contraseña para
          activar la cuenta.
        </p>

        <div className="mb-[22px] flex items-center gap-[14px] rounded-[16px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px]">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display font-semibold text-[19px]"
            style={{
              backgroundColor: invitation.avatarBackgroundColor,
              color: invitation.avatarTextColor,
            }}
          >
            {invitation.childInitials}
          </div>
          <div>
            <div className="text-[13px] text-[#94887B]">
              Te invitaron a seguir a
            </div>
            <div className="font-display font-semibold text-[17px] text-[#3F362E]">
              {invitation.childName} · {invitation.classroom}
            </div>
          </div>
        </div>

        <div className={labelClass}>CÓDIGO DE INVITACIÓN</div>
        <input
          defaultValue={invitation.code}
          className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px] font-display font-bold text-[18px] tracking-[3px] text-[#3F362E]"
        />

        <div className={labelClass}>EMAIL</div>
        <input
          type="email"
          defaultValue={invitation.email}
          className={`${inputClass} mb-[18px]`}
        />

        <div className={labelClass}>CREAR CONTRASEÑA</div>
        <input
          type="password"
          defaultValue="contraseña"
          className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#F2A78E] bg-white px-4 py-[14px] text-[15px] text-[#3F362E]"
        />

        {/* Static authorization box from the comp: always checked, not
            interactive (SPEC 03 — shell only). */}
        <div className="mb-6 flex cursor-pointer items-start gap-3 rounded-[14px] bg-[#FBF1D6] px-4 py-[14px]">
          <span className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#5FB97E]">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span className="text-[14px] leading-[1.45] text-[#8A7234]">
            Autorizo a la guardería a tomar y compartir fotos de mi hijo dentro
            de la app.
          </span>
        </div>

        {/* Dead link: familia-feed has no spec yet (SPEC 03). */}
        <a
          href="#"
          className="block w-full rounded-[15px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] py-[15px] text-center text-[16px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)]"
        >
          Activar mi cuenta
        </a>

        <p className="mt-[22px] text-center text-[14.5px] text-[#94887B]">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-extrabold text-[#C5503A]">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
