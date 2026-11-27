-- GoTrue scans these text columns as non-nullable strings (GoTrue-created
-- users carry empty strings, not NULLs). The SPEC 08 SQL seed left them
-- NULL, which broke the user row scan with "converting NULL to string is
-- unsupported". role = 'authenticated' is also what GoTrue-born users carry.
-- phone stays NULL: it has a unique index and email-only users are NULL.
update auth.users
set confirmation_token = '',
    recovery_token = '',
    email_change = '',
    email_change_token_new = '',
    role = 'authenticated'
where instance_id = '00000000-0000-0000-0000-000000000000';
