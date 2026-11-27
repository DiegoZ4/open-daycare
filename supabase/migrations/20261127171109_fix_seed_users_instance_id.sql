-- GoTrue looks up password-grant users with
-- instance_id = '00000000-0000-0000-0000-000000000000' (uuid.Nil) and
-- aud = 'authenticated'. The SPEC 08 SQL seed left instance_id NULL, so the
-- lookup missed the users and returned invalid_credentials.
-- Users born through GoTrue carry the zero uuid, so NULL is normalized here.
update auth.users
set instance_id = '00000000-0000-0000-0000-000000000000'
where instance_id is null;
