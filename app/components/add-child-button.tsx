"use client";

import { useCallback, useState } from "react";
import { AddChildModal } from "@/app/components/add-child-modal";

// The list page is a server component; this wrapper owns the modal's open
// state and renders it in create mode over the grid.
export function AddChildButton() {
  const [open, setOpen] = useState(false);

  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 py-[11px] px-[18px] rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] text-white font-extrabold text-[14.5px] shadow-[0_8px_18px_-8px_rgba(238,129,100,0.7)]"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Agregar niño
      </button>

      {open ? <AddChildModal mode="create" onClose={handleClose} /> : null}
    </>
  );
}
