from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    sku: str = Field(..., min_length=1, max_length=100)
    price: Decimal = Field(..., gt=0)
    quantity: int = Field(..., ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    sku: str | None = Field(default=None, min_length=1, max_length=100)
    price: Decimal | None = Field(default=None, gt=0)
    quantity: int | None = Field(default=None, ge=0)


class ProductOut(ProductBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
