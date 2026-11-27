# SPEC 07 — Tabla `daycares` en Supabase (primera migración formal)

> **Estado:** Implementado
> **Depends on:** ninguna (primera spec de base de datos)
> **Fecha:** 2026-11-27
> **Objetivo:** Crear la tabla `daycares` en el proyecto Supabase remoto como primera migración formal, con RLS habilitado y verificación por query de prueba.

## Scope

**In:**

- Migración formal `create_daycares_table` aplicada al proyecto remoto vía MCP (`apply_migration`), registrada en el historial de migraciones.
- Tabla `public.daycares` según la referencia `opendaycare-database-schema.md` (sección 1): `id uuid` PK default `gen_random_uuid()`, `name text not null`, `created_at timestamptz not null default now()`.
- Migración de seed `seed_daycares` con 3 daycares de ejemplo (datos reales para probar queries en las specs siguientes).
- RLS habilitado en la tabla, sin políticas todavía (deny-all hasta que exista auth).
- Verificación post-migraciones: `list_migrations`, `list_tables` verbose, filas del seed, query de prueba (insert + select + delete) y corrida de security advisors.
- Espejo local de las migraciones en `supabase/migrations/` (mismos nombres y timestamps que el historial remoto) para versionar el esquema en el repo.

**Out of scope (para futuras specs):**

- Políticas RLS (llegan con la spec de auth/`users`).
- Cliente `@supabase/ssr` en Next.js, variables de entorno y tipos TypeScript generados.
- El resto de las tablas del schema (`users`, `rooms`, `children`, …) — cada una en su propia spec/migración.

## Data model

```sql
-- Migración: create_daycares_table
create table public.daycares (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.daycares enable row level security;
```

```sql
-- Migración: seed_daycares
insert into public.daycares (name) values
  ('Guardería Sala Soles'),
  ('Guardería Los Troncos'),
  ('Guardería El Nido');
```

- Entidad raíz del modelo: futuras tablas (`users`, `rooms`) la referencian por FK.
- El seed va como migración aparte: separa DDL de datos y permite reaplicar uno sin el otro.
- Todo lo persistido va en inglés (convención del doc de referencia); los nombres de daycares son dato de usuario, no código, por eso van en español (como el ejemplo del propio doc).
- Sin `updated_at`: la referencia lo omite explícitamente para `daycares`.
- Espejo en el repo: `supabase/migrations/20261127141022_create_daycares_table.sql` y `supabase/migrations/20261127141051_seed_daycares.sql`, con el SQL exacto aplicado al proyecto remoto.

## Implementation plan

1. Baseline: verificar estado actual (`list_tables`, `list_migrations`) — hoy `public` está vacío y no hay migraciones.
2. Aplicar la migración `create_daycares_table` vía `apply_migration` con el DDL de arriba.
3. Aplicar la migración `seed_daycares` vía `apply_migration` con los 3 inserts.
4. Verificar: `list_tables` verbose muestra las 3 columnas, PK en `id` y `rls_enabled: true`; 0 policies (`select * from pg_policies where tablename = 'daycares'`); `select` devuelve exactamente las 3 filas del seed; insert/select/delete de prueba por `execute_sql` (rol admin, RLS no aplica) sin dejar filas residuales.
5. Correr security advisors y confirmar que el único hallazgo de esta tabla es el INFO esperado (`rls_enabled_no_policy`).

## Acceptance criteria

- [x] `list_migrations` muestra `create_daycares_table` registrada en el historial del proyecto.
- [x] `public.daycares` existe con exactamente `id` (uuid, PK, default `gen_random_uuid()`), `name` (text, not null) y `created_at` (timestamptz, not null, default `now()`).
- [x] `rls_enabled: true` y `pg_policies` devuelve 0 filas para la tabla.
- [x] Tras `seed_daycares`, `public.daycares` tiene exactamente 3 filas: "Guardería Sala Soles", "Guardería Los Troncos" y "Guardería El Nido".
- [x] El insert/select/delete de prueba por `execute_sql` funciona y no deja filas residuales.
- [x] Security advisors corridos: sin hallazgos nuevos de nivel WARN/ERROR atribuibles a esta tabla.
- [x] No hay cambios en archivos de la app (`app/**` intacto).
- [x] Las migraciones quedan espejadas en `supabase/migrations/` (`20261127141022_create_daycares_table.sql` y `20261127141051_seed_daycares.sql`), con el SQL idéntico al historial remoto.

## Decisions

- **Sí:** DDL vía `apply_migration` (patrón de migraciones, queda en el historial del proyecto remoto y visible en el Dashboard) — pedido explícito del usuario.
- **No:** `execute_sql` ad-hoc para el DDL — no deja historial de migraciones; queda reservado para verificación.
- **Sí:** seguir la referencia `07-DB-Schema` al pie de la letra (3 columnas, sin `updated_at`) — el doc es la fuente de verdad del modelo.
- **Sí:** RLS habilitado sin policies (deny-all) hasta que haya auth — lo más conservador; las policies se diseñan en la spec de `users`/auth.
- **Sí:** seed de 3 daycares como migración formal aparte (`seed_daycares`) — pedido del usuario; deja datos reales para probar queries en las specs siguientes y mantiene DDL y datos en migraciones separadas.
- **No:** cliente supabase-js, env vars ni tipos generados — cada uno en su propia spec.
- **Sí:** espejar las migraciones en `supabase/migrations/` como archivos `.sql` con el mismo timestamp y nombre que el historial remoto — pedido del usuario post-implementación, para versionar el esquema en el repo. No habilita por sí solo el flujo del CLI (`supabase db push` requiere `supabase init` + `link`).
- **Nota:** definición rápida sin bloque detallado de clarificación (los bloques de preguntas fueron descartados dos veces); decisiones conservadoras documentadas en esta sección.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Deny-all confunde al wirear el cliente (queries devuelven 0 filas / error RLS) | Anotado en Decisions; se resuelve con policies en la spec de auth |
| Sin `updated_at` no hay forma de rastrear renombres de la guardería | Decisión de la referencia; si aparece un flujo de edición, migración aparte que agregue la columna |
| La MCP aplica directo al proyecto remoto (no hay stage local) | DDL mínimo y reversible (`drop table`); verificación inmediata post-aplicación |

## What is **not** in this spec

- Policies RLS, cliente supabase-js, env vars, tipos generados y el resto de las tablas del schema. Cada una, si llega, va en su propia spec.
