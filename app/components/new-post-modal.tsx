"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPost } from "@/app/actions/feed";
import { children } from "@/app/data/children";
import { POST_TYPES, type PostType } from "@/app/data/feed";

const LABEL_CLASS = "block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B] mb-[10px]";
const ERROR_CLASS = "mt-[6px] mb-0 text-[12.5px] font-bold text-[#D9583C]";
const MAX_PHOTOS = 4;

interface FormErrors {
  para?: string;
  tipo?: string;
  text?: string;
}

/** "Mateo Fernández" → "Mateo", as the comp's PARA chips render. */
function firstName(name: string): string {
  return name.split(" ")[0] ?? name;
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export interface NewPostModalProps {
  onClose: () => void;
}

export function NewPostModal({ onClose }: NewPostModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [type, setType] = useState<PostType | null>(null);
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoLimitError, setPhotoLimitError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // dragenter/leave fire for nested elements; a counter avoids flicker.
  const dragDepth = useRef(0);

  // Esc closes the modal, discarding whatever was typed.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const allSelected = selectedIds.length === children.length;

  function toggleChild(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((candidate) => candidate !== id) : [...current, id],
    );
    clearError("para");
  }

  function toggleAllRoom() {
    setSelectedIds(allSelected ? [] : children.map((child) => child.id));
    clearError("para");
  }

  function clearError(field: keyof FormErrors) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    if (files.length === 0) return;

    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      setPhotoLimitError("Podés agregar hasta 4 fotos.");
      return;
    }
    if (files.length > remaining) {
      setPhotoLimitError("Podés agregar hasta 4 fotos.");
    } else {
      setPhotoLimitError(null);
    }

    const dataUrls = await Promise.all(
      files.slice(0, remaining).map((file) => readFileAsDataURL(file)),
    );
    setPhotos((current) => [...current, ...dataUrls].slice(0, MAX_PHOTOS));
  }

  function removePhoto(index: number) {
    setPhotos((current) => current.filter((_, candidate) => candidate !== index));
    setPhotoLimitError(null);
  }

  function handlePublish() {
    const nextErrors: FormErrors = {
      para: selectedIds.length > 0 ? undefined : "Elegí al menos un destinatario.",
      tipo: type ? undefined : "Elegí un tipo de publicación.",
      text: text.trim() ? undefined : "La descripción es obligatoria.",
    };
    if (nextErrors.para || nextErrors.tipo || nextErrors.text) {
      setErrors(nextErrors);
      return;
    }

    startTransition(async () => {
      await createPost({
        childIds: selectedIds,
        allRoom: allSelected,
        type: type as PostType,
        text,
        photos,
      });
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-4 px-6"
      style={{ backgroundColor: "rgba(63, 54, 46, 0.5)" }}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-post-modal-title"
        className="w-full max-w-[580px] shrink-0 bg-[#FBF4EC] border border-[#ECE0D0] rounded-[24px] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)] max-h-[calc(100dvh-2rem)] overflow-y-auto"
      >
        <div className="flex items-center justify-between py-5 px-[26px] border-b border-[#ECE0D0]">
          <button
            type="button"
            onClick={onClose}
            className="text-[#94887B] font-bold text-[15px] cursor-pointer"
          >
            Cancelar
          </button>
          <span
            id="new-post-modal-title"
            className="font-display font-semibold text-[18px] text-[#3F362E]"
          >
            Nueva publicación
          </span>
          <button
            type="button"
            onClick={handlePublish}
            disabled={pending}
            className="text-[#D9583C] font-extrabold text-[15px] disabled:opacity-60 cursor-pointer"
          >
            Publicar
          </button>
        </div>

        <div className="p-6 px-[26px]">
          <div
            className={`mb-[22px] rounded-[14px] ${
              errors.para ? "border border-[#D9583C] p-3" : ""
            }`}
          >
            <div className={LABEL_CLASS}>PARA</div>
            <div className="flex flex-wrap gap-[9px]">
              {children.map((child) => {
                const selected = selectedIds.includes(child.id);
                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => toggleChild(child.id)}
                    className={`flex items-center gap-2 py-[6px] pr-[14px] pl-[6px] rounded-full font-bold text-[14px] border-[1.5px] cursor-pointer ${
                      selected
                        ? "border-[#3F362E] bg-[#3F362E] text-white"
                        : "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
                    }`}
                  >
                    <span
                      className="flex items-center justify-center w-[26px] h-[26px] rounded-full font-display font-semibold text-[13px]"
                      style={{ backgroundColor: child.avatarBackgroundColor, color: child.avatarTextColor }}
                    >
                      {child.initials}
                    </span>
                    {firstName(child.name)}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={toggleAllRoom}
                className={`py-[6px] px-4 rounded-full font-bold text-[14px] border-[1.5px] cursor-pointer ${
                  allSelected
                    ? "border-[#3F362E] bg-[#3F362E] text-white"
                    : "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
                }`}
              >
                Toda la sala
              </button>
            </div>
            {errors.para ? <p className={ERROR_CLASS}>{errors.para}</p> : null}
          </div>

          <div
            className={`mb-[22px] rounded-[14px] ${
              errors.tipo ? "border border-[#D9583C] p-3" : ""
            }`}
          >
            <div className={LABEL_CLASS}>TIPO</div>
            <div className="flex flex-wrap gap-[9px]">
              {POST_TYPES.map((postType) => {
                const selected = type === postType.key;
                return (
                  <button
                    key={postType.key}
                    type="button"
                    onClick={() => {
                      setType(postType.key);
                      clearError("tipo");
                    }}
                    style={selected ? undefined : { backgroundColor: postType.bg, color: postType.text }}
                    className={`py-2 px-4 rounded-full font-extrabold text-[13.5px] cursor-pointer ${
                      selected ? "bg-[#3F362E] text-white" : ""
                    }`}
                  >
                    {postType.label}
                  </button>
                );
              })}
            </div>
            {errors.tipo ? <p className={ERROR_CLASS}>{errors.tipo}</p> : null}
          </div>

          <div className="mb-[22px]">
            <label htmlFor="post-text" className={LABEL_CLASS}>
              DESCRIPCIÓN
            </label>
            <textarea
              id="post-text"
              placeholder="Contá cómo le fue hoy…"
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                clearError("text");
              }}
              className={`w-full min-h-[120px] resize-y py-[14px] px-4 rounded-[14px] border-[1.5px] bg-white text-[15px] text-[#3F362E] leading-[1.5] ${
                errors.text ? "border-[#D9583C]" : "border-[#EADFD0]"
              }`}
            />
            {errors.text ? <p className={ERROR_CLASS}>{errors.text}</p> : null}
          </div>

          <div>
            <div className={LABEL_CLASS}>FOTOS</div>
            {/* Drop zone: thumbs + "Agregar" tile. dragenter/leave counter
                keeps the highlight stable over nested elements. */}
            <div
              className="flex flex-wrap gap-3"
              onDragEnter={(event) => {
                event.preventDefault();
                dragDepth.current += 1;
                setDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                dragDepth.current -= 1;
                if (dragDepth.current === 0) setDragging(false);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                dragDepth.current = 0;
                setDragging(false);
                void addFiles(event.dataTransfer.files);
              }}
            >
              {photos.map((photo, index) => (
                <div
                  key={`${index}-${photo.length}`}
                  className="relative w-24 h-24 rounded-[14px] border border-[#ECE0D0] overflow-hidden bg-[#F4ECE1]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt={`Foto ${index + 1} de la publicación`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    aria-label={`Quitar foto ${index + 1}`}
                    className="absolute top-1 right-1 flex items-center justify-center w-[20px] h-[20px] rounded-full bg-white/90 text-[#3F362E] cursor-pointer"
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-[6px] w-24 h-24 rounded-[14px] border-[1.5px] border-dashed bg-[#F4ECE1] text-[#B0A290] cursor-pointer ${
                    dragging ? "border-[#C5503A]" : "border-[#DBCDBA]"
                  }`}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C5503A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span className="text-[12px]">Agregar</span>
                </button>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                if (event.target.files) void addFiles(event.target.files);
                event.target.value = ""; // allows re-selecting the same file
              }}
            />
            {photoLimitError ? <p className={ERROR_CLASS}>{photoLimitError}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
