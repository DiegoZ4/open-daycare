-- Found while wiring real auth in SPEC 09: the SPEC 08 seed inserted users
-- directly into auth.users without matching auth.identities rows, so GoTrue
-- rejects the password grant (HTTP 400 on /token?grant_type=password).
-- 1) Create the missing email identities for the seeded users.
insert into auth.identities (user_id, provider, provider_id, identity_data, last_sign_in_at, created_at, updated_at)
select
  u.id,
  'email',
  u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  u.created_at,
  u.created_at,
  u.created_at
from auth.users u
where u.email in ('admin@sasoles.test', 'staff@sasoles.test')
  and not exists (
    select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email'
  );

-- 2) Reset the staff seed password to the documented demo password
-- (the stored hash does not match it).
update auth.users
set encrypted_password = crypt('demo-staff-2026', gen_salt('bf'))
where email = 'staff@sasoles.test';
