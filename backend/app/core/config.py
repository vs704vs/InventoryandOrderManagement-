from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Inventory & Order Management API"
    app_env: str = "development"
    debug: bool = True

    database_url: str = "postgresql+psycopg://postgres:postgres@db:5432/inventory_db"
    cors_origins: str = "http://localhost:5173"
    low_stock_threshold: int = 5

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
