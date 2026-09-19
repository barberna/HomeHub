
-- If any statement fails, stop immediately and return a failure result.
\set ON_ERROR_STOP on

/*
Role attributes
→ determine broad capabilities

Database CONNECT
→ permits entering the database

Schema USAGE
→ permits resolving objects in the namespace

Table SELECT/INSERT/UPDATE/DELETE
→ permits actual data operations
*/

DO $bootstrap$
BEGIN

-- If the role already exists, the CREATE ROLE statement is skipped.

    /*
    LOGIN: it can authenticate after we assign a password.
    NOSUPERUSER: it cannot bypass PostgreSQL security.
    NOCREATEDB: it cannot create databases.
    NOCREATEROLE: it cannot create or alter other identities.
    NOINHERIT: it does not automatically inherit future role memberships.
    NOREPLICATION: it cannot use replication privileges.
    NOBYPASSRLS: it cannot bypass future row-level security policies.
    */

IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_roles
    WHERE rolname = 'homehub_migrator'
) THEN
    CREATE ROLE homehub_migrator
        WITH
            LOGIN
            NOSUPERUSER
            NOCREATEDB
            CREATEROLE
            NOINHERIT
            NOREPLICATION
            NOBYPASSRLS;
        END IF;

IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_roles
    WHERE rolname = 'homehub_app'
) THEN
    CREATE ROLE homehub_app
        WITH
            LOGIN
            NOSUPERUSER
            NOCREATEDB
            NOCREATEROLE
            NOINHERIT
            NOREPLICATION
            NOBYPASSRLS;
        END IF;
END
$bootstrap$;


ALTER ROLE homehub_migrator
    WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE
    NOINHERIT NOREPLICATION NOBYPASSRLS;

ALTER ROLE homehub_app
    WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE
    NOINHERIT NOREPLICATION NOBYPASSRLS;


DO $database_privileges$
BEGIN
    EXECUTE format(
        'REVOKE ALL PRIVILEGES ON DATABASE %I FROM PUBLIC',
        current_database()
    );

    EXECUTE format(
        'GRANT CONNECT ON DATABASE %I TO homehub_migrator, homehub_app',
        current_database()
    );
END
$database_privileges$;


-- Prevent arbitrary database roles from creating objects.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- Prisma migrations can create database objects.
GRANT USAGE, CREATE
    ON SCHEMA public
    TO homehub_migrator;

-- The application can resolve object names but cannot create objects.
GRANT USAGE
    ON SCHEMA public
    TO homehub_app;