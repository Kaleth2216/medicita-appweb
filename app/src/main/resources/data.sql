-- Default admin: email=admin@medicita.com / password=Admin2026*
INSERT INTO users (id, first_name, last_name, email, password, user_role, active, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Admin',
    'MediCita',
    'admin@medicita.com',
    '$2a$10$OWqqK.30B1lsdNwPp8S7q.hNfKVS6ecCFQCR4udBzVt4Iz6/qaFde',
    'ADMIN',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;
