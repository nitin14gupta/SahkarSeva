-- SahkarSeva schema. Append new tables here as they're added; this file is
-- the source of truth, kept in sync with what's actually run against the DB.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone          VARCHAR(15) UNIQUE NOT NULL,
    role           VARCHAR(10) CHECK (role IN ('customer', 'worker')),
    name           VARCHAR(100),
    photo_url      TEXT,
    language       VARCHAR(10) DEFAULT 'en',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
