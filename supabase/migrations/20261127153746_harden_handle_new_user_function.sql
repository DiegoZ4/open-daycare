-- El trigger no necesita el grant de EXECUTE (los triggers no lo consultan);
-- se revoca para que nadie pueda llamar la funcion SECURITY DEFINER por RPC.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
