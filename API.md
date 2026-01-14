# 🔐 API Documentation - WindWireless SaaS

## Overview

This document provides comprehensive documentation for all API routes in the WindWireless SaaS application.

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication

All API routes (except auth endpoints) require a valid Supabase session token.

### Headers

```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

---

## API Routes

### Authentication

#### POST /api/auth/login

Login with email and password.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "admin"
    },
    "session": {
      "access_token": "token",
      "refresh_token": "token"
    }
  }
}
```

#### POST /api/auth/logout

Logout current user.

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Inventory

#### GET /api/inventory

Get inventory list with pagination and filters.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 50)
- `search` (optional): Search term
- `status` (optional): Filter by status
- `model_id` (optional): Filter by model

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "model_id": "uuid",
      "imei": "123456789012345",
      "capacity": "128GB",
      "color": "Black",
      "grade": "A",
      "price": 450.0,
      "status": "available",
      "product_catalog": {
        "model": "iPhone 13",
        "manufacturer": {
          "name": "Apple"
        }
      }
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 50
}
```

#### POST /api/inventory

Create a new inventory item.

**Request:**

```json
{
  "model_id": "uuid",
  "imei": "123456789012345",
  "capacity": "128GB",
  "color": "Black",
  "grade": "A",
  "price": 450.0,
  "status": "available",
  "stock_location_id": "uuid",
  "supplier_id": "uuid",
  "purchase_invoice": "INV-001"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "model_id": "uuid",
    "imei": "123456789012345",
    "created_at": "2026-01-09T10:00:00Z"
  }
}
```

#### PATCH /api/inventory/[id]

Update an inventory item.

**Request:**

```json
{
  "status": "sold",
  "price": 475.0
}
```

#### DELETE /api/inventory/[id]

Soft delete an inventory item.

---

### Product Catalog

#### GET /api/products

Get product catalog.

**Query Parameters:**

- `product_type_id` (optional): Filter by product type
- `manufacturer_id` (optional): Filter by manufacturer
- `search` (optional): Search term

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "model": "iPhone 13",
      "release_year": 2021,
      "manufacturer": {
        "name": "Apple"
      },
      "product_type": {
        "name": "Smartphone",
        "tracking_method": "imei"
      }
    }
  ]
}
```

#### POST /api/products

Create a new product model.

**Request:**

```json
{
  "model": "iPhone 15 Pro",
  "product_type_id": "uuid",
  "manufacturer_id": "uuid",
  "release_year": 2023
}
```

---

### Agents

#### GET /api/agents

Get list of agents (suppliers, customers, partners).

**Query Parameters:**

- `is_supplier` (optional): Filter suppliers
- `is_customer` (optional): Filter customers
- `search` (optional): Search term
- `country` (optional): Filter by country

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "ABC Electronics",
      "person_type": "company",
      "document_number": "12-3456789",
      "country": "USA",
      "email": "contact@abc.com",
      "phone": "+1 555-1234",
      "is_supplier": true,
      "is_customer": false
    }
  ]
}
```

#### POST /api/agents

Create a new agent.

#### PATCH /api/agents/[id]

Update an agent.

#### DELETE /api/agents/[id]

Soft delete an agent.

---

### Users

#### GET /api/users

Get list of users (admin only).

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "manager",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/invite-user

Invite a new user (admin only).

**Request:**

```json
{
  "email": "newuser@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "operator"
}
```

#### PATCH /api/users/[id]

Update user information.

#### DELETE /api/users/[id]

Deactivate a user.

---

### Manufacturers

#### GET /api/manufacturers

Get list of manufacturers.

#### POST /api/manufacturers

Create a new manufacturer.

**Request:**

```json
{
  "name": "Samsung"
}
```

---

### Product Types

#### GET /api/product-types

Get list of product types.

#### POST /api/product-types

Create a new product type.

**Request:**

```json
{
  "name": "Smartwatch",
  "tracking_method": "serial"
}
```

---

### Stock Locations

#### GET /api/stock-locations

Get list of stock locations.

#### POST /api/stock-locations

Create a new stock location.

**Request:**

```json
{
  "name": "Orlando Warehouse",
  "description": "Main warehouse in Orlando",
  "address": "123 Main St",
  "city": "Orlando",
  "state": "FL",
  "country": "USA",
  "zip_code": "32801"
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- Authenticated users: 100 requests/minute
- Anonymous: 20 requests/minute

## Pagination

All list endpoints support pagination:

- Default page size: 50
- Max page size: 100

---

**Last Updated**: January 2026
