# SPEC 01 — Home: pantalla Feed (visual)

> **Status:** Aprobado
> **Depends on:** ninguna
> **Date:** 2026-11-14
> **Objective:** Implementar el Feed de `references/pantallas/feed.dc.html` como home (`/`) con datos mock tipados y estilo idéntico al comp, incluyendo una adaptación responsive básica (top bar en mobile).

## Por qué existe esta spec

Es la primera pantalla del proyecto y define la base que heredarán las demás: tipografías, tokens de color, sidebar compartido y estructura de datos mock. Sin auth ni BD, todo es cáscara visual con datos hardcodeados.

## Scope

**In:**

- Ruta `/` con el Feed completo del comp: saludo, composer falso, separador "PUBLICADO HOY" y los 3 posts (logro, actividad con placeholder de foto, anuncio).
- Sidebar compartido en `app/layout.tsx`: logo + "Sala Soles", botón "Nueva publicación", nav (Feed activo, Niños, Avisos, Mi cuenta), usuario y logout.
- Top bar mínima visible solo en `<1024px` (logo + botón compacto "Nueva publicación"); sidebar oculto en mobile.
- Tipografías Fredoka y Nunito vía `next/font/google`.
- Tokens del comp en `app/globals.css`; se elimina el dark mode del scaffold.
- Datos mock tipados en `app/data/feed.ts`.
- `<html lang="es">` y metadata "OpenDayCare".

**Out of scope (for future specs):**

- Autenticación (login, sesión, logout real) y base de datos.
- Las demás rutas (crear-publicación, niños, avisos, mi cuenta, detalle, foto, login): quedan como links muertos `#`.
- Interactividad de corazones, comentarios y editar: solo contadores estáticos.
- Upload real de fotos: el placeholder del comp se replica tal cual.
- Responsive completo (menú hamburguesa, nav en mobile, layouts tablet).

## Data model

```ts
// app/data/feed.ts
export type PostType = "achievement" | "activity" | "announcement";

export interface Actor {
  name: string;            // "Mateo" | "Anuncio general"
  initials: string;        // "M"
  backgroundColor: string; // "#A9D9E8"
  textColor: string;       // "#1F7A93"
}

export interface Post {
  id: string;
  type: PostType;
  author: Actor;
  time: string;               // "14:20"
  publishedByYou: boolean;    // true en los 3 del comp
  audience: string;           // "familia de Mateo" | "toda la sala"
  text: string;
  photoPlaceholder?: string;  // "Foto · pintando con témperas"
  hearts: number;
  comments: number;
}

export interface Classroom { name: string; childrenCount: number; date: string } // "Sala Soles", 12, "martes 17 jun"
export interface StaffUser { name: string; role: string; initials: string }      // "Caro Giménez", "Maestra · Soles", "C"
```

Convención: identificadores y valores del union en inglés (regla de código de `AGENTS.md`); el copy visible en UI (labels de badge LOGRO/ACTIVIDAD/ANUNCIO, textos, fecha) queda en español vía un map `type → label` en el componente.

Tokens del comp (única fuente para clases): fondo `#F6ECDF` · superficie `#FFFDF9` · borde `#ECE0D0` · texto principal `#3F362E` · secundario `#A89A8B`/`#94887B` · cuerpo `#4A4038` · coral CTA gradiente `#F4977E→#EE8164` · acento `#E0654A` · editar `#C5503A` · nav activo `#FBE3D8`/`#D9583C` · dividers `#E7DAC8`/`#F0E6D8` · foto placeholder `#F4ECE1`/`#DBCDBA`/`#B0A290` · badges: logro `#CFEBD8`/`#3E9B6C`, actividad `#C7E7F1`/`#2E89A6`, anuncio `#CCD8F4`/`#4E72C8`.

## Implementation plan

1. Reescribir `app/globals.css`: mantener `@import "tailwindcss"`, mapear `--font-sans: var(--font-nunito)` y `--font-display: var(--font-fredoka)` en `@theme inline`, base del body (fondo, color, antialias), scrollbar webkit del comp; eliminar dark mode y variables del scaffold.
2. `app/layout.tsx`: cargar Fredoka (400–700) y Nunito (400–800) con `next/font/google`, `lang="es"`, metadata "OpenDayCare", y armar el shell: contenedor flex que en desktop es fila (aside + main con scroll propio `h-screen overflow-y-auto`) y en `<lg` columna con la top bar arriba.
3. Crear `app/data/feed.ts` con los tipos de arriba y el mock exacto del comp (sala, usuario, 3 posts).
4. Crear `app/components/sidebar.tsx` (248px, sticky, fondo superficie, botón CTA con gradiente, nav con Feed activo, bloque usuario + logout) e integrarlo al layout (`hidden lg:flex`).
5. Crear `app/components/top-bar.tsx` (logo + CTA compacto, `lg:hidden`) e integrarlo al layout.
6. Crear `app/components/post-card.tsx`: avatar (iniciales o megáfono SVG para anuncio), nombre en Fredoka, hora + "publicado por vos", badge por tipo, destinatario, texto, placeholder de foto opcional y footer (corazón relleno `#E0654A` + contador, comentarios, "Editar").
7. Reescribir `app/page.tsx`: kicker "GUARDERÍA · SALA SOLES", "Buenas, Caro" en Fredoka 30px, línea "12 niños · martes 17 jun", composer falso, divider "PUBLICADO HOY" y listado de posts desde el mock.

## Acceptance criteria

- [ ] Al abrir `http://localhost:3000/` se renderiza el feed (no el scaffold de create-next-app)
- [ ] `/` carga sin errores en consola con `npm run dev`.
- [ ] A 1280px el layout coincide con el comp: sidebar 248px sticky, main con scroll propio, contenido centrado max 760px con padding 34/40/80.
- [ ] Títulos y avatares renderizan en Fredoka y el cuerpo en Nunito, vía `next/font` (sin flash de fuente sin estilo).
- [ ] Los 3 posts muestran badges y colores exactos por tipo (logro/actividad/anuncio según la tabla de tokens).
- [ ] El placeholder de foto replica borde dashed, fondo, ícono cámara y caption "Foto · pintando con témperas".
- [ ] Ningún link interno navega a una 404: todos apuntan a `#`.
- [ ] A 375px no hay scroll horizontal, se ve la top bar (logo + Nueva publicación) y el feed ocupa el ancho con padding reducido.
- [ ] `npx tsc --noEmit` pasa.
- [ ] ESLint no agrega errores en los archivos tocados (el fallo preexistente de `references/pantallas/support.js` no cuenta).

## Decisions

- **Sí:** Tailwind con valores arbitrarios (`w-[248px]`, `bg-[#FFFDF9]`) — decisión del usuario; fidelidad exacta y consistente con el stack.
- **Sí:** sidebar en `app/layout.tsx` — decisión del usuario; las pantallas futuras lo heredan.
- **Sí:** mock tipado en `app/data/feed.ts` — decisión del usuario; la BD futura reemplaza la fuente sin tocar UI.
- **Sí:** identificadores de código en inglés (`PostType`, `Classroom`, `StaffUser`, `"achievement" | "activity" | "announcement"`), copy de UI en español — regla de código de `AGENTS.md`.
- **Sí:** links muertos `href="#"` — decisión del usuario; cada pantalla tendrá su spec.
- **Sí:** responsive básico con top bar mínima en `<1024px` — decisión del usuario; breakpoint `lg` porque sidebar (248) + contenido (760) + paddings ya saturan 1024px.
- **Sí:** `next/font/google` en vez del `<link>` del comp — self-hosted, sin layout shift, mismo render.
- **Sí:** eliminar el dark mode del scaffold — el comp define una paleta clara única.
- **Sí:** SVGs inline copiados del comp — cero dependencias nuevas.
- **Sí:** fecha ("martes 17 jun") y contadores como mock fijo — se dinamizan cuando haya BD.
- **No:** `lucide-react` u otra lib de íconos — no hace falta para 8 SVGs.
- **No:** páginas stub de las otras rutas — fuera de alcance.
- **No:** interactividad (corazones, comentarios, editar, logout) — cáscara visual.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| `next/font` necesita red la primera vez para descargar las fuentes | Descarga única, cacheada en `.next`; fuentes estándar de Google Fonts |
| Deriva de fidelidad al traducir inline styles → clases | Criterio de aceptación: comparación lado a lado contra `feed.dc.html` a 1280px |
| El shell cambia de fila a columna en `<lg` y puede romper el scroll propio del main | Definido explícitamente en el paso 2 del plan |

## What is **not** in this spec

- Autenticación, base de datos, las demás rutas, interactividad de acciones, upload real de fotos y responsive completo. Cada una, si llega, va en su propio spec.
