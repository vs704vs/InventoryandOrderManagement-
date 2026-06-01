from app.db.session import engine
from app.models import customer, order, product  # noqa: F401
from app.models.base import Base


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
