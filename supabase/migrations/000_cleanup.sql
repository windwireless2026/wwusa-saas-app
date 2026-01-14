-- ⚠️ WARNING: THIS WILL DELETE ALL DATA IN THE PUBLIC SCHEMA ⚠️
-- Run this only if you want a complete reset of the database.

-- Drop all tables in public schema
do $$ declare
    r record;
begin
    for r in (select tablename from pg_tables where schemaname = 'public') loop
        execute 'drop table if exists ' || quote_ident(r.tablename) || ' cascade';
    end loop;
end $$;

-- Drop all enums/types
do $$ declare
    r record;
begin
    for r in (select typname from pg_type where typnamespace = 'public'::regnamespace) loop
        execute 'drop type if exists ' || quote_ident(r.typname) || ' cascade';
    end loop;
end $$;

-- Drop all functions
do $$ declare
    r record;
begin
    for r in (select proname, oid from pg_proc where pronamespace = 'public'::regnamespace) loop
        execute 'drop function if exists ' || quote_ident(r.proname) || ' cascade';
    end loop;
end $$;

-- Re-enable standard extensions if needed
create extension if not exists "uuid-ossp";
