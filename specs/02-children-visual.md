# SPEC 02 — Niños: listado y alta (visual)

> **Status:** Aprobado/
> **Depends on:** SPEC 01
> **Date:** 2026-11-17
> **Objective:** Implementar el listado de niños (`/children`) y el alta de niño (`/children/new`) como cáscara visual fiel a los comps, refactorizando el shell compartido a un route group.

## Por qué existe esta spec

Es la primera spec multi-pantalla y define tres bases que heredan las demás: la convención de rutas en inglés (`/children`), el ítem activo del sidebar según la ruta, y la extracción del shell a un route group para que pantallas sueltas (como el alta, que no lleva sidebar) puedan vivir fuera de él.

## Scope

**In:**

- Ruta `/children` con el listado de `ninos.dc.html`: header (kicker "GESTIÓN", título "Niños" en Fredoka, CTA coral "Agregar niño"), buscador estático, divider "SALA SOLES · 8 niños" y grilla de 8 cards (2 columnas → 1 en mobile) con hover (borde `#F2A78E` + `translateY(-2px)`).
- Ruta `/children/new` con el alta de `agregar-nino.dc.html`: card centrada de 520px **sin sidebar ni top bar**, header Cancelar / "Agregar niño" / Guardar y los 5 campos: nombre completo, fecha de nacimiento (input de texto con placeholder "dd/mm/aaaa"), sala (select falso "Soles" + chevron), alergias y notas médicas (textarea).
- Refactor del shell: extraer sidebar + top bar de `app/layout.tsx` a `app/(staff)/layout.tsx`; el layout raíz queda solo con html, body, fuentes y metadata; el Feed se muda de `app/page.tsx` a `app/(staff)/page.tsx`.
- Sidebar con ítem activo por ruta (`usePathname`): "Niños" activo en `/children`, "Feed" activo en `/`; "Niños" pasa de link muerto a link real.
- Navegación real entre pantallas existentes: CTA "Agregar niño" → `/children/new`; "Cancelar" y "Guardar" → `/children` (sin lógica de guardado).
- Mock tipado en `app/data/children.ts` con los 8 niños del comp.
- Metadata de título por página: "Niños · OpenDayCare" y "Agregar niño · OpenDayCare".

**Out of scope (for future specs):**

- Perfil del niño (`perfil-nino.dc.html`): las cards apuntan a `#` hasta su spec.
- Filtrado real del buscador, validación y guardado del alta, select de sala interactivo.
- Traducción de la UI al inglés (el copy visible queda en español, como los comps).
- Las demás rutas (crear-publicación, avisos, mi cuenta, login): siguen `#`.
- Responsive completo (nav mobile, menú hamburguesa, layouts tablet).

## Data model

```ts
// app/data/children.ts
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
}

export interface ClassroomSummary {
  name: string;          // "Sala Soles" (se muestra como "SALA SOLES" vía CSS)
  childrenCount: number; // 8
}
```

Convención: identificadores en inglés, valores de copy en español (igual que `feed.ts`). Nota: el listado usa 8 niños pero el header del Feed dice "12 niños"; esa discrepancia está en los comps originales y se unifica cuando haya BD.

Tokens nuevos (además de los de la spec 01): contenido max-width **880px** con padding 34/40/80 · buscador: fondo `#FFFDF9`, borde `#ECE0D0`, radio 14, lupa `#B0A290`, placeholder `#B6A99B` · card niño: radio 18, padding 16, sombra `0 4px 14px -12px rgba(120,90,60,.5)` · avatares 48px Fredoka 19px con paleta por niño: M/L `#A9D9E8`/`#1F7A93`, S/E `#F4B8CC`/`#C44A7A`, B/O `#B9DEC4`/`#3E8B62`, V `#F4DC8E`/`#9A7B1E`, T `#C9B6E8`/`#7B5FC0` · chip alergia `#FBD8CC`/`#D9684A`, chip VINCULAR `#F9D2DE`/`#C56486`, chevron `#CBB89F` · alta: card `#FBF4EC` radio 24, sombra `0 20px 50px -24px rgba(63,54,46,.35)` · labels 12px 800 ls .7 `#94887B` · inputs: fondo `#fff`, borde 1.5 `#EADFD0`, radio 14, placeholder `#B6A99B`.

## Implementation plan

1. Refactor de layouts (leyendo antes las docs locales de route groups en `node_modules/next/dist/docs/`): `app/layout.tsx` queda mínimo (html, fuentes, metadata); crear `app/(staff)/layout.tsx` con el shell actual; mover `app/page.tsx` → `app/(staff)/page.tsx`. Manual: `/` renderiza idéntico a antes.
2. Sidebar activo por ruta: nav data-driven + `usePathname` (componente cliente); "Niños" → `/children`. Manual: `/` muestra "Feed" activo.
3. Crear `app/data/children.ts` con los tipos y los 8 niños del comp.
4. Crear `app/components/child-card.tsx`: avatar con colores del mock, nombre en Fredoka, meta, y derecha condicional (chip alergia / chip VINCULAR / chevron) + hover.
5. Crear `app/(staff)/children/page.tsx`: header con CTA → `/children/new`, buscador inline, divider, grilla responsive 2→1 columna, metadata de título.
6. Crear `app/components/form-field.tsx` (label + control con estilos del comp) y `app/children/new/page.tsx`: card 520px centrada, header con Cancelar y Guardar → `/children`, los 5 campos (fecha como input de texto, sala como div falso), metadata de título. Las fuentes vienen del layout raíz.

## Acceptance criteria

- [ ] Al abrir `http://localhost:3000/children` se renderiza el listado (kicker "GESTIÓN", título "Niños", CTA "Agregar niño", buscador, divider "SALA SOLES · 8 niños" y 8 cards).
- [ ] `/children` y `/children/new` cargan sin errores en consola con `npm run dev`.
- [ ] A 1280px el listado coincide con el comp: contenido 880px con padding 34/40/80, grilla de 2 columnas con gap 14, cards con radio 18 y sombra exacta.
- [ ] Los 8 avatares usan la paleta exacta del comp por niño (pares de color por iniciales).
- [ ] Chips y chevrons exactos: MANÍ y LACTOSA (`#FBD8CC`/`#D9684A`), VINCULAR (`#F9D2DE`/`#C56486`), chevron `#CBB89F` en el resto.
- [ ] El hover de las cards aplica borde `#F2A78E` + `translateY(-2px)` con transición de .15s.
- [ ] El sidebar marca "Niños" activo en `/children` y "Feed" activo en `/`, y ambos links navegan entre sí.
- [ ] Al abrir `/children/new` se renderiza la card centrada de 520px **sin sidebar ni top bar**, con header Cancelar / "Agregar niño" / Guardar y los 5 campos con placeholders exactos ("Ej. Martina López", "dd/mm/aaaa", "Soles" + chevron, "Ej. Maní, Lactosa", "Indicaciones, medicación, contactos…").
- [ ] "Agregar niño" (listado), "Cancelar" y "Guardar" (alta) navegan entre `/children` ↔ `/children/new`; no hay lógica de guardado.
- [ ] El Feed (`/`) no se rompe tras el refactor: "Feed" activo, contenido de 760px y los 3 posts intactos (regresión de la spec 01).
- [ ] A 375px: `/children` sin scroll horizontal, con top bar y grilla de 1 columna; `/children/new` sin scroll horizontal, card a ancho completo con padding lateral reducido.
- [ ] Los links a pantallas futuras siguen muertos (`#`): cards del listado (perfil), Avisos, Mi cuenta, Nueva publicación y logout.
- [ ] `npx tsc --noEmit` pasa.
- [ ] ESLint no agrega errores en los archivos tocados (el fallo preexistente de `references/pantallas/support.js` no cuenta).

## Decisions

- **Sí:** rutas en inglés (`/children`, `/children/new`) — decisión del usuario; sienta el precedente para las demás pantallas (p.ej. perfil → `/children/[id]`).
- **Sí:** copy visible de la UI en español — decisión del usuario, confirmada; los comps y la spec 01 se mantienen tal cual.
- **Sí:** el alta como página sin shell — decisión del usuario; fiel al comp, requiere extraer el shell a `app/(staff)/layout.tsx`.
- **Sí:** sidebar con ítem activo por ruta vía `usePathname` — patrón active-link de Next; necesario para fidelidad al comp.
- **Sí:** "Cancelar" y "Guardar" navegan a `/children` como en el comp — decisión del usuario; links reales sin lógica.
- **Sí:** buscador estático sin filtrado — decisión del usuario; cáscara pura.
- **Sí:** mock tipado en `app/data/children.ts` — la BD futura reemplaza la fuente sin tocar UI.
- **Sí:** grilla 2 columnas → 1 en mobile — responsive básica, patrón de la spec 01.
- **Sí:** select de sala como div falso ("Soles" + chevron) — réplica exacta del comp, sin interactividad.
- **Sí:** metadata de título por página ("Niños · OpenDayCare", "Agregar niño · OpenDayCare").
- **No:** traducir la UI al inglés — el copy queda en español como los comps.
- **No:** filtrado del buscador, validación o guardado del alta — cáscara visual.
- **No:** página de perfil del niño — spec futura; cards apuntan a `#`.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| `app/(staff)/children/page.tsx` y `app/children/new/page.tsx` comparten el segmento `children` en niveles distintos del árbol de rutas | Next.js lo permite porque las URLs finales no colisionan; verificar con el dev server en el paso 1 y, si fallara, mover el alta a un grupo propio o a ruta plana |
| Mover el Feed a `app/(staff)/page.tsx` puede romper lo verificado en la spec 01 | Criterio de regresión explícito (Feed activo, 760px, 3 posts intactos) |
| Discrepancia de mocks: Feed "12 niños" vs listado "8 niños" | Así están los comps; se documenta y se unifica cuando haya BD |

## What is **not** in this spec

- Perfil del niño, filtrado del buscador, guardado/validación del alta, traducción de la UI al inglés, las demás rutas y responsive completo. Cada una, si llega, va en su propio spec.
