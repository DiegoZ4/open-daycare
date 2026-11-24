import Link from "next/link";
import type { Child } from "@/app/data/children";
import { LinkParentChip } from "@/app/components/link-parent-chip";

const ALLERGY_CHIP = { backgroundColor: "#FBD8CC", textColor: "#D9684A" };

const chipClass = "shrink-0 text-[11px] font-extrabold py-[5px] px-[9px] rounded-full";

export function ChildCard({ child }: { child: Child }) {
  return (
    <Link
      href={`/children/${child.id}`}
      className="flex items-center gap-[14px] min-w-0 bg-[#FFFDF9] border border-[#ECE0D0] rounded-[18px] p-4 shadow-[0_4px_14px_-12px_rgba(120,90,60,0.5)] transition duration-150 hover:border-[#F2A78E] hover:-translate-y-[2px]"
    >
      <div
        className="flex items-center justify-center shrink-0 w-12 h-12 rounded-full font-display font-semibold text-[19px]"
        style={{ backgroundColor: child.avatarBackgroundColor, color: child.avatarTextColor }}
      >
        {child.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display font-semibold text-[16px] text-[#3F362E]">{child.name}</div>
        <div className="text-[13px] text-[#A89A8B]">
          {child.age} · {child.parentsSummary}
        </div>
      </div>
      {child.allergies.length > 0 ? (
        <span
          className={chipClass}
          style={{ backgroundColor: ALLERGY_CHIP.backgroundColor, color: ALLERGY_CHIP.textColor }}
        >
          {child.allergies[0].toUpperCase()}
        </span>
      ) : child.needsParentLink ? (
        <LinkParentChip child={child} />
      ) : (
        <svg
          className="shrink-0"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#CBB89F"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      )}
    </Link>
  );
}
