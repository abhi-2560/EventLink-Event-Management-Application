from app import create_app
from app.extensions import db
from app.models.admin import Admin
from app.models.category import Category
from app.models.event import Event
from sqlalchemy import func
from werkzeug.security import generate_password_hash

DEFAULT_CATEGORIES = [
    ("Conference", "Professional conferences and summits"),
    ("Workshop", "Hands-on workshops and training sessions"),
    ("Movie", "Movie screenings and film events"),
    ("Concert", "Live music and concerts"),
    ("Sports", "Sports events and tournaments"),
    ("Other", "Events that do not fit other categories"),
]

app = create_app()

with app.app_context():
    existing = Admin.query.filter_by(email="admin@example.com").first()

    if existing:
        print("Admin already exists.")
    else:
        admin = Admin(
            name="Super Admin",
            email="admin@example.com",
            password_hash=generate_password_hash("Admin@123"),
            status="ACTIVE",
            convenience_fee=0,
            gateway_fee=0,
        )
        db.session.add(admin)
        db.session.commit()
        print("Admin created successfully.")

    for name, description in DEFAULT_CATEGORIES:
        if not Category.query.filter_by(name=name).first():
            db.session.add(Category(name=name, description=description, is_default=True))
            print(f"Category created: {name}")

    db.session.commit()

    counts = (
        db.session.query(
            Event.category_id,
            func.count(Event.event_id),
        )
        .filter(Event.archived_at.is_(None))
        .group_by(Event.category_id)
        .all()
    )
    count_by_category = {category_id: count for category_id, count in counts}

    for category in Category.query.all():
        category.total_events = count_by_category.get(category.category_id, 0)

    db.session.commit()
    print("Category event counts backfilled.")
    print("Seed complete.")
