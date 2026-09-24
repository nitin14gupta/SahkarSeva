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

-- Worker app: registration/documents, job execution loop, earnings, payout, welfare.

ALTER TABLE workers ADD COLUMN IF NOT EXISTS id_number VARCHAR(50);
ALTER TABLE workers ADD COLUMN IF NOT EXISTS payout_schedule VARCHAR(10) NOT NULL DEFAULT 'weekly'
    CHECK (payout_schedule IN ('daily','weekly','monthly'));

CREATE TABLE IF NOT EXISTS worker_documents (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id      UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    doc_type       VARCHAR(30) NOT NULL CHECK (doc_type IN ('id_proof','skill_certificate')),
    url            TEXT NOT NULL,
    label          VARCHAR(100),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cooperatives ADD COLUMN IF NOT EXISTS commission_pct NUMERIC(5,2) NOT NULL DEFAULT 5.00;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS before_photo_url TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS after_photo_url TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS final_amount NUMERIC(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completion_confirmed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS worker_payout_accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id       UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    method          VARCHAR(10) NOT NULL CHECK (method IN ('bank','upi')),
    account_holder  VARCHAR(150),
    account_number  VARCHAR(34),
    ifsc            VARCHAR(11),
    upi_id          VARCHAR(100),
    is_default      BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS worker_welfare_enrollments (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id      UUID UNIQUE NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    status         VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active')),
    eshram_uan     VARCHAR(20),
    scheme_name    VARCHAR(150),
    enrolled_at    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Booking issue photos: was a single optional photo_url that the client never
-- actually uploaded — replaced with a required 2-12 photo array.
ALTER TABLE bookings DROP COLUMN IF EXISTS photo_url;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS photo_urls TEXT[] NOT NULL DEFAULT '{}';

-- Read receipts for the realtime booking chat.
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Card payments dropped — UPI/wallet only.
ALTER TABLE payment_methods DROP COLUMN IF EXISTS card_last4;
ALTER TABLE payment_methods DROP COLUMN IF EXISTS card_brand;
ALTER TABLE payment_methods DROP CONSTRAINT IF EXISTS payment_methods_type_check;
ALTER TABLE payment_methods ADD CONSTRAINT payment_methods_type_check CHECK (type IN ('upi','wallet'));
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check;
ALTER TABLE payments ADD CONSTRAINT payments_method_check CHECK (method IN ('upi','wallet'));

CREATE TABLE IF NOT EXISTS notifications (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users(id),
    title          VARCHAR(150) NOT NULL,
    body           TEXT,
    type           VARCHAR(30) NOT NULL DEFAULT 'general',
    booking_id     UUID REFERENCES bookings(id),
    is_read        BOOLEAN NOT NULL DEFAULT false,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS worker_welfare_claims (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id       UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    reason          TEXT NOT NULL,
    amount_claimed  NUMERIC(10,2),
    status          VARCHAR(20) NOT NULL DEFAULT 'submitted'
                        CHECK (status IN ('submitted','under_review','approved','rejected')),
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at     TIMESTAMPTZ,
    resolved_at     TIMESTAMPTZ
);
