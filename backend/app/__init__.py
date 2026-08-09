import os
from datetime import timedelta

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

from .extensions import bcrypt, db, jwt, ma, migrate

load_dotenv()


def create_app():
    app = Flask(__name__)

    # App configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL",
        "sqlite:///hotel_booking.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "local-development-secret-change-this-before-production-2026")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=int(os.getenv("JWT_ACCESS_TOKEN_HOURS", "8")))

    # CORS configuration
    frontend_urls = [url.strip() for url in os.getenv(
        "FRONTEND_URL", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",") if url.strip()]

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": frontend_urls,
            }
        },
        supports_credentials=True,
    )

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    ma.init_app(app)

    # Register models and routes
    from . import models
    from .routes import api

    app.register_blueprint(api)

    @app.get("/")
    def home():
        return {
            "message": "Karibu Kenya Hotel Booking API is running"
        }

    @app.cli.command("seed")
    def seed_command():
        from .seed import seed_database

        seed_database()
        print("Karibu Stays Kenya catalogue seeded.")

    if os.getenv("AUTO_SEED", "true").lower() == "true":
        with app.app_context():
            from .seed import seed_database

            seed_database()

    return app
