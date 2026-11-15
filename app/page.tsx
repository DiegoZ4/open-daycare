import { classroom, posts, staffUser } from "@/app/data/feed";
import { PostCard } from "@/app/components/post-card";

export default function Home() {
  const greetingName = staffUser.name.split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-[760px] pt-[34px] px-4 pb-20 lg:px-10">
      <div className="mb-6">
        <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#D9583C]">
          GUARDERÍA · {classroom.name.toUpperCase()}
        </div>
        <h1 className="m-0 font-display font-semibold text-[30px] text-[#3F362E]">
          Buenas, {greetingName}
        </h1>
        <p className="mt-[5px] mb-0 text-[14.5px] text-[#94887B]">
          {classroom.childrenCount} niños · {classroom.date}
        </p>
      </div>

      <a
        href="#"
        className="mb-6 flex items-center gap-[14px] rounded-[18px] border border-[#ECE0D0] bg-[#FFFDF9] py-[14px] px-[18px] shadow-[0_4px_14px_-10px_rgba(120,90,60,0.4)]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F2937A] font-display font-semibold text-[16px] text-white">
          {staffUser.initials}
        </div>
        <span className="flex-1 text-[15px] text-[#A89A8B]">Compartí un momento…</span>
        <span className="flex h-[38px] w-[38px] items-center justify-center rounded-[12px] bg-[#FBE3D8] text-[#E0654A]">
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </span>
      </a>

      <div className="mb-[14px] flex items-center gap-[14px]">
        <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-[#8A7C6D]">
          PUBLICADO HOY
        </span>
        <span className="h-px flex-1 bg-[#E7DAC8]" />
      </div>

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
