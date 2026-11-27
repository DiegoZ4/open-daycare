# SPEC 08 — Tabla `users`, enums de usuario y trigger de perfil

> **Estado:** Implementado
> **Depends on:** SPEC 07 (daycares con seed de 3 guarderías)
> **Fecha:** 2026-11-27
> **Objetivo:** Crear la tabla `public.users` con sus enums (`user_role`, `user_status`), el trigger `AFTER INSERT` sobre `auth.users` que genera el perfil, y dos usuarios de prueba (admin + staff) sembrados con insert directo en `auth.users`.

## Scope

**In:**

- Enums `public.user_role` (`staff`/`parent`/`admin`) y `public.user_status` (`pending`/`active`) como migración propia.
- Tabla `public.users` según la referencia `07-DB-Schema/opendaycare-database-schema.md` (sección 2): PK `id` FK → `auth.users(id)` ON DELETE CASCADE, `daycare_id` FK → `daycares` (not null — un usuario pertenece a un daycare; un daycare tiene muchos usuarios), `role`, `status` default `active`, `full_name`, `avatar_url` nullable, `notify_on_post` y `daily_summary_enabled` defaults `true`, `created_at`/`updated_at`.
- Trigger `on_auth_user_created` + función `handle_new_user()` (SECURITY DEFINER, `search_path` fijado) que crea el perfil desde `raw_user_meta_data` (`daycare_id`, `role`, `full_name`).
- Migración `seed_test_users`: admin + staff en "Guardería Sala Soles", insert directo en `auth.users` con `crypt()` bcrypt y email confirmado; el trigger genera los perfiles.
- RLS habilitado en `users` sin policies (deny-all, consistente con SPEC 07).
- Verificación post-migraciones: `list_migrations`, `list_tables`, queries sobre enums/columnas/FKs/defaults/policies, prueba end-to-end del trigger y corrida de security advisors.
- Espejo local de las migraciones en `supabase/migrations/` (mismos nombres y timestamps que el historial remoto).

**Out of scope (para futuras specs):**

- Políticas RLS (llegan con la spec de auth en la app).
- Cliente `@supabase/ssr` en Next.js, variables de entorno y tipos TypeScript generados.
- El resto de las tablas del schema (`rooms`, `children`, `invitations`, …) — cada una en su propia spec/migración.
- Actualización automática de `updated_at` y flujos de UI / signup real.

## Data model

```sql
-- Migración: create_user_enums
create type public.user_role as enum ('staff', 'parent', 'admin');
create type public.user_status as enum ('pending', 'active');
```

```sql
-- Migración: create_users_table
create table public.users (
  id uuid primary key default gen_random_uuid()
    references auth.users(id) on delete cascade,
  daycare_id uuid not null references public.daycares(id),
  role public.user_role not null,
  status public.user_status not null default 'active',
  full_name text not null,
  avatar_url text,
  notify_on_post boolean not null default true,
  daily_summary_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;
```

```sql
-- Migración: create_handle_new_user_trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, daycare_id, role, full_name)
  values (
    new.id,
    (new.raw_user_meta_data ->> 'daycare_id')::uuid,
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'parent'),
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
```

```sql
-- Migración: seed_test_users
-- Contraseñas demo (proyecto de prueba); si el insert exige columnas extra de
-- auth.users (confirmation_token, recovery_token, etc.), se agregan acá mismo.
insert into auth.users (id, email, encrypted_password, email_confirmed_at,
                        raw_user_meta_data, created_at, updated_at)
select
  gen_random_uuid(),
  v.email,
  crypt(v.password, gen_salt('bf')),
  now(),
  jsonb_build_object('daycare_id', d.id, 'role', v.role, 'full_name', v.full_name),
  now(), now()
from (values
  ('admin@sasoles.test', 'demo-admin-2026', 'admin', 'Diego Admin'),
  ('staff@sasoles.test', 'demo-staff-2026', 'staff', 'Lucía Staff')
) as v(email, password, role, full_name)
cross join (select id from public.daycares where name = 'Guardería Sala Soles') d;
```

- `daycare_id` not null: el modelo exige pertenencia — un usuario pertenece a un único daycare; un daycare tiene muchos usuarios.
- Enums en inglés (convención del doc); las etiquetas UI en español se resuelven en la capa de UI, no en la base.
- El seed de usuarios va como migración aparte: separa DDL de datos.
- La función del trigger es SECURITY DEFINER (necesario para insertar en `public.users` pese al deny-all) y fija `search_path = ''` para evitar el hallazgo `function_search_path_mutable` del security advisor.

## Implementation plan

1. Cargar la skill `supabase` y hacer baseline: `list_migrations` + `list_tables` (debe existir solo `daycares` + sus 2 migraciones de SPEC 07).
2. Aplicar vía MCP `apply_migration`, en orden: `create_user_enums` → `create_users_table` → `create_handle_new_user_trigger` → `seed_test_users` (DDL y datos en migraciones separadas).
3. Verificar: enums con valores exactos; columnas/FKs/defaults de `users`; RLS enabled + 0 policies; trigger y función (SECURITY DEFINER + `set search_path`); 2 filas en `auth.users` y 2 perfiles en `public.users` (role admin/staff, daycare Sala Soles).
4. Prueba end-to-end del trigger por `execute_sql`: insert de un `auth.users` de prueba → perfil auto-creado desde `raw_user_meta_data`; delete del auth user → perfil borrado por CASCADE; sin filas residuales.
5. Correr security advisors (esperado: INFO `rls_enabled_no_policy`; sin WARN/ERROR nuevos).
6. Espejar las 4 migraciones en `supabase/migrations/` con los timestamps del historial remoto.

> **Durante la implementación** se sumó la migración `harden_handle_new_user_function` (revoke de `EXECUTE`) para resolver el WARN del advisor sobre la función SECURITY DEFINER — ver Decisions.

## Acceptance criteria

- [x] `list_migrations` muestra las migraciones nuevas en orden (`create_user_enums` → `create_users_table` → `create_handle_new_user_trigger` → `seed_test_users` → `harden_handle_new_user_function`).
- [x] `user_role` y `user_status` existen con exactamente los valores del doc de referencia.
- [x] `public.users` existe con las columnas, FKs (cascade a `auth.users`, FK a `daycares`) y defaults exactos del modelo.
- [x] `rls_enabled: true` y `pg_policies` devuelve 0 filas para `users`.
- [x] Trigger `on_auth_user_created` existe; `handle_new_user()` es SECURITY DEFINER con `search_path` fijado y `EXECUTE` revocado a `anon`/`authenticated`/`public`.
- [x] Tras el seed: 2 perfiles en `public.users` (admin + staff de Sala Soles) creados por el trigger, emails confirmados en `auth.users`.
- [x] La prueba de trigger end-to-end funciona y no deja filas residuales (re-testeada también después del revoke).
- [x] Security advisors corridos: el WARN de `handle_new_user` ejecutable por RPC quedó resuelto con la migración `harden_handle_new_user_function`; los WARNs restantes (`rls_auto_enable`, `auth_leaked_password_protection`) son preexistentes y no atribuibles a esta spec. Queda un INFO documentado (`unindexed_foreign_keys` sobre `users_daycare_id_fkey`).
- [x] `app/**` intacto; espejos en `supabase/migrations/` con SQL y timestamps idénticos al remoto (5 archivos, `20261127152615`–`20261127153746`).
- [x] `specs/.spec-config.yml` existe.

## Decisions

- **Sí:** solo los enums que usa `users` (`user_role`, `user_status`) — mantiene el patrón de una-tabla-por-spec; los otros 4 enums del doc llegan con sus tablas (resp. del usuario).
- **Sí:** trigger de perfil en esta spec — lo pide la nota de implementación del doc y hace que los seed users fluyan por el camino real (signup → perfil) (resp. del usuario).
- **Sí:** seed con insert directo en `auth.users` + `crypt()` bcrypt — todo versionado en migración, reproducible (resp. del usuario). Contraseñas demo visibles en el repo: aceptable para proyecto de prueba; rotar antes de producción.
- **Sí:** RLS enable sin policies (deny-all) — consistente con SPEC 07; las policies se diseñan en la spec de auth (resp. del usuario).
- **Sí:** ambos usuarios de prueba en "Guardería Sala Soles" (resp. del usuario; la primera del seed y la de los mockups).
- **Sí:** `coalesce(role, 'parent')` en el trigger — evita romper el signup si falta el rol en la metadata; `daycare_id` sí es obligatorio: signup sin daycare válido falla por diseño del modelo.
- **Sí:** `set search_path = ''` en la función — guía de seguridad de la skill de Supabase.
- **No:** trigger automático de `updated_at` — no hay updates desde la app todavía; se suma cuando exista flujo de edición.
- **Sí:** migración extra `harden_handle_new_user_function` (`revoke execute ... from anon, authenticated, public`) — el security advisor marcó WARN porque Postgres grantea `EXECUTE` a `PUBLIC` por defecto y la función SECURITY DEFINER era callable por RPC. Es la remediación oficial del lint; el trigger no consulta ese grant, así que sigue funcionando (re-testeado post-revoke). Decisión delegada por el usuario ("resolvé como mejor lo veas").
- **No:** índice sobre `users.daycare_id` — el advisor lo marca solo como INFO (`unindexed_foreign_keys`) y con 2 filas no impacta. Deuda anotada para la spec de auth/queries.
- **Nota:** `full_name` de los seed users quedó sin `@` (`Diego Admin` / `Lucía Staff`) — aclaración del usuario: los había editado con `@` confundiendo nombres con contraseñas.
- **Nota:** `status` queda `active` directo en el seed (email confirmado); el estado previo al signup se modela en `invitations` según el doc.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| `role` viaja en `raw_user_meta_data` (editable por el cliente en signup) → alguien podría auto-asignarse admin | Hoy no hay cliente ni policies; con auth real el rol se asigna por flujo admin (nunca confiar en metadata para autorización). Documentado como decisión a revisar en la spec de auth |
| SECURITY DEFINER rompe el signup si `daycare_id` de la metadata es inválido/ausente | Metadata controlada por seeds/flows propios; validarla cuando exista UI de signup |
| El insert manual en `auth.users` depende de defaults internos de Supabase (pueden cambiar) | Verificación inmediata post-migración; ajustar columnas dentro de la misma migración si hace falta |
| MCP aplica directo al proyecto remoto (no hay stage local) | DDL mínimo y reversible (drop type/table/trigger/function); verificación inmediata post-aplicación |
| `users_daycare_id_fkey` sin índice de cobertura (INFO del advisor) | Conocido y documentado; con el volumen actual no impacta. Se agrega el índice en la spec de auth/queries |
| Deny-all confunde al wirear el cliente (queries devuelven 0 filas / error RLS) | Anotado en Decisions; se resuelve con policies en la spec de auth |

## What is **not** in this spec

- Policies RLS, cliente supabase-js/`@supabase/ssr`, env vars, tipos generados, el resto de las tablas del schema y los otros 4 enums (`relationship_type`, `invitation_status`, `post_type`, `child_status`). Cada uno, si llega, va en su propia spec.
