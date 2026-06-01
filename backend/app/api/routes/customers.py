from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.crud import customer as customer_crud
from app.db.session import get_db
from app.schemas.customer import CustomerCreate, CustomerOut

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)) -> CustomerOut:
    existing = customer_crud.get_customer_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Customer email already exists")

    try:
        return customer_crud.create_customer(db, payload)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not create customer") from exc


@router.get("", response_model=list[CustomerOut])
def list_customers(db: Session = Depends(get_db)) -> list[CustomerOut]:
    return customer_crud.get_customers(db)


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: int, db: Session = Depends(get_db)) -> CustomerOut:
    customer = customer_crud.get_customer(db, customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db)) -> Response:
    customer = customer_crud.get_customer(db, customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    try:
        customer_crud.delete_customer(db, customer)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Customer cannot be deleted because it is linked to existing orders",
        ) from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)
