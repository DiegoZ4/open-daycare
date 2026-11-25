import type { Post, PostType } from "@/app/data/feed";

const POST_TYPE_BADGE: Record<
  PostType,
  { label: string; backgroundColor: string; textColor: string }
> = {
  meal: { label: "COMIDA", backgroundColor: "#F7E7A6", textColor: "#9A7B1E" },
  nap: { label: "SIESTA", backgroundColor: "#E7DCF6", textColor: "#7B5FC0" },
  activity: { label: "ACTIVIDAD", backgroundColor: "#C7E7F1", textColor: "#2E89A6" },
  achievement: { label: "LOGRO", backgroundColor: "#CFEBD8", textColor: "#3E9B6C" },
  mood: { label: "ÁNIMO", backgroundColor: "#F9D2DE", textColor: "#C56486" },
  photo: { label: "FOTO", backgroundColor: "#FBD8CC", textColor: "#D9684A" },
  announcement: { label: "ANUNCIO", backgroundColor: "#CCD8F4", textColor: "#4E72C8" },
};

export function PostCard({ post }: { post: Post }) {
  const badge = POST_TYPE_BADGE[post.type];

  return (
    <article className="bg-[#FFFDF9] border border-[#ECE0D0] rounded-[20px] py-5 px-[22px] shadow-[0_4px_16px_-12px_rgba(120,90,60,0.5)]">
      <header className="flex items-center gap-3 mb-[14px]">
        <div
          className="flex items-center justify-center shrink-0 w-11 h-11 rounded-full font-display font-semibold text-[17px]"
          style={{ backgroundColor: post.author.backgroundColor, color: post.author.textColor }}
        >
          {post.type === "announcement" ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 11 18-5v12L3 14v-3zM11.6 16.8a3 3 0 1 1-5.8-1.6" />
            </svg>
          ) : (
            post.author.initials
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-semibold text-[16.5px] text-[#3F362E]">
            {post.author.name}
          </div>
          <div className="text-[12.5px] text-[#A89A8B]">
            {post.time}
            {post.publishedByYou ? " · publicado por vos" : ""}
          </div>
        </div>
        <div
          className="flex items-center gap-[7px] py-[6px] px-3 rounded-full"
          style={{ backgroundColor: badge.backgroundColor }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: badge.textColor }}
          />
          <span
            className="text-[12px] font-extrabold tracking-[0.5px]"
            style={{ color: badge.textColor }}
          >
            {badge.label}
          </span>
        </div>
      </header>
      <div className="mb-[10px] text-[12.5px] text-[#A89A8B]">Para: {post.audience}</div>
      <p className="text-[15.5px] leading-[1.55] text-[#4A4038]">{post.text}</p>
      {post.photos && post.photos.length > 0 ? (
        // Real photos from the new-post modal: 1 → wide image, 2–4 → 2×2 grid.
        <div
          className={`mt-[14px] gap-[10px] ${
            post.photos.length === 1 ? "grid" : "grid grid-cols-2"
          }`}
        >
          {post.photos.map((photo, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${index}-${photo.length}`}
              src={photo}
              alt="Foto de la publicación"
              className="w-full rounded-[16px] border border-[#ECE0D0] object-cover h-[200px]"
            />
          ))}
        </div>
      ) : post.photoPlaceholder ? (
        <a
          href="#"
          className="mt-[14px] flex flex-col items-center justify-center gap-2 rounded-[16px] border-[1.5px] border-dashed border-[#DBCDBA] bg-[#F4ECE1] h-[200px] text-[#B0A290]"
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 21" />
          </svg>
          <span className="text-[13.5px]">{post.photoPlaceholder}</span>
        </a>
      ) : null}
      <footer className="mt-4 pt-[14px] border-t border-[#F0E6D8] flex items-center gap-[18px]">
        <span className="flex items-center gap-[7px] text-[#E0654A] font-bold text-[14px]">
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="#E0654A"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
          {post.hearts}
        </span>
        <a
          href="#"
          className="flex items-center gap-[7px] text-[#94887B] font-bold text-[14px]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
          </svg>
          {post.comments}
        </a>
        <span className="flex-1" />
        <a href="#" className="text-[#C5503A] font-extrabold text-[14px]">
          Editar
        </a>
      </footer>
    </article>
  );
}
