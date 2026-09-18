-- Fix cover_image_url paths to match actual filenames in public/uploads/
-- Run against Tencent Cloud MySQL (cpt database)
UPDATE articles SET cover_image_url = '/uploads/aiken-spring-cover.jpg' WHERE slug = 'aiken-spring-devils-eye';
UPDATE articles SET cover_image_url = '/uploads/naokoli-cover.jpg'     WHERE slug = 'tea-horse-naokoli';
