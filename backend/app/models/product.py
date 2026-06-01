from decimal import Decimal

from sqlalchemy import CheckConstraint, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (CheckConstraint("quantity >= 0", name="ck_products_quantity_nonnegative"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    sku: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    quantity: Mapped[int] = mapped_column(nullable=False, default=0)

    order_items = relationship("OrderItem", back_populates="product", cascade="all, delete")
