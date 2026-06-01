from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.customer import Customer
from app.models.order import Order
from app.models.product import Product
from app.schemas.order import DashboardSummary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_summary(db: Session = Depends(get_db)) -> DashboardSummary:
    total_products = db.scalar(select(func.count(Product.id))) or 0
    total_customers = db.scalar(select(func.count(Customer.id))) or 0
    total_orders = db.scalar(select(func.count(Order.id))) or 0

    low_stock = list(
        db.scalars(
            select(Product).where(Product.quantity <= settings.low_stock_threshold).order_by(Product.quantity.asc())
        ).all()
    )

    return DashboardSummary(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=[
            {"id": product.id, "name": product.name, "sku": product.sku, "quantity": product.quantity}
            for product in low_stock
        ],
    )
