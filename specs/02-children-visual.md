# SPEC 02 — Niños: listado, alta y perfil (visual)

> **Status:** Implementado
> **Depends on:** SPEC 01
> **Date:** 2026-11-17
> **Objective:** Implementar el listado de niños (`/children`), el alta (`/children/new`) y el perfil dinámico (`/children/[id]`) como cáscara visual fiel a los comps, refactorizando el shell compartido a un route group.

## Por qué existe esta spec

Es la primera spec multi-pantalla y define tres bases que heredan las demás: la convención de rutas en inglés (`/children`), el ítem activo del sidebar según la ruta, y la extracción del shell a un route group para que pantallas sueltas (como el alta, que no lleva sidebar) puedan vivir fuera de él.

## Scope

**In:**

- Ruta `/children` con el listado de `ninos.dc.html`: header (kicker "GESTIÓN", título "Niños" en Fredoka, CTA coral "Agregar niño"), buscador estático, divider "SALA SOLES · 8 niños" y grilla de 8 cards (2 columnas → 1 en mobile) con hover (borde `#F2A78E` + `translateY(-2px)`).
- Ruta `/children/new` con el alta de `agregar-nino.dc.html`: card centrada de 520px **sin sidebar ni top bar**, header Cancelar / "Agregar niño" / Guardar y los 5 campos: nombre completo, fecha de nacimiento (input de texto con placeholder "dd/mm/aaaa"), sala (select falso "Soles" + chevron), alergias y notas médicas (textarea).
- Ruta dinámica `/children/[id]` con el perfil de `perfil-nino.dc.html`: "Volver a Niños", header (avatar 84px, nombre en Fredoka 28px, "3 años · Sala Soles", botón "Editar" → `/children/new`), caja "Alergias y notas" (solo en niños con datos), card de info (fecha de nacimiento, sala, ingreso) y columna derecha con "Resumen del día" (botón oscuro `#3F362E`, link muerto) y "PADRES VINCULADOS" (chips ACTIVA/PENDIENTE y "Vincular otro padre" muerto).
- Refactor del shell: extraer sidebar + top bar de `app/layout.tsx` a `app/(staff)/layout.tsx`; el layout raíz queda solo con html, body, fuentes y metadata; el Feed se muda de `app/page.tsx` a `app/(staff)/page.tsx`.
- Sidebar con ítem activo por ruta (`usePathname`): "Niños" activo en `/children` (incluye `/children/[id]`), "Feed" activo en `/`; "Niños" pasa de link muerto a link real.
- Navegación real entre pantallas existentes: CTA "Agregar niño" → `/children/new`; "Cancelar" y "Guardar" → `/children`; las cards del listado → `/children/{id}`.
- Mock tipado en `app/data/children.ts` con los 8 niños del comp, extendido con `birthDate`, `enrollment`, `medicalNotes` y `parents[]` para los 8 (coherente con `parentsSummary`).
- `generateStaticParams` con los 8 ids, `notFound()` para ids desconocidos y `generateMetadata` ("{nombre} · OpenDayCare").
- Metadata de título por página: "Niños · OpenDayCare" y "Agregar niño · OpenDayCare".

**Out of scope (for future specs):**

- Filtrado real del buscador, validación y guardado del alta, select de sala interactivo.
- Resumen del día (`resumen-dia.dc.html`), vincular padre (`vincular-padre.dc.html`) y edición real del niño: siguen como links muertos `#` hasta sus specs.
- Traducción de la UI al inglés (el copy visible queda en español, como los comps).
- Las demás rutas (crear-publicación, avisos, mi cuenta, login): siguen `#`.
- Responsive completo (nav mobile, menú hamburguesa, layouts tablet).

## Data model

```ts
// app/data/children.ts
export interface Parent {
  name: string;                  // "Lucía Fernández"
  initials: string;              // "L"
  avatarBackgroundColor: string; // "#C9B6E8" (texto siempre blanco)
  relationship: string;          // "Mamá" | "Papá"
  status: "active" | "pending";
  statusLabel: string;           // "activa" | "invitación enviada"
}

export interface Child {
  id: string;                    // "mateo-fernandez"
  name: string;                  // "Mateo Fernández"
  initials: string;              // "M"
  avatarBackgroundColor: string; // "#A9D9E8"
  avatarTextColor: string;       // "#1F7A93"
  age: string;                   // "3 años"
  parentsSummary: string;        // "2 padres vinculados" | "1 padre vinculado" | "sin padres vinculados"
  allergyTag?: string;           // "MANÍ" | "LACTOSA"
  needsParentLink?: boolean;     // true → chip "VINCULAR" (Valentina)
  birthDate: string;             // "12 mar 2022"
  enrollment: string;            // "feb 2025"
  medicalNotes?: string;         // "Alergia al maní. Evitar frutos secos…"
  parents: Parent[];             // coherente con parentsSummary (2/1/0)
}

export interface ClassroomSummary {
  name: string;          // "Sala Soles" (se muestra como "SALA SOLES" vía CSS)
  childrenCount: number; // 8
}
```

Convención: identificadores en inglés, valores de copy en español (igual que `feed.ts`). Nota: el listado usa 8 niños pero el header del Feed dice "12 niños"; esa discrepancia está en los comps originales y se unifica cuando haya BD. Los datos de perfil de los 7 niños que no están en el comp se inventan como mock plausible.

Tokens nuevos (además de los de la spec 01): contenido listado max-width **880px** y perfil **820px** con padding 34/40/80 · buscador: fondo `#FFFDF9`, borde `#ECE0D0`, radio 14, lupa `#B0A290`, placeholder `#B6A99B` · card niño: radio 18, padding 16, sombra `0 4px 14px -12px rgba(120,90,60,.5)` · avatares 48px Fredoka 19px con paleta por niño: M/L `#A9D9E8`/`#1F7A93`, S/E `#F4B8CC`/`#C44A7A`, B/O `#B9DEC4`/`#3E8B62`, V `#F4DC8E`/`#9A7B1E`, T `#C9B6E8`/`#7B5FC0` · chip alergia `#FBD8CC`/`#D9684A`, chip VINCULAR `#F9D2DE`/`#C56486`, chevron `#CBB89F` · alta: card `#FBF4EC` radio 24, sombra `0 20px 50px -24px rgba(63,54,46,.35)` · labels 12px 800 ls .7 `#94887B` · inputs: fondo `#fff`, borde 1.5 `#EADFD0`, radio 14, placeholder `#B6A99B` · perfil: avatar 84px Fredoka 34px, h1 28px, "Volver a Niños" `#94887B` 700 14px con chevron, botón Editar (borde 1.5 `#ECE0D0`, fondo `#FFFDF9`, texto `#6E6359`, radio 12, padding 9/16), caja alergias fondo `#FBDAD6` radio 16 con ícono `#F4A8A0` (triángulo blanco), título `#C5413A` 800 15px, texto `#B25249` 14.5 lh 1.5, info card filas padding 15/18 con dividers `#F0E6D8` (label `#94887B`, valor 800 `#3F362E`), botón "Resumen del día" fondo `#3F362E` blanco 800, kicker padres 12.5 800 ls .8 `#8A7C6D`, avatar padre 40px Fredoka 16px texto blanco, chip ACTIVA `#CFEBD8`/`#3E9B6C` y chip PENDIENTE `#F7E7A6`/`#9A7B1E` (10.5px 800, padding 4/9, radio 999), "Vincular otro padre" círculo dashed 40px `#D8CBBA` con ícono `#B0A290` y texto `#C5503A`.

## Implementation plan

1. Refactor de layouts (leyendo antes las docs locales de route groups en `node_modules/next/dist/docs/`): `app/layout.tsx` queda mínimo (html, fuentes, metadata); crear `app/(staff)/layout.tsx` con el shell actual; mover `app/page.tsx` → `app/(staff)/page.tsx`. Manual: `/` renderiza idéntico a antes.
2. Sidebar activo por ruta: nav data-driven + `usePathname` (componente cliente); "Niños" → `/children`. Manual: `/` muestra "Feed" activo.
3. Crear `app/data/children.ts` con los tipos y los 8 niños del comp.
4. Crear `app/components/child-card.tsx`: avatar con colores del mock, nombre en Fredoka, meta, y derecha condicional (chip alergia / chip VINCULAR / chevron) + hover.
5. Crear `app/(staff)/children/page.tsx`: header con CTA → `/children/new`, buscador inline, divider, grilla responsive 2→1 columna, metadata de título.
6. Crear `app/components/form-field.tsx` (label + control con estilos del comp) y `app/children/new/page.tsx`: card 520px centrada, header con Cancelar y Guardar → `/children`, los 5 campos (fecha como input de texto, sala como div falso), metadata de título. Las fuentes vienen del layout raíz.
7. Extender `app/data/children.ts`: interfaz `Parent` y campos nuevos de `Child` (`birthDate`, `enrollment`, `medicalNotes`, `parents`) con datos plausibles para los 8 niños, coherentes con `parentsSummary` (2/1/0 padres). Sin cambios de UI: listado y alta siguen igual.
8. Crear `app/(staff)/children/[id]/page.tsx` (leyendo antes las docs locales de dynamic routes y caching): `PageProps<'/children/[id]'>` con `await params`, `generateStaticParams` con los 8 ids, `notFound()` para ids desconocidos, `generateMetadata` ("{nombre} · OpenDayCare") y render fiel al comp. En el mismo paso, `ChildCard` pasa de `href="#"` a `Link href="/children/{id}"` para no dejar links a 404 en el estado intermedio. Manual: card → perfil → "Volver a Niños"; `/children/mateo-fernandez` ok y un id inexistente → 404.

## Acceptance criteria

- [x] Al abrir `http://localhost:3000/children` se renderiza el listado (kicker "GESTIÓN", título "Niños", CTA "Agregar niño", buscador, divider "SALA SOLES · 8 niños" y 8 cards).
- [x] `/children`, `/children/new` y `/children/[id]` cargan sin errores en consola con `npm run dev`.
- [x] A 1280px el listado coincide con el comp: contenido 880px con padding 34/40/80, grilla de 2 columnas con gap 14, cards con radio 18 y sombra exacta.
- [x] Los 8 avatares usan la paleta exacta del comp por niño (pares de color por iniciales).
- [x] Chips y chevrons exactos: MANÍ y LACTOSA (`#FBD8CC`/`#D9684A`), VINCULAR (`#F9D2DE`/`#C56486`), chevron `#CBB89F` en el resto.
- [x] El hover de las cards aplica borde `#F2A78E` + `translateY(-2px)` con transición de .15s.
- [x] El sidebar marca "Niños" activo en `/children` (y en `/children/[id]`) y "Feed" activo en `/`, y ambos links navegan entre sí.
- [x] Al abrir `/children/new` se renderiza la card centrada de 520px **sin sidebar ni top bar**, con header Cancelar / "Agregar niño" / Guardar y los 5 campos con placeholders exactos ("Ej. Martina López", "dd/mm/aaaa", "Soles" + chevron, "Ej. Maní, Lactosa", "Indicaciones, medicación, contactos…").
- [x] "Agregar niño" (listado), "Cancelar" y "Guardar" (alta) navegan entre `/children` ↔ `/children/new`; no hay lógica de guardado.
- [x] Las 8 cards del listado navegan a `/children/{id}` (links reales, sin `#`).
- [x] `/children/mateo-fernandez` renderiza el perfil fiel al comp a 1280px: contenido 820px con padding 34/40/80, "Volver a Niños" → `/children`, avatar 84px con los colores del niño, nombre Fredoka 28px, "3 años · Sala Soles" y botón "Editar" → `/children/new`.
- [x] Caja "Alergias y notas" con colores exactos (fondo `#FBDAD6`, ícono `#F4A8A0`, título `#C5413A`, texto `#B25249`) y card de info con las 3 filas (Fecha de nacimiento, Sala, Ingreso) y dividers `#F0E6D8`.
- [x] Columna derecha: botón "Resumen del día" (`#3F362E`) y "PADRES VINCULADOS" con chips ACTIVA (`#CFEBD8`/`#3E9B6C`) y PENDIENTE (`#F7E7A6`/`#9A7B1E`) y "Vincular otro padre" con círculo dashed.
- [x] Los 8 perfiles renderizan con data coherente: cantidad de padres acorde a `parentsSummary` y caja de alergias solo en niños con datos.
- [x] Un id inexistente (ej. `/children/pepito`) devuelve 404.
- [x] `/children/new` sigue resolviendo al alta (la ruta estática tiene precedencia sobre `[id]`).
- [x] El título de la pestaña es "{nombre} · OpenDayCare" en el perfil (generateMetadata).
- [x] A 375px: `/children` sin scroll horizontal, con top bar y grilla de 1 columna; `/children/new` sin scroll horizontal, card a ancho completo con padding lateral reducido; el perfil apila las columnas sin scroll horizontal.
- [x] Los links a pantallas futuras siguen muertos (`#`): Resumen del día, Vincular otro padre, Avisos, Mi cuenta, Nueva publicación y logout.
- [x] El Feed (`/`) no se rompe tras el refactor: "Feed" activo, contenido de 760px y los 3 posts intactos (regresión de la spec 01).
- [x] `npx tsc --noEmit` pasa.
- [x] ESLint no agrega errores en los archivos tocados (el fallo preexistente de `references/pantallas/support.js` no cuenta).

## Decisions

- **Sí:** rutas en inglés (`/children`, `/children/new`, `/children/[id]`) — decisión del usuario; sienta el precedente para las demás pantallas.
- **Sí:** copy visible de la UI en español — decisión del usuario, confirmada; los comps y la spec 01 se mantienen tal cual.
- **Sí:** el alta como página sin shell — decisión del usuario; fiel al comp, requiere extraer el shell a `app/(staff)/layout.tsx`.
- **Sí:** sidebar con ítem activo por ruta vía `usePathname` — patrón active-link de Next; necesario para fidelidad al comp.
- **Sí:** "Cancelar" y "Guardar" navegan a `/children` como en el comp — decisión del usuario; links reales sin lógica.
- **Sí:** buscador estático sin filtrado — decisión del usuario; cáscara pura.
- **Sí:** mock tipado en `app/data/children.ts` — la BD futura reemplaza la fuente sin tocar UI.
- **Sí:** grilla 2 columnas → 1 en mobile — responsive básica, patrón de la spec 01.
- **Sí:** select de sala como div falso ("Soles" + chevron) — réplica exacta del comp, sin interactividad.
- **Sí:** metadata de título por página ("Niños · OpenDayCare", "Agregar niño · OpenDayCare", "{nombre} · OpenDayCare").
- **Sí:** perfil del niño en `/children/[id]` dentro de esta spec — enmienda del 18/11 a pedido del usuario (originalmente postergada); las cards del listado pasan de `#` a links reales.
- **Sí:** botón "Editar" → `/children/new` — fidelidad al comp (apunta a agregar-nino); la edición real va en su spec.
- **Sí:** mock completo para los 8 niños — decisión del usuario; padres coherentes con `parentsSummary` (2/1/0) y datos de perfil inventados donde el comp no define.
- **Sí:** `generateStaticParams` + `notFound()` — los 8 ids prerenderizados, 404 para cualquier otro.
- **No:** traducir la UI al inglés — el copy queda en español como los comps.
- **No:** filtrado del buscador, validación o guardado del alta — cáscara visual.
- **No:** edición real del niño, Resumen del día ni vinculación de padres — specs futuras; esos links quedan en `#`.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| `app/(staff)/children/page.tsx` y `app/children/new/page.tsx` comparten el segmento `children` en niveles distintos del árbol de rutas | Next.js lo permite porque las URLs finales no colisionan; verificar con el dev server en el paso 1 y, si fallara, mover el alta a un grupo propio o a ruta plana |
| `/children/new` podría ser capturado por el segmento dinámico `[id]` | La ruta estática tiene precedencia sobre la dinámica en Next; se verifica tras el paso 8 |
| `cacheComponents: true` + `params` en rutas dinámicas | Leer `dynamic-routes.md` y `08-caching.md` antes del paso 8; usar `await params` y `generateStaticParams` |
| Mover el Feed a `app/(staff)/page.tsx` puede romper lo verificado en la spec 01 | Criterio de regresión explícito (Feed activo, 760px, 3 posts intactos) |
| Discrepancia de mocks: Feed "12 niños" vs listado "8 niños" | Así están los comps; se documenta y se unifica cuando haya BD |

## What is **not** in this spec

- Filtrado del buscador, guardado/validación del alta, edición real del niño, Resumen del día, vinculación de padres, traducción de la UI al inglés, las demás rutas y responsive completo. Cada una, si llega, va en su propio spec.
