"use client";

import { useCallback, useState } from "react";
import { AddChildModal } from "@/app/components/add-child-modal";
import type { Child } from "@/app/data/children";

// The profile page is a server component; this wrapper owns the modal's
// open state and renders it in edit mode with the child's data preloaded.
export function EditChildButton({ child }: { child: Child }) {
  const [open, setOpen] = useState(false);

  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359] font-bold text-[14px] py-[9px] px-4 rounded-[12px]"
      >
        Editar
      </button>

      {open ? (
        <AddChildModal mode="edit" child={child} onClose={handleClose} />
      ) : null}
    </>
  );
}
