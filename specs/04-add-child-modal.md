# SPEC 04 — Modal de agregar/editar niño (alta + edición con guardado en memoria)

> **Status:** Implementado
> **Depends on:** SPEC 02
> **Date:** 2026-11-23
> **Objective:** Reemplazar el alta `/children/new` por un modal fiel a `agregar-nino.dc.html` que da de alta y edita niños con campos required, máscara de fecha `dd/mm/aaaa` con validador en español, salas hardcodeadas y guardado en memoria sobre el mock de niños.

## Scope

**In:**

- Componente `AddChildModal` (client) fiel al comp: card de 520px `#FBF4EC` radio 24 con header Cancelar / título / Guardar (`#D9583C`) y los 5 campos (nombre, fecha, sala, alergias, notas) con los estilos ya definidos en la spec 02 (labels 12px 800 ls .7 `#94887B`, inputs fondo blanco borde 1.5 `#EADFD0` radio 14).
- Overlay oscuro translúcido: click fuera y tecla **Esc** cierran el modal descartando lo tipeado; "Cancelar" hace lo mismo.
- **Modo alta**: lo abre el CTA "Agregar niño" del listado. Título "Agregar niño".
- **Modo edición**: lo abre el botón "Editar" del perfil, precargado con los datos del niño. Título "Editar niño".
- Required con validación al tocar Guardar: **nombre, fecha y sala** obligatorios; borde `#D9583C` + mensaje en español debajo de cada campo faltante o inválido.
- Fecha: input de texto con **máscara estricta `dd/mm/aaaa`** (autocompleta las barras, solo dígitos, y **corrige en vivo los imposibles**: día 01–31, mes 01–12, año 19xx/20xx; "4–9" como primer dígito de día/mes se expanden a "04–09", ej. tipear `9/3/2024` da `09/03/2024`) y **validador en español** con error en vivo: días por mes, bisiesto, año ≥ 1900 y no admite fechas futuras; el mensaje aparece apenas la fecha completa queda inválida y también al Guardar.
- Sala: select real con opciones hardcodeadas `Soles` (default), `Lunas`, `Estrellas` + chevron.
- Server actions en memoria (`app/actions/children.ts`): `addChild` y `updateChild` mutan el array de `app/data/children.ts` y hacen `revalidatePath`; al guardar el modal se cierra y el listado se refresca con el niño nuevo y el contador actualizado.
- Modelo: `Child` gana `sala`, `birthDateISO` y `allergies: string[]` (migra `allergyTag`); los 8 niños existentes pasan a `sala: "Soles"`.
- Campos derivados automáticamente del form: `id` (slug del nombre), iniciales, paleta de avatar (cíclica sobre las 5 existentes), edad (desde `birthDateISO`), `parentsSummary` ("sin padres vinculados"), `enrollment` (mes actual, ej. "nov 2026").
- El listado no filtra por sala: la grilla muestra a todos y el contador del divider se deriva del array.
- Chip de alergia en la card: primera alergia en mayúsculas.
- Baja de `app/children/new/page.tsx` (el modal la reemplaza).

**Out of scope (for future specs):**

- Persistencia real (escribir un `.json`/fs o BD): el guardado es **en memoria** (decisión del usuario); se pierde al reiniciar el dev server.
- localStorage.
- Filtrado por sala en el listado (un niño con sala "Lunas" sigue visible bajo "SALA SOLES").
- Edición de padres, vinculación, `needsParentLink` y buscador funcional.
- Toast o confirmación post-guardado.
- Validación robusta en el server (la validación vive en el cliente; el action confía en el input).

## Data model

```ts
// app/data/children.ts (cambios)
export interface Child {
  id: string;
  name: string;
  initials: string;
  avatarBackgroundColor: string;
  avatarTextColor: string;
  age: string;                    // "3 años" | "8 meses" — derivado de birthDateISO
  sala: string;                   // "Soles" (los 8 existentes)
  parentsSummary: string;
  allergies: string[];            // reemplaza allergyTag ("Maní" → chip "MANÍ")
  needsParentLink?: boolean;
  birthDate: string;              // "12 mar 2022" (display, derivado)
  birthDateISO: string;           // "2022-03-12" (fuente para la máscara y la edad)
  enrollment: string;
  medicalNotes?: string;
  parents: Parent[];
}

export const classrooms = ["Soles", "Lunas", "Estrellas"] as const;
```

```ts
// app/lib/date.ts (nuevo, sin dependencias)
applyDateMask(raw: string): string;          // "0532023" → "05/03/2023"
applyDateMaskStrict(raw: string): string;    // bloquea en vivo dígitos imposibles
isCompleteMaskedDate(masked: string): boolean; // forma completa dd/mm/yyyy
birthDateErrorES(masked: string): string | null; // mensaje en español o null
isValidBirthDate(masked: string): boolean; // fecha real + no futura + año ≥ 1900
parseDateES(masked: string): string | null; // → ISO "2023-03-05"
formatDateES(iso: string): string;          // → "5 mar 2023"
computeAgeES(iso: string): string;          // → "3 años" | "8 meses"
currentMonthYearES(): string;               // → "nov 2026"
```

```ts
// app/actions/children.ts (nuevo, "use server")
addChild(input: ChildFormInput): Promise<void>;                // muta el array + revalidatePath("/children")
updateChild(id: string, input: ChildFormInput): Promise<void>; // conserva parents/enrollment/needsParentLink
```

## Implementation plan

1. Crear `app/lib/date.ts`: máscara `applyDateMask`, validador `isValidBirthDate` (días por mes, bisiesto, sin futuro), `parseDateES`, `formatDateES` (meses abreviados español: ene…dic) y `computeAgeES`. Manual: `npx tsc --noEmit` y prueba al conectarlo al form en el paso 4.
2. Migrar el modelo en `app/data/children.ts`: agregar `sala`, `birthDateISO`, `allergies` a los 8 niños; borrar `allergyTag`; helpers de derivación (slug con sufijo `-2` en colisión, iniciales, paleta cíclica de 5, edad, `parentsSummary`); exportar `classrooms`. Actualizar `ChildCard` (chip = primera alergia uppercase). Regresión visual sin cambios.
3. Crear `app/actions/children.ts` con `addChild`/`updateChild` en memoria + `revalidatePath("/children")` (y del perfil correspondiente).
4. Crear `app/components/add-child-modal.tsx`: overlay, card 520px, campos con máscara/validación required (borde coral + mensaje), select de salas, Guardar llama al action y cierra. Props: `mode: "create" | "edit"`, `child?`.
5. Listado: extraer el CTA a un client wrapper que abre el modal en modo alta; contador del divider derivado de `children.length`; eliminar `app/children/new/page.tsx`. Manual: alta completa → modal cierra, card nueva en la grilla, "9 niños".
6. Perfil: "Editar" pasa de `<Link>` a botón client que abre el modal en modo edición precargado; Guardar actualiza el niño (nombre/fecha/sala/alergias/notas) y refresca. Manual: editar Mateo → sala "Lunas" se refleja en perfil y listado (sin filtro).

## Acceptance criteria

- [x] El CTA "Agregar niño" del listado abre el modal sobre la grilla (card 520px fiel al comp: header Cancelar/título/Guardar, 5 campos con placeholders exactos) y ya no navega a `/children/new`.
- [x] `http://localhost:3000/children/new` devuelve 404.
- [x] El título del header es "Agregar niño" en modo alta y "Editar niño" en modo edición.
- [x] "Cancelar", click en el overlay y tecla Esc cierran el modal sin guardar nada.
- [x] La máscara completa las barras solas: tipear `12122025` muestra `12/12/2025`; acepta solo dígitos (máx. 8).
- [x] La máscara estricta corrige en vivo: no permite mes 13 (después de "1" solo acepta 0–2), día 00 ni día 32+; "4–9" como primer dígito de día/mes se expanden a "04–09" (tipear `9/3/2024` muestra `09/03/2024`).
- [x] El validador rechaza `31/02/2024` (día inexistente), acepta `29/02/2024` (bisiesto) y rechaza fechas futuras, con mensajes de error en español que aparecen en vivo apenas la fecha completa queda inválida y también al Guardar.
- [x] Guardar sin nombre, fecha o sala marca cada campo con borde `#D9583C` y un mensaje en español debajo; el modal no se cierra.
- [x] El select de sala muestra Soles, Lunas y Estrellas, con Soles preseleccionado.
- [x] Alta válida (ej. "Martina López · 05/06/2023 · Soles · Maní, Lactosa"): cierra el modal, la grilla muestra la card nueva (iniciales "M", edad "3 años", chip "MANÍ") y el contador del divider pasa a "9 niños".
- [x] El niño creado tiene id slug del nombre, `parentsSummary` "sin padres vinculados", `enrollment` del mes actual ("nov 2026") y paleta de avatar tomada cíclicamente de las 5 existentes; su perfil `/children/martina-lopez` renderiza completo.
- [x] Un nombre repetido con Mateo Fernández genera id `mateo-fernandez-2` sin pisar nada.
- [x] "Editar" en el perfil abre el modal precargado (nombre, fecha en máscara, sala, alergias "Maní", notas); cambiar la sala a Lunas y guardar actualiza el perfil a "Sala Lunas" y el niño sigue visible en el listado.
- [x] La edición conserva parents, enrollment y `needsParentLink` del niño editado.
- [x] El chip de alergia en las cards muestra la primera alergia en mayúsculas (MANÍ, LACTOSA) igual que antes de la migración.
- [x] Regresión: `/`, `/children` y `/children/[id]` renderizan visualmente igual que tras la spec 03, salvo lo indicado en esta spec.
- [x] `npx tsc --noEmit` pasa.
- [x] ESLint no agrega errores en los archivos tocados (el fallo preexistente de `references/pantallas/support.js` no cuenta).

## Decisions

- **Sí:** el modal reemplaza a la página `/children/new` — decisión del usuario; se elimina la página y el botón "Editar" del perfil (que apuntaba ahí) abre el modal.
- **Sí:** persistencia solo en memoria — decisión del usuario (pidió "agregar al json" y eligió memoria entre las opciones); los actions mutan el array del mock y `revalidatePath` refresca. Sustituye al criterio "Guardar navega a /children" de la spec 02.
- **Sí:** edición en esta spec — decisión del usuario ("Editar" abre el modal precargado); ampliación de alcance confirmada.
- **Sí:** salas Soles/Lunas/Estrellas hardcodeadas — decisión del usuario; Soles default por ser la del comp.
- **Sí:** máscara y validador a mano en `app/lib/date.ts` sin dependencias — el comp usa input de texto; una librería de máscaras no aporta para un solo campo.
- **Sí:** máscara estricta con bloqueo en vivo (día 01–31, mes 01–12, año 19xx/20xx) + error en vivo cuando la fecha completa queda inválida — decisión del usuario durante la implementación; reemplaza la validación únicamente al Guardar del plan original. Los mensajes del validador son en español.
- **Sí:** migrar `allergyTag` → `allergies: string[]` — el form es un solo input de texto libre; el chip muestra la primera.
- **Sí:** derivados automáticos (id, iniciales, edad, `parentsSummary`, `enrollment`, paleta cíclica) — el comp no pide esos campos y no se inventan datos extra.
- **Sí:** "Editar niño" como título en modo edición — el comp dice "Agregar niño" y con datos precargados sería confuso.
- **Sí:** listado sin filtro por sala y contador derivado del array — decisión del usuario; ningún niño "desaparece" del listado.
- **No:** persistencia real (fs/BD) ni localStorage — decisión del usuario; cuando exista BD esto se reemplaza en el action sin tocar la UI.
- **No:** toast de confirmación ni validación server robusta — para una spec futura si se pide.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Con `cacheComponents: true`, el listado (server component) puede no refrescar tras mutar el array en memoria | `revalidatePath("/children")` en ambos actions; si no refresca, releer `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` en el paso 3 y ajustar |
| El estado en memoria se pierde al reiniciar/HMR del dev server | Aceptado (decisión del usuario); documentado en scope out |
| Acciones concurrentes sobre el array global (módulo compartido) | Alcance mock: un solo usuario local; irrelevante hasta haber BD |
| Eliminar `/children/new` puede dejar links muertos hacia ella | El único link era el botón "Editar" (paso 6) y el CTA del listado (paso 5); criterio explícito de 404 |
| Edad límite (nacimiento hoy → "0 meses") | `computeAgeES` maneja `< 1 año` como "X meses" incluyendo 0; caso probado en el validador |

## What is **not** in this spec

- Persistencia real (fs/BD/localStorage), filtrado por sala, edición de padres, toast de confirmación, buscador funcional y responsive completo del modal. Cada una, si llega, va en su propio spec.
