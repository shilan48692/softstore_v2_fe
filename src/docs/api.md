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
    "maxPerOrder": number | null,
    "autoDeliverKey": boolean,
    "showMoreDescription": boolean,
    "promotionEnabled": boolean,
    "lowStockWarning": number,
    "gameKeyText": "string",
    "guideText": "string",
    "expiryDays": number,
    "allowComment": boolean,
    
    "promotionPrice": number | null,
    "promotionStartDate": "datetime" | null,
    "promotionEndDate": "datetime" | null,
    "promotionQuantity": number | null,
    
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
  "maxPerOrder": number | null,
  "autoDeliverKey": boolean,
  "showMoreDescription": boolean,
  "promotionEnabled": boolean,
  "lowStockWarning": number,
  "gameKeyText": "string",
  "guideText": "string",
  "expiryDays": number,
  "allowComment": boolean,
  
  "promotionPrice": number | null,
  "promotionStartDate": "datetime" | null,
  "promotionEndDate": "datetime" | null,
  "promotionQuantity": number | null,
  
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
  "maxPerOrder": number | null,
  "autoDeliverKey": boolean,
  "showMoreDescription": boolean,
  "promotionEnabled": boolean,
  "lowStockWarning": number,
  "gameKeyText": "string",
  "guideText": "string",
  "expiryDays": number,
  "allowComment": boolean,
  
  "promotionPrice": number | null,
  "promotionStartDate": "datetime" | null,
  "promotionEndDate": "datetime" | null,
  "promotionQuantity": number | null,
  
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

## Import Sources (Admin only)

**Authentication Required:** All endpoints require a valid admin JWT token in the `Authorization: Bearer <token>` header.

### Get All Import Sources
```http
GET /admin/import-sources
```

Response:
```json
[
  {
    "id": "string (uuid)",
    "name": "string",
    "contactLink": "string | null",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
]
```

### Get Import Source by ID
```http
GET /admin/import-sources/:id
```

Response: Same as import source object above.

### Create Import Source
```http
POST /admin/import-sources
Content-Type: application/json

{
  "name": "string (required, unique)",
  "contactLink": "string (optional, must be a valid URL)"
}
```

Response: The newly created import source object.

### Update Import Source
```http
PATCH /admin/import-sources/:id
Content-Type: application/json

{
  "name": "string (optional, unique)",
  "contactLink": "string (optional, must be a valid URL)"
}
```

Response: The updated import source object.

### Delete Import Source
```http
DELETE /admin/import-sources/:id
```

**Note:** Deletion will fail if the import source is currently associated with any keys.

Response (on success):
```json
{
  "message": "Import source with ID <id> deleted successfully."
}
```

### Search Import Sources
```http
GET /admin/import-sources/search
```

**Query Parameters:**
- `name` (string): Tìm theo tên nguồn nhập (chứa, không phân biệt hoa thường).
- `page` (number, default: 1): Trang hiện tại.
- `limit` (number, default: 10): Số lượng kết quả mỗi trang.

**Example Usage:**
```
GET /admin/import-sources/search?name=NguonA&page=1&limit=20
```

**Response:**
```json
{
  "data": [
    {
      "id": "string (uuid)",
      "name": "string",
      "contactLink": "string | null",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
    // ... more sources
  ],
  "meta": {
    "total": number, // Total number of sources matching the criteria
    "page": number,
    "limit": number,
    "totalPages": number
  }
}
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

### Get All Keys (Admin only)
```http
GET /admin/keys
Authorization: Bearer your-token
```
Response: Array of key objects with product and importSource included.

### Get Key by ID (Admin only)
```http
GET /admin/keys/:id
Authorization: Bearer your-token
```
Response: Single key object with product and importSource included.

### Get Key by Activation Code (Admin only)
```http
GET /admin/keys/by-activation-code/:activationCode
Authorization: Bearer your-token
```
Response: Single key object with product and importSource included.

### Search Keys (Admin only)
```http
GET /admin/keys/search
Authorization: Bearer your-token
```

**Query Parameters:**
- `productName` (string): Tìm theo tên sản phẩm (chứa, không phân biệt hoa thường).
- `activationCode` (string): Tìm theo mã kích hoạt (chứa, không phân biệt hoa thường).
- `orderId` (string): Lọc theo ID đơn hàng chính xác.
- `status` (KeyStatus): Lọc theo trạng thái key (`AVAILABLE`, `SOLD`, `EXPORTED`).
- `note` (string): Tìm theo nội dung note (chứa, không phân biệt hoa thường).
- `importSourceId` (string): Lọc theo ID nguồn nhập.
- `minCost` (number): Giá gốc tối thiểu.
- `maxCost` (number): Giá gốc tối đa.
- `createdAtFrom` (string, YYYY-MM-DD): Lọc theo ngày tạo từ.
- `createdAtTo` (string, YYYY-MM-DD): Lọc theo ngày tạo đến.
- `usedAtFrom` (string, YYYY-MM-DD): Lọc theo ngày bán/sử dụng từ.
- `usedAtTo` (string, YYYY-MM-DD): Lọc theo ngày bán/sử dụng đến.
- `page` (number, default: 1): Trang hiện tại.
- `limit` (number, default: 10): Số lượng kết quả mỗi trang.

**Example Usage:**
```
GET /admin/keys/search?status=AVAILABLE&importSourceId=uuid-cua-nguon-nhap&page=1&limit=20
```

**Response:**
```json
{
  "data": [
    {
      "id": "string",
      "activationCode": "string",
      "note": "string | null",
      "cost": number,
      "status": "AVAILABLE | SOLD | EXPORTED",
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "usedAt": "datetime | null",
      "productId": "string",
      "orderId": "string | null",
      "userId": "string | null",
      "userEmail": "string | null",
      "importSourceId": "string | null",
      "product": { // Product details included
        "id": "string",
        "name": "string",
        // ... other product fields ...
      },
      "importSource": { // Import source details included
        "id": "string",
        "name": "string",
        "contactLink": "string | null"
        // ... other import source fields ...
      } | null
    }
    // ... more keys
  ],
  "meta": {
    "total": number, // Total number of keys matching the criteria
    "page": number,
    "limit": number,
    "totalPages": number
  }
}
```

### Update Key (Admin only)
```http
PATCH /admin/keys/:id
Authorization: Bearer your-token
Content-Type: application/json

{
  "productId": "string (optional)",
  "activationCode": "string (optional)",
  "status": "AVAILABLE | SOLD | EXPORTED (optional)",
  "note": "string (optional)",
  "cost": number (optional),
  "importSourceId": "string (optional)"
}
```

### Delete Key (Admin only)
```http
DELETE /admin/keys/:id
Authorization: Bearer your-token
```

### Delete Bulk Keys (Admin only)
```http
POST /admin/keys/delete-bulk
Authorization: Bearer your-token
Content-Type: application/json

{
  "ids": ["string", "string", ...]
}
```

Response:
```json
{
  "count": number // Number of keys deleted
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