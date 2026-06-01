from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


def create_product(db: Session, payload: ProductCreate) -> Product:
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def get_products(db: Session) -> list[Product]:
    return list(db.scalars(select(Product).order_by(Product.id.desc())).all())


def get_product(db: Session, product_id: int) -> Product | None:
    return db.get(Product, product_id)


def get_product_by_sku(db: Session, sku: str) -> Product | None:
    statement = select(Product).where(Product.sku == sku)
    return db.scalar(statement)


def update_product(db: Session, product: Product, payload: ProductUpdate) -> Product:
    changes = payload.model_dump(exclude_unset=True)
    for field, value in changes.items():
        setattr(product, field, value)

    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product: Product) -> None:
    db.delete(product)
    db.commit()
