"""Seeds categories, cooperatives, and ~25 realistic workers so the app has
something to browse. Idempotent — safe to re-run (checks before inserting)."""
import random
from datetime import date, time, timedelta

from db.config import get_db

CATEGORIES = [
    ("Electrician", "Zap"),
    ("Plumber", "Wrench"),
    ("Carpenter", "Hammer"),
    ("Painter", "Paintbrush"),
    ("Domestic Help", "Home"),
    ("Caregiver", "HeartHandshake"),
    ("Driver", "Car"),
    ("Gardener", "Sprout"),
    ("Cleaner", "Sparkles"),
    ("Technician", "Settings"),
]

COOPERATIVES = [
    ("Kudumbashree Workers Cooperative", "Kerala's women-led labour cooperative federation"),
    ("Karnataka Domestic Workers Union", "Bengaluru-based cooperative for domestic and care workers"),
    ("Delhi Electricians & Technicians Guild", "Skilled trades cooperative serving the NCR"),
    ("Mumbai Skilled Trades Cooperative", "Multi-trade cooperative society, Mumbai metro"),
    ("Tamil Nadu Labour Welfare Cooperative", "Statewide cooperative for construction and home-service trades"),
]

FIRST_NAMES = [
    "Ramesh", "Suresh", "Anita", "Lakshmi", "Manoj", "Priya", "Vikram", "Sunita",
    "Rajesh", "Kavita", "Arun", "Deepa", "Sanjay", "Meena", "Prakash", "Geeta",
    "Ravi", "Pooja", "Ashok", "Rekha", "Vijay", "Shanti", "Kiran", "Usha", "Mahesh",
]
LAST_NAMES = [
    "Kumar", "Sharma", "Patel", "Reddy", "Singh", "Nair", "Iyer", "Gupta",
    "Verma", "Rao", "Menon", "Das", "Pillai", "Joshi", "Chauhan",
]

BENGALURU_LAT, BENGALURU_LNG = 12.9716, 77.5946

TAGS_POOL = ["On time", "Professional", "Great work", "Polite", "Skilled", "Fair pricing"]
COMMENTS = [
    "Fixed the issue quickly and explained what was wrong.",
    "Very professional, would book again.",
    "Arrived on time and did neat work.",
    "Good value for the price.",
    "Friendly and skilled — highly recommend.",
]


def seed_categories(cur):
    category_ids = {}
    for i, (name, icon) in enumerate(CATEGORIES):
        cur.execute(
            """
            INSERT INTO categories (name, icon, sort_order)
            VALUES (%s, %s, %s)
            ON CONFLICT (name) DO UPDATE SET icon = EXCLUDED.icon
            RETURNING id
            """,
            (name, icon, i),
        )
        category_ids[name] = cur.fetchone()["id"]
    return category_ids


def seed_cooperatives(cur):
    coop_ids = []
    for name, description in COOPERATIVES:
        cur.execute("SELECT id FROM cooperatives WHERE name = %s", (name,))
        row = cur.fetchone()
        if row:
            coop_ids.append(row["id"])
            continue
        cur.execute(
            """
            INSERT INTO cooperatives (name, description, verified_since)
            VALUES (%s, %s, %s)
            RETURNING id
            """,
            (name, description, date.today() - timedelta(days=random.randint(365, 365 * 6))),
        )
        coop_ids.append(cur.fetchone()["id"])
    return coop_ids


def seed_workers(cur, category_ids, coop_ids, count=25):
    category_names = list(category_ids.keys())
    worker_ids = []

    for i in range(count):
        phone = f"9{800000000 + i:09d}"[:10]
        name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"

        cur.execute("SELECT id FROM users WHERE phone = %s", (phone,))
        existing = cur.fetchone()
        if existing:
            user_id = existing["id"]
        else:
            cur.execute(
                """
                INSERT INTO users (phone, role, name, photo_url, language)
                VALUES (%s, 'worker', %s, %s, 'en')
                RETURNING id
                """,
                (phone, name, f"https://i.pravatar.cc/150?img={i + 1}"),
            )
            user_id = cur.fetchone()["id"]

        cur.execute("SELECT id FROM workers WHERE user_id = %s", (user_id,))
        existing_worker = cur.fetchone()
        if existing_worker:
            worker_ids.append((existing_worker["id"], category_names))
            continue

        price_min = random.choice([150, 200, 250, 300, 400])
        price_max = price_min + random.choice([200, 300, 500])
        rating_count = random.randint(8, 120)
        rating_avg = round(random.uniform(3.8, 5.0), 2)
        lat = BENGALURU_LAT + random.uniform(-0.08, 0.08)
        lng = BENGALURU_LNG + random.uniform(-0.08, 0.08)
        years_experience = random.randint(2, 15)

        cur.execute(
            """
            INSERT INTO workers (
                user_id, cooperative_id, bio, years_experience,
                price_min, price_max, rating_avg, rating_count,
                is_online, verification_status, lat, lng
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'verified', %s, %s)
            RETURNING id
            """,
            (
                user_id,
                random.choice(coop_ids),
                f"{years_experience} years of experience, cooperative-verified professional.",
                years_experience,
                price_min,
                price_max,
                rating_avg,
                rating_count,
                random.random() < 0.6,
                lat,
                lng,
            ),
        )
        worker_id = cur.fetchone()["id"]

        worker_categories = random.sample(category_names, k=random.choice([1, 1, 2]))
        for cat_name in worker_categories:
            cur.execute(
                """
                INSERT INTO worker_categories (worker_id, category_id)
                VALUES (%s, %s)
                ON CONFLICT DO NOTHING
                """,
                (worker_id, category_ids[cat_name]),
            )

        for d in range(7):
            slot_date = date.today() + timedelta(days=d)
            for hour in random.sample([9, 11, 13, 15, 17], k=3):
                cur.execute(
                    """
                    INSERT INTO worker_availability_slots (worker_id, slot_date, start_time, end_time)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (worker_id, slot_date, time(hour, 0), time(hour + 1, 0)),
                )

        worker_ids.append((worker_id, worker_categories))

    return worker_ids


def main():
    with get_db() as (cur, conn):
        category_ids = seed_categories(cur)
        coop_ids = seed_cooperatives(cur)
        workers = seed_workers(cur, category_ids, coop_ids)
        print(f"Seeded {len(category_ids)} categories, {len(coop_ids)} cooperatives, {len(workers)} workers.")


if __name__ == "__main__":
    main()
