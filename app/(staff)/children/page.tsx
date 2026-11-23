import type { Metadata } from "next";
import { ChildCard } from "@/app/components/child-card";
import { AddChildButton } from "@/app/components/add-child-button";
import { children, classroomSummary } from "@/app/data/children";

export const metadata: Metadata = {
  title: "Niños · OpenDayCare",
};

export default function ChildrenPage() {
  return (
    <div className="mx-auto w-full max-w-[880px] pt-[34px] px-4 pb-20 lg:px-10">
      <div className="flex items-end justify-between gap-4 mb-[22px]">
        <div>
          <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#D9583C]">
            GESTIÓN
          </div>
          <h1 className="m-0 font-display font-semibold text-[30px] text-[#3F362E]">Niños</h1>
        </div>
        <AddChildButton />
      </div>

      <div className="flex items-center gap-[11px] bg-[#FFFDF9] border border-[#ECE0D0] rounded-[14px] py-3 px-4 mb-[22px]">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#B0A290"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Buscar niño…"
          className="flex-1 border-none bg-transparent text-[15px] text-[#3F362E]"
        />
      </div>

      <div className="flex items-center gap-3 mb-[14px]">
        <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-[#3F362E] uppercase">
          {classroomSummary.name}
        </span>
        <span className="text-[13px] text-[#A89A8B]">
          {children.length} niños
        </span>
        <span className="flex-1 h-px bg-[#E7DAC8]" />
      </div>

      <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
        {children.map((child) => (
          <ChildCard key={child.id} child={child} />
        ))}
      </div>
    </div>
  );
}
