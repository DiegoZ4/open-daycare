# SPEC 09 — Auth real (email + contraseña) y protección de rutas

> **Estado:** Implementado
> **Depends on:** SPEC 07, SPEC 08 (daycares + users en la base, con usuarios seed), SPEC 03 (pantallas `/login` y `/activate-account`)
> **Fecha:** 2026-11-27
> **Objetivo:** Conectar el login a Supabase Auth con email y contraseña, hacer logout real con datos de perfil en el sidebar, y proteger todas las rutas salvo `/login` y `/activate-account`, con policies RLS mínimas para leer el perfil propio y el daycare.

## Scope

**In:**

- Login real en `/login`: `signInWithPassword` contra Supabase (browser client), campos sin prefills, error genérico inline ("Email o contraseña incorrectos"), CTA → redirect a `/`.
- Redirect de autenticados: `/login` y `/activate-account` redirigen a `/` si ya hay sesión (check optimista en `proxy.ts`, solo cookies).
- Protección server-side de rutas: guard en `app/(staff)/layout.tsx` con `getUser()` (nunca `getSession()`) → `redirect('/login')` si no hay usuario. Cubre `/`, `/children`, `/children/new`, `/children/[id]`.
- Sidebar con datos reales: `full_name` y `avatar_url` de `public.users` + nombre del daycare real en el footer; logout con `signOut()` real → `/login`.
- Policies RLS mínimas: self-select en `users` y lectura del daycare propio en `daycares` (migración vía MCP + espejo local).
- Verificación: `npx tsc --noEmit`, lint de archivos tocados, y pruebas manuales con los usuarios seed.

**Out of scope (para futuras specs):**

- Activación real de cuentas (necesita tabla `invitations`) — `/activate-account` queda como cáscara visual.
- Recuperar contraseña (link queda muerto `#`).
- Selector de rol y `familia-feed`; usuarios `parent` entran a `/` como cualquier otro.
- Database types de Supabase generados (TypeScript).
- Policies RLS de `rooms`, `children`, `posts` y el resto del schema.
- Edición de perfil / upload de avatar.

## Data model

No introduce tablas nuevas. Cambia solo policies RLS (migración `create_auth_read_policies`):

```sql
create policy "users_select_own"
  on public.users
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "daycares_select_own"
  on public.daycares
  for select
  to authenticated
  using (
    id in (
      select daycare_id from public.users where id = (select auth.uid())
    )
  );
```

Perfil que consume la app (leído server-side, sin types generados):

```ts
type Profile = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  daycareName: string;
};
```

- La policy de `daycares` se apoya en la de `users` (el subquery solo necesita leer la propia fila).
- Los usuarios seed (`admin@sasoles.test` / `staff@sasoles.test`) son los datos de prueba para login.

## Implementation plan

1. Cargar la skill `supabase` y hacer baseline: `list_migrations`, policies de `users` y `daycares` via `pg_policies` (hoy: RLS enabled, 0 policies).
2. Aplicar migración `create_auth_read_policies` vía MCP con las 2 policies; verificar con `pg_policies` y espejar en `supabase/migrations/` con el timestamp remoto.
3. Leer la doc local de `cacheComponents` (`node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`) y decidir el patrón exacto del guard (el layout pasa a ser dinámico por leer cookies).
4. Wirear redirects en `utils/supabase/proxy.ts`: sin cookies de sesión (`sb-*-auth-token*`) → rutas privadas van a `/login`; con cookies → `/login` y `/activate-account` van a `/`. Check **optimista solo por presencia de cookies** (docs Next 16: proxy no hace checks de red).
5. Convertir `/login` en formulario real: client component con `utils/supabase/client.ts`, `signInWithPassword`, quitar prefills, error genérico inline, on success `router.replace('/')`. Fidelidad visual al comp salvo prefills.
6. Guard en `app/(staff)/layout.tsx`: `getUser()` con `utils/supabase/server.ts` → `redirect('/login')` si no hay usuario; fetch del perfil (`users` join `daycares`) y pasar `Profile` al `Sidebar`/`TopBar`.
7. `app/components/sidebar.tsx`: props con perfil real (nombre, avatar, daycare del footer) y logout → `signOut()` → `router.replace('/login')`.
8. Verificación final: `npx tsc --noEmit`, ESLint de archivos tocados, y pruebas manuales (Playwright sobre dev server): flujos de la tabla de acceptance criteria.

## Acceptance criteria

- [x] Sin sesión, `/`, `/children`, `/children/new` y `/children/[id]` redirigen a `/login`.
- [x] Con sesión activa, `/login` y `/activate-account` redirigen a `/`.
- [x] Login con `admin@sasoles.test` / `demo-admin-2026` entra a `/`; ídem `staff@sasoles.test` / `demo-staff-2026`.
- [x] Email o contraseña incorrectos muestran un mensaje genérico inline sin indicar cuál campo falló.
- [x] Campos vacíos no envían el form (validación mínima) ni llegan a Supabase.
- [x] El sidebar muestra `full_name` y avatar del perfil real, y el footer el nombre real del daycare ("Guardería Sala Soles").
- [x] El logout cierra la sesión: tras él, `/` vuelve a redirigir a `/login`.
- [x] `pg_policies` muestra exactamente las 2 policies nuevas en `users` y `daycares`; el resto de tablas sigue deny-all.
- [x] `/login` y `/activate-account` siguen fieles a los comps (únicos cambios: sin prefills, CTA funcional).
- [x] `npx tsc --noEmit` pasa y ESLint no agrega errores en los archivos tocados.

## Decisions

- **Sí:** verificación de identidad con `getUser()` en server y nunca `getSession()` — docs `@supabase/ssr`: `getSession()` lee cookies sin validar contra el servidor de auth.
- **Sí:** `proxy.ts` solo con check optimista por cookies, sin llamadas de red — guía oficial de autenticación de Next 16 (proxy corre en cada request, incluidas prefetches).
- **Sí:** defensa real en el layout del grupo `(staff)` — Next 16 exige que el proxy no sea la única línea de defensa.
- **Sí:** login como client component con browser client en vez de server action — es el camino más simple y evita el manejo de cookies en server actions.
- **Sí:** usuarios `parent` entran a `/` (decisión del usuario); el gate por rol llega con `familia-feed`.
- **No:** Database types generados — decisión del usuario; llegan en otra spec.
- **No:** activación real, reset de contraseña, selector de rol, `familia-feed`, policies de otras tablas — cada una en su propio spec.
- **Nota:** el WARN preexistente `auth_leaked_password_protection` del advisor no se fuerza en este spec.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| `cacheComponents: true` + cookies en el layout puede requerir boundary `Suspense` / `connection()` | Paso 3 del plan: leer la doc local antes de wirear el guard |
| Check optimista por presencia de cookie deja pasar cookies falsificadas | Aceptado: la defensa real es `getUser()` server-side; el proxy solo filtra el caso común |
| La policy de `daycares` depende de poder leer la propia fila de `users` | Ambas policies van juntas en la misma migración; verificadas end-to-end con el login del seed |
| Quitar prefills cambia el comp visual del login | Decisión explícita del usuario; el resto de la fidelidad se mantiene y se verifica |

## What is **not** in this spec

- Activación real de cuentas, recuperación de contraseña, `familia-feed`, selector de rol, Database types generados, policies de `rooms`/`children`/`posts` y edición de perfil. Cada una, si llega, va en su propia spec.
