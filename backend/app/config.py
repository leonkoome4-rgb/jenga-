import os
from datetime import timedelta


class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)

    AI_API_KEY = os.environ.get("AI_API_KEY")
    AI_MODEL = os.environ.get("AI_MODEL", "openai/gpt-oss-120b")
    AI_BASE_URL = os.environ.get("AI_BASE_URL", "https://api.groq.com/openai/v1")


class TestConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "TEST_DATABASE_URL", "postgresql+psycopg://localhost/tawi_test"
    )
    TESTING = True
    JWT_SECRET_KEY = "test-secret-key-that-is-long-enough-for-hs256"
