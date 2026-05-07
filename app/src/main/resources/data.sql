-- Default admin: email=admin@medicita.com / password=Admin2026*
INSERT INTO users (id, first_name, last_name, email, password, user_role, active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Admin',
    'MediCita',
    'admin@medicita.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'ADMIN',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;
