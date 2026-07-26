# import os
# from dotenv import load_dotenv

# load_dotenv()


# class Config:
#     SECRET_KEY = os.getenv("SECRET_KEY")

#     SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
#     SQLALCHEMY_TRACK_MODIFICATIONS = False

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # --- JWT (admin/organizer auth) ---
    # Reuses SECRET_KEY unless you set JWT_SECRET_KEY explicitly in .env -
    # fine to keep them the same for now, separate is only worth it if
    # you ever want to rotate one without invalidating the other.
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_SECONDS", 60 * 60 * 8))  # 8 hours

    # --- Razorpay ---
    RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
    RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
    RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")
