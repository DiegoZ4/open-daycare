"use client";

import { useCallback, useState } from "react";
import { LinkParentModal } from "@/app/components/link-parent-modal";
import type { Child } from "@/app/data/children";

// The profile page is a server component; this wrapper owns the modal's open
// state. Replaces the dead "Vincular otro padre" link from the comps.
export function LinkParentButton({ child }: { child: Child }) {
  const [open, setOpen] = useState(false);

  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 pt-2 cursor-pointer"
      >
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
      </button>

      {open ? <LinkParentModal child={child} onClose={handleClose} /> : null}
    </>
  );
}
