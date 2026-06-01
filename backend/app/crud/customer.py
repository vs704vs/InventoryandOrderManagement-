from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate


def create_customer(db: Session, payload: CustomerCreate) -> Customer:
    customer = Customer(**payload.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


def get_customers(db: Session) -> list[Customer]:
    return list(db.scalars(select(Customer).order_by(Customer.id.desc())).all())


def get_customer(db: Session, customer_id: int) -> Customer | None:
    return db.get(Customer, customer_id)


def get_customer_by_email(db: Session, email: str) -> Customer | None:
    statement = select(Customer).where(Customer.email == email)
    return db.scalar(statement)


def delete_customer(db: Session, customer: Customer) -> None:
    db.delete(customer)
    db.commit()
