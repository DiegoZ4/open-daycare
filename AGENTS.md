<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Proyecto

- **OpenDayCare**: web para guarderías con UI en español (lado staff y lado familias). Hoy es el scaffold inicial de create-next-app; el desarrollo se guía por los diseños de `references/`.
- Fuente de verdad del diseño: `references/pantallas/*.dc.html` — mockups HTML estáticos navegables (se enlazan entre sí; ábrelos directo en el navegador). Capturas en `references/screenshots/`. Copy en español rioplatense (voseo: "Compartí…").
- `references/` es material de diseño, no código del proyecto: no refactorizar ni "arreglar" sus archivos.

## Comandos

- `npm run dev` — dev server (Turbopack es el bundler por defecto en Next 16, también para `npm run build`).
- `npm run lint` — ESLint flat config, linta todo el repo.
- `npx tsc --noEmit` — typecheck (no hay script dedicado).
- No hay framework de tests instalado todavía.

### Gotcha de lint

`npm run lint` **falla hoy (exit 1)** por errores preexistentes en `references/pantallas/support.js` (runtime del formato de diseño, ajeno al proyecto). No es regresión propia: no lo "arregles"; para verificar cambios propios, evalúa solo los archivos tocados.

## Configuración Next.js no estándar

- `next.config.ts` activa `cacheComponents: true` + `partialPrefetching: true`: modelo nuevo de cacheo de Next 16. Antes de tocar fetching/caching, leer `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`.
- Tailwind v4 corre vía `@tailwindcss/turbopack` en `turbopack.rules`: no hay PostCSS ni `tailwind.config.*`; la configuración es CSS-first en `app/globals.css` (`@theme`).
- Alias de importación: `@/*` → raíz del repo (no existe `src/`).

## MCPs

- Playwright screenshots y cualquier cosa relacionada a Playwright tienen que estar en la carpeta ./playwright-mcp
- Context 7 Usaremos este MCP para traer la documentacion actualizada del framework.
- Supabase: usaremos este MCP para interactuar con el proyecto (SQL, migraciones, logs, tipos TypeScript generados). Cambios de schema van directo al proyecto remoto: verificar antes de aplicar.

## Supabase

- Backend del proyecto. El schema de referencia vive en `C:\Diego\OpenCode\07-DB-Schema` (material externo, solo lectura): **no está implementado todavía** en la base, se crea siguiendo esa referencia.
- Skill `supabase` instalada en `.agents/skills/supabase/`: cargarla SIEMPRE antes de cualquier tarea que toque Supabase (DB, Auth, RLS, Storage, Edge Functions, Realtime, migraciones, debugging de errores HTTP/Postgres/RLS).
- Reglas clave que aplica la skill (no reinventar):
  - RLS habilitado en todas las tablas de schemas expuestos (`public` por defecto).
  - Nunca usar `auth.role()` (deprecado) ni `user_metadata` para autorización; usar `TO authenticated/anon` + predicado de ownership con `(select auth.uid())`.
  - Nunca exponer `service_role` ni secret keys en código de cliente; solo publishable keys.
  - Verificar cambios con una query de prueba después de implementar.

## Skills instaladas

- Las skills del proyecto viven en `.agents/skills/` (`spec`, `spec-impl`, `supabase`); OpenCode las expone como skills disponibles con sus triggers en la descripción.
- `spec` y `spec-impl` ya están documentadas en la sección Spec Drive Development.
- Al instalar skills nuevas con `npx skills add`, quedan en `.agents/skills/` y conviene sumarlas acá.

## Base de datos (Supabase)

- Toda migración se aplica al proyecto remoto vía MCP `apply_migration` (queda en el historial del proyecto, visible en Dashboard) **y además** se crea su archivo espejo en `supabase/migrations/<timestamp>_<name>.sql` con el SQL idéntico al aplicado, para versionar el esquema en el repo. Nunca solo una de las dos cosas.
- El timestamp del archivo sigue el formato `YYYYMMDDHHMMSS` y coincide con el de la migración remota (lo devuelve `list_migrations`).
- DDL y datos van en migraciones separadas (ej. `create_daycares_table` + `seed_daycares`).
- RLS se habilita en toda tabla de `public` desde su propia migración; las policies se diseñan en la spec correspondiente (hoy: deny-all hasta tener auth).
- `execute_sql` es solo para queries y verificación, nunca para DDL (no deja historial de migraciones).

## Spec Drive Development

Flujo por pantalla: `/spec` (crear) → `/spec-impl` (implementar) → `/spec-verifier` (verificar y marcar checks).

- /spec Usaremos esta habilidad para crear las especificaciones.
- /spec-impl Usaremos esta skill para hacer las implementaciones.
- /spec-verifier Verifica los acceptance criteria de un spec, corrige lo que falle y marca los checks. Uso: `/spec-verifier @specs/01-home-feed-visual.md`. Definido en `.opencode/commands/spec-verifier.md`; ejecuta el agente `spec-verify` como subagent.
- Agente `spec-verify` (`.opencode/agents/spec-verify.md`): reverifica cada criterio desde cero con evidencia — comparación visual contra `references/pantallas/*.dc.html` con Playwright MCP (screenshots en `./playwright-mcp`), prácticas de Next.js vía Context7 + docs locales, y `npx tsc --noEmit` / lint (solo archivos tocados). Si un criterio falla, corrige `app/**`, `specs/**` o `next.config.ts` y re-verifica antes de marcar. Nunca edita `references/` ni `.opencode/`; no hace commits.

## Reglas de codigo

- Usar codigo limpio, nombres, funciones y variables en ingles