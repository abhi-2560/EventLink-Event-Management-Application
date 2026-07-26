from app import create_app
from app.extensions import db
from app.models.admin import Admin
from werkzeug.security import generate_password_hash

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
        )

        db.session.add(admin)
        db.session.commit()
        print("Admin created successfully.")