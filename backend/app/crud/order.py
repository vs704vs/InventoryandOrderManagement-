from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate


def create_order(db: Session, payload: OrderCreate) -> Order:
    customer = db.get(Customer, payload.customer_id)
    if not customer:
        raise ValueError("Customer not found")

    product_ids = {item.product_id for item in payload.items}
    statement = select(Product).where(Product.id.in_(product_ids)).with_for_update()
    products = {product.id: product for product in db.scalars(statement).all()}

    missing_products = [pid for pid in product_ids if pid not in products]
    if missing_products:
        raise ValueError(f"Product(s) not found: {missing_products}")

    order = Order(customer_id=payload.customer_id, total_amount=Decimal("0.00"))
    db.add(order)
    db.flush()

    total = Decimal("0.00")

    for item in payload.items:
        product = products[item.product_id]
        if product.quantity < item.quantity:
            raise ValueError(
                f"Insufficient inventory for product '{product.name}' (available: {product.quantity}, requested: {item.quantity})"
            )

        line_total = Decimal(product.price) * item.quantity
        total += line_total

        product.quantity -= item.quantity
        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=item.quantity,
            unit_price=product.price,
            line_total=line_total,
        )
        db.add(order_item)

    order.total_amount = total
    db.add(order)
    db.commit()
    db.refresh(order)

    return get_order(db, order.id)


def get_orders(db: Session) -> list[Order]:
    statement = (
        select(Order)
        .options(
            selectinload(Order.customer),
            selectinload(Order.items).selectinload(OrderItem.product),
        )
        .order_by(Order.id.desc())
    )
    return list(db.scalars(statement).all())


def get_order(db: Session, order_id: int) -> Order | None:
    statement = (
        select(Order)
        .where(Order.id == order_id)
        .options(
            selectinload(Order.customer),
            selectinload(Order.items).selectinload(OrderItem.product),
        )
    )
    return db.scalar(statement)


def delete_order(db: Session, order: Order) -> None:
    for item in order.items:
        product = db.get(Product, item.product_id)
        if product:
            product.quantity += item.quantity
            db.add(product)

    db.delete(order)
    db.commit()
