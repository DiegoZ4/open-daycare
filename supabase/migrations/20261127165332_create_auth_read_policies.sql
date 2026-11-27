-- SPEC 09: policies de lectura minimas para que un usuario autenticado
-- pueda cargar su propio perfil (users) y su daycare (daycares).
-- La policy de daycares se apoya en la de users (el subquery solo
-- necesita leer la propia fila).
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
