from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    phone: str = Field(..., min_length=5, max_length=50)


class CustomerCreate(CustomerBase):
    pass


class CustomerOut(CustomerBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
