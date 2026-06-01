# Inventory & Order Management System

Full-stack application with a React frontend and FastAPI backend for managing products, customers, orders, and stock levels.

## Tech Stack

- Backend: Python + FastAPI + SQLAlchemy
- Frontend: React (Vite)
- Database: PostgreSQL

## Features Implemented

- Product management
  - Create, list, get by ID, update, delete
  - Unique SKU validation
  - Quantity non-negative validation
- Customer management
  - Create, list, get by ID, delete
  - Unique email validation
- Order management
  - Create, list, get by ID, delete
  - Multi-item orders
  - Automatic total calculation
  - Inventory check before order creation
  - Automatic stock deduction on order creation
  - Stock restoration when order is deleted
- Dashboard summary
  - Total products, customers, orders
  - Low-stock product list

## Project Structure

```text
backend/
  app/
    api/
    core/
    crud/
    db/
    models/
    schemas/
    main.py
  requirements.txt
  .env.example

frontend/
  src/
    api/
    pages/
    components/
    App.jsx
    main.jsx
    styles.css
  package.json
  .env.example
```

## Run Backend

1. Create and activate a virtual environment.
2. Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

3. Configure environment:

```bash
copy .env.example .env
```

4. Start API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: `http://localhost:8000/docs`

## Run Frontend

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Configure environment:

```bash
copy .env.example .env
```

3. Start app:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

## API Endpoints

- `POST /products`
- `GET /products`
- `GET /products/{id}`
- `PUT /products/{id}`
- `DELETE /products/{id}`
- `POST /customers`
- `GET /customers`
- `GET /customers/{id}`
- `DELETE /customers/{id}`
- `POST /orders`
- `GET /orders`
- `GET /orders/{id}`
- `DELETE /orders/{id}`
- `GET /dashboard/summary`
- `GET /health`
