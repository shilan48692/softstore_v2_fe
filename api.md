# API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "0123456789"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

## Products

### Get All Products
```http
GET /products
```

Query Parameters:
- `name`: Tìm theo tên sản phẩm
- `categoryId`: Lọc theo danh mục
- `minPrice`: Giá tối thiểu
- `maxPrice`: Giá tối đa
- `inStock`: Lọc theo tình trạng hàng tồn kho (true/false)
- `tags`: Lọc theo tags (array)

Response:
```json
[
  {
    "id": "string",
    "name": "string",
    "slug": "string",
    "gameCode": "string",
    "analyticsCode": "string",
    "requirePhone": boolean,
    
    "shortDescription": "string",
    "description": "string",
    "warrantyPolicy": "string",
    "faq": "string",
    
    "metaTitle": "string",
    "metaDescription": "string",
    "mainKeyword": "string",
    "secondaryKeywords": ["string"],
    "tags": ["string"],
    
    "popupEnabled": boolean,
    "popupTitle": "string",
    "popupContent": "string",
    
    "guideUrl": "string",
    "imageUrl": "string",
    "originalPrice": number,
    "importPrice": number,
    "importSource": "string",
    "quantity": number,
    "autoSyncQuantityWithKey": boolean,
    "minPerOrder": number,
    "maxPerOrder": number,
    "autoDeliverKey": boolean,
    "showMoreDescription": boolean,
    "promotionEnabled": boolean,
    "lowStockWarning": number,
    "gameKeyText": "string",
    "guideText": "string",
    "expiryDays": number,
    "allowComment": boolean,
    
    "promotionPrice": number,
    "promotionStartDate": "datetime",
    "promotionEndDate": "datetime",
    "promotionQuantity": number,
    
    "categoryId": "string",
    "additionalRequirementIds": ["string"],
    
    "customHeadCode": "string",
    "customBodyCode": "string",
    
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
]
```

### Get Product by ID
```http
GET /products/:id
```

Response: Same as product object above

### Get Product by Slug
```http
GET /products/by-slug/:slug
```

Response: Same as product object above

### Create Product (Admin only)
```http
POST /admin/products
Authorization: Bearer your-token
Content-Type: application/json

{
  "name": "string",
  "slug": "string",
  "gameCode": "string",
  "analyticsCode": "string",
  "requirePhone": boolean,
  
  "shortDescription": "string",
  "description": "string",
  "warrantyPolicy": "string",
  "faq": "string",
  
  "metaTitle": "string",
  "metaDescription": "string",
  "mainKeyword": "string",
  "secondaryKeywords": ["string"],
  "tags": ["string"],
  
  "popupEnabled": boolean,
  "popupTitle": "string",
  "popupContent": "string",
  
  "guideUrl": "string",
  "imageUrl": "string",
  "originalPrice": number,
  "importPrice": number,
  "importSource": "string",
  "quantity": number,
  "autoSyncQuantityWithKey": boolean,
  "minPerOrder": number,
  "maxPerOrder": number,
  "autoDeliverKey": boolean,
  "showMoreDescription": boolean,
  "promotionEnabled": boolean,
  "lowStockWarning": number,
  "gameKeyText": "string",
  "guideText": "string",
  "expiryDays": number,
  "allowComment": boolean,
  
  "promotionPrice": number,
  "promotionStartDate": "datetime",
  "promotionEndDate": "datetime",
  "promotionQuantity": number,
  
  "categoryId": "string",
  "additionalRequirementIds": ["string"],
  
  "customHeadCode": "string",
  "customBodyCode": "string"
}
```

### Update Product (Admin only)
```http
PATCH /admin/products/:id
Authorization: Bearer your-token
Content-Type: application/json

{
  "name": "string",
  "slug": "string",
  "gameCode": "string",
  "analyticsCode": "string",
  "requirePhone": boolean,
  
  "shortDescription": "string",
  "description": "string",
  "warrantyPolicy": "string",
  "faq": "string",
  
  "metaTitle": "string",
  "metaDescription": "string",
  "mainKeyword": "string",
  "secondaryKeywords": ["string"],
  "tags": ["string"],
  
  "popupEnabled": boolean,
  "popupTitle": "string",
  "popupContent": "string",
  
  "guideUrl": "string",
  "imageUrl": "string",
  "originalPrice": number,
  "importPrice": number,
  "importSource": "string",
  "quantity": number,
  "autoSyncQuantityWithKey": boolean,
  "minPerOrder": number,
  "maxPerOrder": number,
  "autoDeliverKey": boolean,
  "showMoreDescription": boolean,
  "promotionEnabled": boolean,
  "lowStockWarning": number,
  "gameKeyText": "string",
  "guideText": "string",
  "expiryDays": number,
  "allowComment": boolean,
  
  "promotionPrice": number,
  "promotionStartDate": "datetime",
  "promotionEndDate": "datetime",
  "promotionQuantity": number,
  
  "categoryId": "string",
  "additionalRequirementIds": ["string"],
  
  "customHeadCode": "string",
  "customBodyCode": "string"
}
```

### Delete Product (Admin only)
```http
DELETE /admin/products/:id
Authorization: Bearer your-token
```

## Orders

### Create Order
```http
POST /orders
Authorization: Bearer your-token
Content-Type: application/json

{
  "items": [
    {
      "productId": "string",
      "quantity": number
    }
  ],
  "paymentMethod": "string",
  "paymentStatus": "string",
  "shippingAddress": {
    "fullName": "string",
    "phone": "string",
    "address": "string",
    "city": "string",
    "district": "string",
    "ward": "string"
  }
}
```

Response:
```json
{
  "id": "string",
  "userId": "string",
  "items": [
    {
      "productId": "string",
      "quantity": number,
      "price": number
    }
  ],
  "totalAmount": number,
  "paymentMethod": "string",
  "paymentStatus": "string",
  "shippingAddress": {
    "fullName": "string",
    "phone": "string",
    "address": "string",
    "city": "string",
    "district": "string",
    "ward": "string"
  },
  "status": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Get All Orders
```http
GET /orders
Authorization: Bearer your-token
```

Response: Array of order objects

### Get Order by ID
```http
GET /orders/:id
Authorization: Bearer your-token
```

Response: Single order object

### Update Order Status (Admin only)
```http
PATCH /orders/:id/status
Authorization: Bearer your-token
Content-Type: application/json

{
  "status": "string"
}
```

## Keys

### Create Key (Admin only)
```http
POST /keys
Authorization: Bearer your-token
Content-Type: application/json

{
  "productId": "string",
  "activationCode": "string",
  "status": "string",
  "expiresAt": "datetime"
}
```

Response:
```json
{
  "id": "string",
  "productId": "string",
  "activationCode": "string",
  "status": "string",
  "expiresAt": "datetime",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Get All Keys
```http
GET /keys
Authorization: Bearer your-token
```

Response: Array of key objects

### Get Key by ID
```http
GET /keys/:id
Authorization: Bearer your-token
```

Response: Single key object

### Get Key by Activation Code
```http
GET /keys/by-activation-code/:activationCode
Authorization: Bearer your-token
```

Response: Single key object

### Update Key Status (Admin only)
```http
PATCH /keys/:id
Authorization: Bearer your-token
Content-Type: application/json

{
  "status": "string",
  "expiresAt": "datetime"
}
```

## Users

### Get User Profile
```http
GET /users/profile
Authorization: Bearer your-token
```

Response:
```json
{
  "id": "string",
  "email": "string",
  "fullName": "string",
  "phone": "string",
  "role": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## Admin

### Create Admin (Super Admin only)
```http
POST /auth/create-admin
Authorization: Bearer your-token
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123",
  "fullName": "Admin User",
  "phone": "0123456789"
}
```

### Admin Login
```http
POST /admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

## Notes
- All timestamps are in ISO 8601 format
- All IDs are UUIDs
- All prices are in VND
- All protected routes require a valid JWT token in the Authorization header
- Admin routes require admin role
- Super Admin routes require super admin role

## Headers

### Authentication
Để gọi các API được bảo vệ, thêm header:
```
Authorization: Bearer <jwt_token>
```

### Content Type
```
Content-Type: application/json
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
``` 