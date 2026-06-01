from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.crud import product as product_crud
from app.db.session import get_db
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)) -> ProductOut:
    existing = product_crud.get_product_by_sku(db, payload.sku)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")

    try:
        return product_crud.create_product(db, payload)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not create product") from exc


@router.get("", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db)) -> list[ProductOut]:
    return product_crud.get_products(db)


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)) -> ProductOut:
    product = product_crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)) -> ProductOut:
    product = product_crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if payload.sku and payload.sku != product.sku:
        sku_owner = product_crud.get_product_by_sku(db, payload.sku)
        if sku_owner and sku_owner.id != product.id:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")

    try:
        return product_crud.update_product(db, product, payload)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not update product") from exc


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)) -> Response:
    product = product_crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    try:
        product_crud.delete_product(db, product)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Product cannot be deleted because it is linked to existing orders",
        ) from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)
