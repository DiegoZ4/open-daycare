import Link from "next/link";

export function TopBar() {
  return (
    <header className="lg:hidden sticky top-0 z-10 flex items-center justify-between gap-3 bg-[#FFFDF9] border-b border-[#ECE0D0] px-4 py-3">
      <Link href="/" className="flex items-center gap-[11px] min-w-0">
        <div className="flex items-center justify-center shrink-0 w-[38px] h-[38px] rounded-[12px] bg-[linear-gradient(155deg,#F8C3A8,#F2937A)]">
          <svg
            width="21"
            height="21"
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
        <div className="font-display font-semibold text-[17px] leading-none text-[#3F362E] truncate">
          OpenDayCare
        </div>
      </Link>
      <a
        href="#"
        className="shrink-0 flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-[12px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] text-white font-extrabold text-[13px] shadow-[0_8px_18px_-8px_rgba(238,129,100,0.75)]"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Nueva publicación
      </a>
    </header>
  );
}
