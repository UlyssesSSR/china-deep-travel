-- Check if articles have embedded images in content
SELECT slug, LEFT(content, 200) FROM articles WHERE slug IN ('tea-horse-naokoli', 'aiken-spring-devils-eye');
