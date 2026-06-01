from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.crud import order as order_crud
from app.db.session import get_db
from app.schemas.order import OrderCreate, OrderOut, OrderItemOut

router = APIRouter(prefix="/orders", tags=["Orders"])


def map_order(order) -> OrderOut:
    return OrderOut(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.full_name,
        total_amount=order.total_amount,
        created_at=order.created_at,
        items=[
            OrderItemOut(
                id=item.id,
                product_id=item.product_id,
                product_name=item.product.name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                line_total=item.line_total,
            )
            for item in order.items
        ],
    )


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)) -> OrderOut:
    try:
        order = order_crud.create_order(db, payload)
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return map_order(order)


@router.get("", response_model=list[OrderOut])
def list_orders(db: Session = Depends(get_db)) -> list[OrderOut]:
    return [map_order(order) for order in order_crud.get_orders(db)]


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)) -> OrderOut:
    order = order_crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return map_order(order)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)) -> Response:
    order = order_crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    order_crud.delete_order(db, order)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
