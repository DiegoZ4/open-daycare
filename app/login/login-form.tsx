"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

// Exact control styling from login.dc.html: 14px/16px padding, 1.5px #EADFD0
// border, 14px radius, 15px text. Kept local per SPEC 03 — this comp uses 700
// labels and 14/16 padding, unlike the shared form-field.tsx (800, 13/16).
const inputClass =
  "w-full py-[14px] px-4 rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-[15px] text-[#3F362E]";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // Generic message on purpose: we never reveal which field failed.
      setError("Email o contraseña incorrectos.");
      setSubmitting(false);
      return;
    }

    router.replace("/");
  }

  return (
    <form onSubmit={handleSubmit} noValidate={false}>
      <div className="mb-2 text-[12px] font-bold tracking-[0.7px] text-[#94887B]">
        EMAIL
      </div>
      <input
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className={`${inputClass} mb-[18px]`}
      />

      <div className="mb-2 text-[12px] font-bold tracking-[0.7px] text-[#94887B]">
        CONTRASEÑA
      </div>
      <input
        type="password"
        required
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className={`${inputClass} mb-[10px]`}
      />

      <div className="mb-5 text-right">
        {/* Dead link: no password-reset comp exists yet (SPEC 03). */}
        <a href="#" className="text-[13.5px] font-bold text-[#C5503A]">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      {error && (
        <p className="mb-4 text-[13.5px] font-bold text-[#C5503A]">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="block w-full rounded-[15px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] py-[15px] text-center text-[16px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        Iniciar sesión
      </button>
    </form>
  );
}
