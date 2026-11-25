# SPEC 06 — Modal de nueva publicación (feed con fotos reales)

> **Status:** Implementado
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-11-25
> **Objective:** Abrir `crear-publicacion.dc.html` como modal fiel a su diseño que publica al feed con destinatarios multi-select, los 7 tipos del comp, descripción obligatoria y hasta 4 fotos agregadas desde el explorador de archivos o por drag & drop, persistidas en memoria.

## Scope

**In:**

- Componente `NewPostModal` (client) fiel al comp: card de **580px** `#FBF4EC` radio 24 con header **Cancelar** (izq, `#94887B` bold 15px) / título **"Nueva publicación"** (display 18px 600) / **Publicar** (der, `#D9583C` extrabold 15px), borde inferior `#ECE0D0`, cuerpo con padding 24px 26px.
- Comportamiento modal idéntico a SPEC 04/05: overlay `rgba(63,54,46,0.5)`, click fuera, tecla **Esc** y "Cancelar" cierran descartando lo tipeado.
- Sección **PARA**: chips multi-select de los 8 niños (avatar circular 26px con inicial + nombre) y chip **"Toda la sala"** que selecciona a todos; seleccionado: borde y bg `#3F362E` con texto blanco (como "Mateo" en el comp); no seleccionado: borde `#ECE0D0`, bg `#FFFDF9`, texto `#6E6359`.
- Sección **TIPO**: 7 pills con los colores pastel del comp — Comida `#F7E7A6`/`#9A7B1E`, Siesta `#E7DCF6`/`#7B5FC0`, Actividad `#C7E7F1`/`#2E89A6`, Logro `#CFEBD8`/`#3E9B6C`, Ánimo `#F9D2DE`/`#C56486`, Foto `#FBD8CC`/`#D9684A`, Anuncio `#CCD8F4`/`#4E72C8`; la pill elegida pasa a fondo `#3F362E` con texto blanco (decisión del usuario; el comp no deja clara la selección).
- Sección **DESCRIPCIÓN**: textarea required, placeholder "Contá cómo le fue hoy…", min-height 120px, resize vertical, input blanco borde 1.5 `#EADFD0` radio 14.
- Sección **FOTOS**: hasta **4** fotos; tile "Agregar" (96px dashed `#DBCDBA` bg `#F4ECE1`, ícono + `#C5503A`) abre el **explorador de archivos** (input file oculto, `accept="image/*"` y `multiple`); además la zona de fotos acepta **drag & drop** con highlight del tile mientras se arrastra; cada foto se previsualiza como thumb 96px radio 14 con botón **X** para quitarla.
- Validaciones required al Publicar (borde `#D9583C` + mensaje en español debajo del grupo, el modal no se cierra): al menos un destinatario → "Elegí al menos un destinatario.", tipo → "Elegí un tipo de publicación.", descripción vacía → "La descripción es obligatoria.". Sin defaults: al abrir no hay nada seleccionado.
- Modelo: `PostType` se expande a los 7 tipos (`meal`, `nap`, `activity`, `achievement`, `mood`, `photo`, `announcement`); `Post` gana `photos?: string[]` (data URLs); `PostCard` renderiza la grilla de fotos reales cuando existe (1 foto → imagen ancha; 2–4 → grilla 2×2) y conserva el placeholder dashed para posts viejos sin fotos; el badge map se completa con COMIDA, SIESTA, ÁNIMO y FOTO.
- Server action en memoria (`app/actions/feed.ts`): `createPost(input)` hace push del post nuevo **arriba** del array `posts`, con hora actual (`HH:MM`), `publishedByYou: true`, hearts y comments en 0, e `id` único; hace `revalidatePath("/")`. Autoría: author = **primer niño seleccionado** (nombre corto, avatar del niño); si es para toda la sala → author **"Anuncio general"** con megáfono, como el post existente. `audience`: "familia de X" (1 niño), "familias de X y Y" (2), "familias de X, Y y Z" (3+), "toda la sala".
- Punto de entrada: el CTA **"Nueva publicación" del sidebar** (hoy link muerto) pasa a un client wrapper que abre el modal sobre la página actual.

**Out of scope (for future specs):**

- Edición de posts (el "Editar" del card sigue muerto), likes y comentarios funcionales.
- Persistencia real (fs/BD/localStorage): los posts y sus data URLs viven en memoria y se pierden al reiniciar el dev server (decisión de SPEC 04, vigente).
- Compresión/resize de imágenes, video, y galería lightbox al hacer click en una foto.
- Notificaciones o visibilidad real por familia (el `audience` es un string de display).

## Data model

```ts
// app/data/feed.ts (cambios)
export type PostType =
  | "meal" | "nap" | "activity" | "achievement" | "mood" | "photo" | "announcement";

export interface Post {
  // ...igual que hoy, más:
  photos?: string[]; // data URLs (máx 4) — posts creados desde el modal
}
```

```ts
// app/actions/feed.ts (nuevo, "use server")
export interface NewPostInput {
  childIds: string[]; // ids de app/data/children; vacío si allRoom
  allRoom: boolean;
  type: PostType;
  text: string;
  photos: string[]; // data URLs, máx 4
}

export async function createPost(input: NewPostInput): Promise<void>;
// → push al inicio del array posts + revalidatePath("/")
```

```ts
// Paleta de pills TIPO compartida entre modal y badges
export const POST_TYPES: Array<{ key: PostType; label: string; bg: string; text: string }>;
// COMIDA #F7E7A6/#9A7B1E · SIESTA #E7DCF6/#7B5FC0 · ACTIVIDAD #C7E7F1/#2E89A6
// LOGRO #CFEBD8/#3E9B6C · ÁNIMO #F9D2DE/#C56486 · FOTO #FBD8CC/#D9684A · ANUNCIO #CCD8F4/#4E72C8
```

## Implementation plan

1. Modelo en `app/data/feed.ts`: expandir `PostType`, agregar `photos?: string[]` y exportar `POST_TYPES` (labels + colores pastel). Regresión sin cambios visuales; `npx tsc --noEmit` obliga a completar el badge map.
2. `app/components/post-card.tsx`: completar `POST_TYPE_BADGE` con los 4 tipos nuevos (labels COMIDA/SIESTA/ÁNIMO/FOTO) y renderizar `post.photos` como grilla (1 → ancha; 2–4 → 2×2) antes del placeholder.
3. `app/actions/feed.ts` con `createPost`: resolución de author (primer niño con nombre corto y avatar; "Anuncio general" + megáfono si toda la sala), `audience`, hora actual `HH:MM`, id único y `revalidatePath("/")`.
4. Crear `app/components/new-post-modal.tsx`: comportamiento de modal de SPEC 05, secciones PARA/TIPO/DESCRIPCIÓN/FOTOS, validaciones required, input file oculto + drag & drop con highlight, previews 96px con X, límite de 4 con mensaje "Podés agregar hasta 4 fotos.".
5. Sidebar: nuevo `app/components/new-post-button.tsx` (client) que reemplaza el `<a href="#">` "Nueva publicación" y abre el modal. Manual: publicar "Actividad" para Mateo y Sofía con 2 fotos → modal cierra, el feed muestra el post arriba con badge ACTIVIDAD, "Para: familias de Mateo y Sofía" y las fotos reales.
6. Verificación final: `npx tsc --noEmit` + lint de los archivos tocados + comparación visual del modal contra `references/pantallas/crear-publicacion.dc.html` con Playwright (screenshots en `./playwright-mcp`).

## Acceptance criteria

- [x] El CTA "Nueva publicación" del sidebar abre el modal y ya no es un link muerto.
- [x] El modal es fiel al comp: card 580px `#FBF4EC` radio 24, header Cancelar/"Nueva publicación"/Publicar, y las 4 secciones PARA, TIPO, DESCRIPCIÓN y FOTOS con los estilos exactos.
- [x] "Cancelar", el click en el overlay y la tecla Esc cierran el modal sin publicar nada.
- [x] Al abrir el modal no hay nada preseleccionado (ni PARA, ni TIPO).
- [x] Los chips de PARA son multi-select: se pueden marcar varios niños; "Toda la sala" los selecciona todos y desmarcar un niño la apaga.
- [x] La pill de TIPO elegida queda con fondo `#3F362E` y texto blanco; las demás conservan su pastel.
- [x] Publicar sin destinatario, tipo o descripción marca cada grupo con borde `#D9583C` y su mensaje en español; el modal no se cierra.
- [x] El tile "Agregar" abre el explorador de archivos filtrado a imágenes y permite seleccionar varias a la vez.
- [x] Arrastrar imágenes sobre la zona de fotos resalta el tile y al soltarlas se agregan como previews; soltar archivos que no son imagen no agrega nada.
- [x] Al intentar agregar una 5ª foto (explorador o drag) no se agrega y se muestra "Podés agregar hasta 4 fotos.".
- [x] Cada preview tiene una X que quita la foto; tras quitar una se pueden volver a agregar.
- [x] Publicación válida: el modal se cierra y el feed muestra el post nuevo arriba con hora actual, "publicado por vos", badge del tipo elegido, author = primer niño seleccionado (o "Anuncio general" con megáfono si fue toda la sala), audience correcto, descripción y la grilla de fotos reales; hearts y comments en 0.
- [x] "Toda la sala" + Anuncio genera un post con author "Anuncio general" y audience "toda la sala", igual al post de anuncio existente.
- [x] El post y sus fotos persisten en memoria mientras el dev server no reinicie (mismo comportamiento que SPEC 04).
- [x] Regresión: `/` y `/children` renderizan visualmente igual que antes de esta spec, salvo los posts nuevos.
- [x] `npx tsc --noEmit` pasa.
- [x] ESLint no agrega errores en los archivos tocados (el fallo preexistente de `references/pantallas/support.js` no cuenta).

## Decisions

- **Sí:** los 7 tipos del comp con migración del `PostType` y badges nuevos COMIDA/SIESTA/ÁNIMO/FOTO — decisión del usuario; los colores pastel se toman del comp y del feed existente.
- **Sí:** destinatario multi-select con "Toda la sala" que selecciona a todos — decisión del usuario; el `audience` de display se compone con los nombres cortos.
- **Sí:** author = primer niño seleccionado; toda la sala → "Anuncio general" con megáfono — decisión del usuario; reutiliza la semántica y el render actual de `PostCard` sin rediseñar la card.
- **Sí:** pill TIPO seleccionada = fondo `#3F362E` + texto blanco — decisión del usuario (el comp deja ambigua la selección; se replica el estado seleccionado de los chips PARA).
- **Sí:** fotos máx 4 como data URLs en memoria, agregadas por explorador o drag & drop — decisión del usuario; el límite evita data URLs gigantes en el mock.
- **Sí:** sin defaults, todo required (destinatario, tipo, descripción) — decisión del usuario; evita publicar por accidente al destinatario equivocado.
- **Sí:** punto de entrada único por el sidebar — decisión del usuario; el feed no cambia.
- **No:** edición de posts, likes/comentarios, compresión de imágenes, lightbox, persistencia real — cada una, si llega, va en su propio spec.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Con `cacheComponents: true`, el feed (server component) puede no refrescar tras `createPost` | `revalidatePath("/")`; si no refresca, releer `node_modules/next/dist/docs/01-app/01-app.../08-caching.md` y ajustar |
| Data URLs de fotos pesadas inflan el payload del server action y la memoria | Máx 4 fotos (decisión del usuario); con BD real se reemplaza por storage sin tocar la UI |
| El navegador abre la imagen soltada fuera de la página si no se previene | `preventDefault` en `dragover` y `drop` de la dropzone |
| Expandir `PostType` puede dejar switches incompletos | El badge map `Record<PostType, …>` en `PostCard` obliga a `tsc` a fallar si falta un tipo |
| Drag & drop en notebooks con touchpad genera `dragenter/leave` anidados que parpadean el highlight | Contador de `dragenter/leave` en la dropzone |
| Estado en memoria se pierde al reiniciar/HMR | Aceptado (decisión de SPEC 04, vigente) |

## What is **not** in this spec

- Edición de posts, likes y comentarios, compresión de imágenes, lightbox de galería, persistencia real (fs/BD/localStorage), notificaciones por familia y responsive del modal. Cada una, si llega, va en su propio spec.
