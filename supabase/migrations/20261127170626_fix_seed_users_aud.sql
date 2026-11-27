-- GoTrue looks up password-grant users by email + aud ('authenticated').
-- The SPEC 08 SQL seed left auth.users.aud NULL; normalize to what
-- GoTrue-born users carry.
update auth.users
set aud = 'authenticated'
where email in ('admin@sasoles.test', 'staff@sasoles.test')
  and aud is null;
