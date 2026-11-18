import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Child, Parent } from "@/app/data/children";
import { children, classroomSummary } from "@/app/data/children";

const PARENT_STATUS_CHIP: Record<Parent["status"], { label: string; chipClass: string }> = {
  active: { label: "ACTIVA", chipClass: "bg-[#CFEBD8] text-[#3E9B6C]" },
  pending: { label: "PENDIENTE", chipClass: "bg-[#F7E7A6] text-[#9A7B1E]" },
};

function getChild(id: string): Child | undefined {
  return children.find((child) => child.id === id);
}

export function generateStaticParams() {
  return children.map((child) => ({ id: child.id }));
}

export async function generateMetadata(
  props: PageProps<"/children/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const child = getChild(id);
  return { title: child ? `${child.name} · OpenDayCare` : "Niños · OpenDayCare" };
}

export default async function ChildProfilePage(props: PageProps<"/children/[id]">) {
  const { id } = await props.params;
  const child = getChild(id);
  if (!child) notFound();

  const infoRows = [
    { label: "Fecha de nacimiento", value: child.birthDate },
    { label: "Sala", value: "Soles" },
    { label: "Ingreso", value: child.enrollment },
  ];

  return (
    <div className="mx-auto w-full max-w-[820px] pt-[34px] px-4 pb-20 lg:px-10">
      <Link
        href="/children"
        className="flex items-center gap-[7px] text-[#94887B] font-bold text-[14px] mb-5"
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
          <path d="m15 18-6-6 6-6" />
        </svg>
        Volver a Niños
      </Link>

      <div className="flex flex-wrap items-start gap-[26px]">
        <div className="flex-1 min-w-[300px] flex flex-col gap-[18px]">
          <div className="flex items-center gap-[18px]">
            <div
              className="flex items-center justify-center shrink-0 w-[84px] h-[84px] rounded-full font-display font-semibold text-[34px]"
              style={{
                backgroundColor: child.avatarBackgroundColor,
                color: child.avatarTextColor,
              }}
            >
              {child.initials}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="m-0 font-display font-semibold text-[28px] text-[#3F362E]">
                {child.name}
              </h1>
              <p className="mt-[3px] mb-0 text-[15px] text-[#94887B]">
                {child.age} · {classroomSummary.name}
              </p>
            </div>
            {/* El comp apunta Editar a agregar-nino; la edición real va en su spec. */}
            <Link
              href="/children/new"
              className="shrink-0 border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359] font-bold text-[14px] py-[9px] px-4 rounded-[12px]"
            >
              Editar
            </Link>
          </div>

          {child.allergyTag || child.medicalNotes ? (
            <div className="flex gap-[14px] bg-[#FBDAD6] rounded-[16px] py-4 px-[18px]">
              <div className="flex items-center justify-center shrink-0 w-10 h-10 rounded-[11px] bg-[#F4A8A0]">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                  <path d="M12 9v4M12 17h.01" />
                </svg>
              </div>
              <div>
                <div className="mb-[2px] font-extrabold text-[#C5413A] text-[15px]">
                  Alergias y notas
                </div>
                <div className="text-[#B25249] text-[14.5px] leading-[1.5]">
                  {child.medicalNotes}
                </div>
              </div>
            </div>
          ) : null}

          <div className="bg-[#FFFDF9] border border-[#ECE0D0] rounded-[16px] overflow-hidden">
            {infoRows.map((row, index) => (
              <div
                key={row.label}
                className={`flex justify-between py-[15px] px-[18px] ${
                  index < infoRows.length - 1 ? "border-b border-[#F0E6D8]" : ""
                }`}
              >
                <span className="text-[#94887B] text-[14.5px]">{row.label}</span>
                <span className="font-extrabold text-[#3F362E] text-[14.5px]">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-[300px] shrink-0 flex flex-col gap-[14px]">
          {/* Resumen del día: pantalla futura, link muerto. */}
          <a
            href="#"
            className="flex items-center justify-center gap-[9px] w-full py-[13px] rounded-[14px] bg-[#3F362E] text-white font-extrabold text-[15px]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
            Resumen del día
          </a>

          <div className="bg-[#FFFDF9] border border-[#ECE0D0] rounded-[16px] py-4 px-[18px]">
            <div className="mb-[14px] text-[12.5px] font-extrabold tracking-[0.8px] text-[#8A7C6D]">
              PADRES VINCULADOS
            </div>
            <div className="flex flex-col gap-[14px]">
              {child.parents.map((parent) => {
                const chip = PARENT_STATUS_CHIP[parent.status];
                return (
                  <div key={parent.name} className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center shrink-0 w-10 h-10 rounded-full text-white font-display font-semibold text-[16px]"
                      style={{ backgroundColor: parent.avatarBackgroundColor }}
                    >
                      {parent.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-[14.5px] text-[#3F362E]">
                        {parent.name}
                      </div>
                      <div className="text-[12.5px] text-[#A89A8B]">
                        {parent.relationship} · {parent.statusLabel}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 text-[10.5px] font-extrabold py-[4px] px-[9px] rounded-full ${chip.chipClass}`}
                    >
                      {chip.label}
                    </span>
                  </div>
                );
              })}

              {/* Vincular otro padre: pantalla futura, link muerto. */}
              <a href="#" className="flex items-center gap-3 pt-2">
                <span className="flex items-center justify-center shrink-0 w-10 h-10 rounded-full border-[1.5px] border-dashed border-[#D8CBBA] text-[#B0A290]">
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
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
                <span className="font-extrabold text-[14.5px] text-[#C5503A]">
                  Vincular otro padre
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
