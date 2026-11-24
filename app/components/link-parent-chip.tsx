"use client";

import { useCallback, useState } from "react";
import { LinkParentModal } from "@/app/components/link-parent-modal";
import type { Child } from "@/app/data/children";

// Client chip rendered inside the ChildCard's Link: clicking it opens the
// link-parent modal instead of navigating to the profile.
export function LinkParentChip({ child }: { child: Child }) {
  const [open, setOpen] = useState(false);

  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          // Don't let the surrounding card Link navigate.
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
        className="shrink-0 text-[11px] font-extrabold py-[5px] px-[9px] rounded-full bg-[#F9D2DE] text-[#C56486] cursor-pointer"
      >
        VINCULAR
      </button>

      {open ? <LinkParentModal child={child} onClose={handleClose} /> : null}
    </>
  );
}
