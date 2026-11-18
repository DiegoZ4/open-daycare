import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  className?: string;
  children: ReactNode;
}

// Shared control styling from the comp: white bg, 1.5px #EADFD0 border,
// 14px radius, 13px/16px padding, 15px text.
export const formControlClass =
  "w-full py-[13px] px-4 rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-[15px] text-[#3F362E]";

export function FormField({ label, className, children }: FormFieldProps) {
  return (
    <div className={className}>
      <div className="mb-2 text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
        {label}
      </div>
      {children}
    </div>
  );
}
