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
