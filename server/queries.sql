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

-- Customer app: cooperatives, categories, workers, bookings, payments, etc.

CREATE TABLE IF NOT EXISTS cooperatives (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(150) NOT NULL,
    description    TEXT,
    logo_url       TEXT,
    verified_since DATE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(50) UNIQUE NOT NULL,
    icon           VARCHAR(50) NOT NULL,
    sort_order     INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS workers (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID UNIQUE NOT NULL REFERENCES users(id),
    cooperative_id       UUID REFERENCES cooperatives(id),
    bio                  TEXT,
    years_experience     INT DEFAULT 0,
    price_min            NUMERIC(10,2),
    price_max            NUMERIC(10,2),
    rating_avg           NUMERIC(3,2) NOT NULL DEFAULT 0,
    rating_count         INT NOT NULL DEFAULT 0,
    is_online            BOOLEAN NOT NULL DEFAULT false,
    verification_status  VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending','verified','rejected')),
    verification_reason  TEXT,
    lat                  DOUBLE PRECISION,
    lng                  DOUBLE PRECISION,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS worker_categories (
    worker_id      UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    category_id    UUID NOT NULL REFERENCES categories(id),
    PRIMARY KEY (worker_id, category_id)
);

CREATE TABLE IF NOT EXISTS worker_availability_slots (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id      UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    slot_date      DATE NOT NULL,
    start_time     TIME NOT NULL,
    end_time       TIME NOT NULL,
    is_booked      BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS addresses (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users(id),
    label          VARCHAR(50) NOT NULL DEFAULT 'Home',
    line1          TEXT NOT NULL,
    city           VARCHAR(100),
    state          VARCHAR(100),
    pincode        VARCHAR(10),
    lat            DOUBLE PRECISION,
    lng            DOUBLE PRECISION,
    is_default     BOOLEAN NOT NULL DEFAULT false,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id       UUID NOT NULL REFERENCES users(id),
    worker_id         UUID NOT NULL REFERENCES workers(id),
    category_id       UUID NOT NULL REFERENCES categories(id),
    address_id        UUID REFERENCES addresses(id),
    scheduled_date    DATE,
    scheduled_time    TIME,
    notes             TEXT,
    photo_url         TEXT,
    status            VARCHAR(20) NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','accepted','en_route','in_progress','completed','cancelled')),
    is_emergency      BOOLEAN NOT NULL DEFAULT false,
    price_estimate    NUMERIC(10,2),
    cancelled_reason  TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_methods (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL REFERENCES users(id),
    type               VARCHAR(10) NOT NULL CHECK (type IN ('upi','card','wallet')),
    upi_id             VARCHAR(100),
    card_last4         VARCHAR(4),
    card_brand         VARCHAR(20),
    razorpay_token_id  TEXT,
    is_default         BOOLEAN NOT NULL DEFAULT false,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id          UUID NOT NULL REFERENCES bookings(id),
    amount              NUMERIC(10,2) NOT NULL,
    method              VARCHAR(10) NOT NULL CHECK (method IN ('upi','card','wallet')),
    razorpay_order_id   TEXT,
    razorpay_payment_id TEXT,
    status              VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id     UUID UNIQUE NOT NULL REFERENCES bookings(id),
    customer_id    UUID NOT NULL REFERENCES users(id),
    worker_id      UUID NOT NULL REFERENCES workers(id),
    rating         INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment        TEXT,
    tags           TEXT[],
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS favorites (
    customer_id    UUID NOT NULL REFERENCES users(id),
    worker_id      UUID NOT NULL REFERENCES workers(id),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (customer_id, worker_id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id     UUID NOT NULL REFERENCES bookings(id),
    sender_id      UUID NOT NULL REFERENCES users(id),
    message        TEXT NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_tickets (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users(id),
    booking_id     UUID REFERENCES bookings(id),
    subject        VARCHAR(200) NOT NULL,
    message        TEXT NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
