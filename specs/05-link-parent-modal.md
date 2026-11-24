# SPEC 05 — Modal de vincular padre (invitación en memoria)

> **Status:** Implementado
> **Depends on:** SPEC 04
> **Date:** 2026-11-24
> **Objective:** Abrir el comp `vincular-padre.dc.html` como modal fiel a su diseño — con el mismo comportamiento de overlay/Esc/validaciones que el modal de agregar niño — que invita un padre/madre/tutor de un niño, lo persiste en memoria como pendiente y bloquea emails duplicados del mismo niño.

## Scope

**In:**

- Componente `LinkParentModal` (client) fiel al comp: card de **480px** `#FBF4EC` radio 24 con:
  - Header: título **"Vincular padre"** (display 18px 600) + subtítulo **"a {nombre del niño}"** (13px `#A89A8B`) a la izquierda, y botón **X** (34px, radio 10, bg `#F0E6D8`, icono `#94887B`) a la derecha — no usa el header Cancelar/Título/Guardar del modal de niño.
  - Banner informativo azul (`#E3ECFB`, radio 14): "Le enviaremos un correo con un código para que active su cuenta. Solo verá el feed de {nombre}." con icono info `#4E72C8`.
  - Campo **NOMBRE DEL PADRE/MADRE** con placeholder "Ej. Diego Fernández".
  - Campo **EMAIL** con placeholder "correo@ejemplo.com".
  - Selector **PARENTESCO**: pills flex (Mamá / Papá / Tutor/a), radio 999; seleccionada: borde `#9FB8EC`, bg `#CCD8F4`, texto `#4E72C8`; no seleccionada: borde `#ECE0D0`, bg `#FFFDF9`, texto `#6E6359`. **Mamá preseleccionada** al abrir.
  - Bloque amarillo **CÓDIGO DE INVITACIÓN** (`#FBF1D6`, borde dashed `#E6D08A`, radio 16): código fijo **7K4P9** (display 34px, letter-spacing 7px, `#8A7234`) + "Vence en 7 días".
  - CTA a ancho completo **"Enviar invitación"** (degradado `#F4977E → #EE8164`, radio 14, icono de enviar, sombra coral).
  - Labels e inputs con los estilos ya definidos (labels 12px 800 ls .7 `#94887B`, inputs fondo blanco borde 1.5 `#EADFD0` radio 14).
- **Comportamiento modal idéntico al de agregar niño** (SPEC 04): overlay `rgba(63,54,46,0.5)`, click fuera, tecla **Esc** y botón X cierran el modal descartando lo tipeado.
- **Validaciones** (borde `#D9583C` + mensaje en español debajo del campo, limpiar el error al tipear, el modal no se cierra si hay errores):
  - **Nombre**: obligatorio al Guardar → "El nombre es obligatorio."
  - **Email**: obligatorio al Guardar → "El email es obligatorio."; formato en vivo: apenas el campo no está vacío y no matchea formato de email → "El email no tiene un formato válido." (también al Guardar).
  - **Email duplicado**: si el email ya existe en `child.parents` → "Ese email ya está vinculado a este niño." Se valida en el cliente antes de enviar y también lo rechaza el action (red de seguridad).
- **Punto de entrada 1 — perfil**: el link muerto "Vincular otro padre" de `/children/[id]` pasa a ser un client button que abre el modal para ese niño.
- **Punto de entrada 2 — card del listado**: el chip **VINCULAR** (niños con `needsParentLink`) abre el mismo modal sin navegar al perfil; el resto de la card sigue navegando al perfil como hasta ahora.
- Server action en memoria (`app/actions/children.ts`): `linkParent(childId, input)` agrega al array `parents` del niño un padre con `status: "pending"` y `statusLabel: "invitación enviada"`, actualiza `parentsSummary`, borra `needsParentLink`, hace `revalidatePath("/children")` y del perfil; al guardar el modal se cierra y el perfil muestra al padre nuevo con chip PENDIENTE.
- Modelo: `Parent` gana `email: string`; los padres seed reciben emails plausibles. Nueva paleta de avatares para padres (`PARENT_AVATAR_PALETTE`) con asignación cíclica por índice de parentesco dentro del niño.

**Out of scope (for future specs):**

- Envío real de correo: el "envío" es solo el guardado en memoria + UI.
- Generación y vencimiento real del código de invitación: el bloque muestra el **7K4P9 fijo** del comp y "Vence en 7 días" como texto estático; el código no se genera ni se persiste.
- Reenviar invitación, desvincular un padre, o promocionar pending → active.
- Persistencia real (fs/BD) y localStorage: se pierde al reiniciar el dev server (decisión de SPEC 04, vigente).
- Validación robusta en el server más allá del rechazo de duplicados (la máscara/formato vive en el cliente).

## Data model

```ts
// app/data/children.ts (cambios)
export interface Parent {
  name: string;
  email: string; // nuevo — correo del padre invitado
  initials: string;
  avatarBackgroundColor: string;
  relationship: string; // "Mamá" | "Papá" | "Tutor/a"
  status: "active" | "pending";
  statusLabel: string;
}

// Paleta de avatares para padres invitados (por índice de parentesco,
// cíclica). Los padres seed conservan sus colores actuales.
export const PARENT_AVATAR_PALETTE = [...] as const;
export function parentAvatarForIndex(index: number): { background: string; text: string };

export const parentRelationships = ["Mamá", "Papá", "Tutor/a"] as const;
```

```ts
// app/actions/children.ts (cambio)
export interface ParentFormInput {
  name: string;
  email: string;
  relationship: string; // "Mamá" | "Papá" | "Tutor/a"
}

export type LinkParentResult =
  | { ok: true }
  | { ok: false; error: "duplicate-email" };

export async function linkParent(childId: string, input: ParentFormInput): Promise<LinkParentResult>;
// → busca al niño; si el email ya está en child.parents devuelve { ok: false }
// → si no, push del padre nuevo (pending / "invitación enviada", avatar cíclico,
//   initials del nombre), recalc parentsSummary, delete needsParentLink,
//   revalidatePath("/children") + revalidatePath(`/children/${childId}`)
```

## Implementation plan

1. Modelo en `app/data/children.ts`: agregar `email` a `Parent` y a los padres seed; exportar `parentRelationships`, `PARENT_AVATAR_PALETTE` y `parentAvatarForIndex`. `npx tsc --noEmit` sin cambios visuales.
2. Action `linkParent` en `app/actions/children.ts` con el rechazo de duplicado y los revalidate.
3. Crear `app/components/link-parent-modal.tsx`: overlay/Esc/X igual que el modal de niño, card 480px fiel al comp, validaciones required/email/duplicado, Guardar llama al action vía `startTransition` y cierra. Props: `child`, `onClose`.
4. Perfil: nuevo `app/components/link-parent-button.tsx` (client, mismo patrón que `edit-child-button`) que reemplaza el `<a href="#">` "Vincular otro padre" y abre el modal. Manual: invitar "Diego Fernández · diego@ejemplo.com · Papá" → modal cierra, el perfil lista al padre con "Papá · invitación enviada" y chip PENDIENTE.
5. Card del listado: el chip VINCULAR pasa a un elemento client que hace `preventDefault` y abre el modal (la card sigue siendo Link para el resto del área clicable). Manual: Valentina Soto (VINCULAR) → modal "Vincular padre / a Valentina Soto"; invitar → modal cierra, el chip VINCULAR desaparece de la card y queda "1 padre vinculado".
6. Verificación final: `npx tsc --noEmit` + lint de los archivos tocados + comparación visual del modal contra `references/pantallas/vincular-padre.dc.html` con Playwright (screenshots en `./playwright-mcp`).

## Acceptance criteria

- [x] El link "Vincular otro padre" de `/children/[id]` abre el modal y ya no es un link muerto.
- [x] El chip VINCULAR de la card en `/children` abre el modal sin navegar al perfil; el resto de la card sigue navegando.
- [x] El modal es fiel al comp: card 480px `#FBF4EC` radio 24, header con título "Vincular padre" + subtítulo "a {niño}" + botón X, banner azul, los 2 inputs con placeholders exactos, 3 pills de parentesco, bloque amarillo con "7K4P9" y "Vence en 7 días", CTA degradado "Enviar invitación".
- [x] El botón X, el click en el overlay y la tecla Esc cierran el modal sin guardar nada.
- [x] Las pills arrancan con **Mamá** preseleccionada y cambian al clickear Papá / Tutor/a.
- [x] Guardar sin nombre marca el campo con borde `#D9583C` y "El nombre es obligatorio."; el modal no se cierra.
- [x] Guardar sin email muestra "El email es obligatorio." y un email con formato inválido (`diego@`, `diego@x`) muestra "El email no tiene un formato válido." en vivo y al Guardar; el modal no se cierra.
- [x] Un email que ya existe en los parents del niño muestra "Ese email ya está vinculado a este niño." y el modal no se cierra (el mismo email en otro niño sí se permite).
- [x] Invitación válida (ej. "Diego Fernández · diego@ejemplo.com · Papá"): el modal se cierra y el perfil muestra al padre con avatar de la paleta, "Papá · invitación enviada", chip PENDIENTE y `parentsSummary` actualizado ("2 padres vinculados").
- [x] Invitar a un niño con `needsParentLink` limpia la marca: la card deja de mostrar el chip VINCULAR (vuelve al chevron) y pasa a mostrar "1 padre vinculado"; el acceso "Vincular otro padre" del perfil sigue disponible.
- [x] El padre guardado persiste en memoria mientras el dev server no reinicie (mismo comportamiento que SPEC 04).
- [x] Regresión: `/`, `/children` y `/children/[id]` renderizan visualmente igual que tras la spec 04, salvo lo indicado en esta spec.
- [x] `npx tsc --noEmit` pasa.
- [x] ESLint no agrega errores en los archivos tocados (el fallo preexistente de `references/pantallas/support.js` no cuenta).

## Decisions

- **Sí:** visual fiel al comp (header con X, CTA degradado abajo, card 480px) y comportamiento/validaciones clonados del modal de agregar niño — decisión del usuario; el comp manda en la estética, SPEC 04 en el comportamiento.
- **Sí:** dos puntos de entrada (perfil + chip VINCULAR de la card) — decisión del usuario; cubre todos los accesos del diseño.
- **Sí:** persistir el padre en memoria (pending / "invitación enviada") con `email` nuevo en el modelo `Parent` — decisión del usuario; mismo patrón de guardado que SPEC 04.
- **Sí:** bloquear email duplicado del mismo niño con mensaje en español, validado en el cliente y como red de seguridad en el action — decisión del usuario (fue la única validación extra pedida).
- **Sí:** Mamá preseleccionada al abrir — fiel al comp, donde la pill Mamá aparece activa.
- **Sí:** código de invitación fijo (7K4P9) con texto "Vence en 7 días" estático — decisión del usuario ("por ahora fijo, más adelante implementaremos esto"); no se genera ni persiste.
- **Sí:** paleta cíclica de avatares para padres — decisión del usuario; los padres seed conservan sus colores del mock.
- **Sí:** ritmo vertical compactado respecto del comp (overlay `py-4`, paddings de 12–18px, código a 28px) para que el modal entre en pantallas de notebook (~768px de alto), con `max-h-[calc(100dvh-2rem)]` + scroll interno como red de seguridad — ajuste del usuario durante la implementación; se mantienen todos los elementos, colores y placeholders del comp.
- **No:** envío real de correo, generación de código, reenvío, desvincular — para cuando exista BD (se reemplaza el action sin tocar la UI).
- **No:** validación server robusta general — solo el rechazo de duplicados; el resto sigue confiando en el cliente como en SPEC 04.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Con `cacheComponents: true`, el perfil (server component) puede no refrescar tras `linkParent` | `revalidatePath("/children")` + del perfil en el action; si no refresca, releer `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` y ajustar |
| El chip VINCULAR vive dentro del `<Link>` de la card: el click puede navegar en vez de abrir el modal | Elemento client con `preventDefault`/`stopPropagation` en el onClick del botón |
| Error de formato en vivo puede asustar mientras se tipea ("diego@") | Comportamiento aceptado por decisión del usuario; es el mismo patrón de error en vivo del campo fecha en SPEC 04 |
| Estado en memoria se pierde al reiniciar/HMR | Aceptado (decisión de SPEC 04, vigente) |
| `Parent.email` rompe a los seed al agregar el campo | Se agregan emails plausibles a los padres seed en el paso 1, antes de tocar la UI |

## What is **not** in this spec

- Envío real de correo, generación/vencimiento de códigos, reenvío de invitación, desvincular padres, persistencia real (fs/BD/localStorage), responsive del modal y toast de confirmación. Cada una, si llega, va en su propio spec.
