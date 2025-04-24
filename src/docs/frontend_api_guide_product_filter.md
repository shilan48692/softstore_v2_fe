# Hướng dẫn cho Frontend: Sử dụng API Lọc Sản Phẩm Admin Nâng Cao & Quản lý Danh mục

**Chào team Frontend,**

Backend đã cập nhật endpoint tìm kiếm/lọc sản phẩm cho trang quản trị (`GET /admin/products/search`) để hỗ trợ các bộ lọc nâng cao và phân trang.

**Endpoint Lọc/Tìm kiếm Sản phẩm:**

```
GET /admin/products/search
```

**Query Parameters (Lọc/Tìm kiếm):**

Endpoint này giờ đây chấp nhận các query parameters sau (tất cả đều là optional):

*   `search` (string): Từ khóa tìm kiếm chung (sẽ tìm trong `name`, `slug`, `gameCode`).
*   `status` (string): Lọc theo trạng thái sản phẩm. Giá trị hợp lệ: `ACTIVE`, `INACTIVE`.
*   `categoryId` (string - UUID): Lọc theo ID của danh mục.
*   `minQuantity` (number): Lọc sản phẩm có số lượng tồn kho >= giá trị này.
*   `maxQuantity` (number): Lọc sản phẩm có số lượng tồn kho <= giá trị này.
*   `minPrice` (number): Lọc sản phẩm có giá gốc (`originalPrice`) >= giá trị này.
*   `maxPrice` (number): Lọc sản phẩm có giá gốc (`originalPrice`) <= giá trị này.
*   `page` (number): Trang muốn lấy (mặc định: `1`).
*   `limit` (number): Số lượng sản phẩm mỗi trang (mặc định: `10`).
*   `sortBy` (string): Trường muốn sắp xếp theo (mặc định: `createdAt`). Các giá trị hợp lệ bao gồm:
    *   `name`: Sắp xếp theo tên sản phẩm.
    *   `originalPrice`: Sắp xếp theo giá gốc.
    *   `quantity`: Sắp xếp theo số lượng tồn kho.
    *   `createdAt`: Sắp xếp theo ngày tạo.
    *   `updatedAt`: Sắp xếp theo ngày cập nhật.
    *   `status`: Sắp xếp theo trạng thái.
*   `sortOrder` (string): Thứ tự sắp xếp (mặc định: `DESC`). Giá trị hợp lệ: `ASC`, `DESC`.

**Ví dụ Request:**

Lấy trang 1, 10 sản phẩm/trang, thuộc danh mục có ID `abc-123`, trạng thái `ACTIVE`, giá từ 50000 đến 200000, sắp xếp theo giá tăng dần:

```
GET /admin/products/search?page=1&limit=10&categoryId=abc-123&status=ACTIVE&minPrice=50000&maxPrice=200000&sortBy=originalPrice&sortOrder=ASC
```

Lấy các sản phẩm có tên chứa "windows", số lượng < 5, sắp xếp theo số lượng giảm dần:

```
GET /admin/products/search?search=windows&maxQuantity=4&sortBy=quantity&sortOrder=DESC
```

**Response (Lọc/Tìm kiếm):**

Response vẫn giữ nguyên cấu trúc như trước, trả về danh sách sản phẩm và thông tin phân trang:

```json
{
  "data": [
    {
      "id": "...",
      "name": "...",
      "slug": "...",
      "status": "ACTIVE",
      "originalPrice": 100000,
      "quantity": 15,
      "category": { 
        "name": "Software"
      },
      // ... các trường khác
    },
    // ... more products
  ],
  "meta": {
    "total": 55,     
    "page": 1,       
    "limit": 10,     
    "totalPages": 6 
  }
}
```

**Endpoint Lấy Danh sách Danh mục:**

Để hỗ trợ việc chọn danh mục trong cả bộ lọc và form tạo/sửa sản phẩm, backend cung cấp endpoint sau:

```
GET /admin/categories
```
*   **Authentication:** Yêu cầu cookie `accessToken`.
*   **Response:** Trả về một mảng các object, mỗi object chứa `id` và `name` của danh mục, sắp xếp theo tên.
    ```json
    [
      { "id": "uuid-cua-danh-muc-a", "name": "Danh mục A" },
      { "id": "uuid-cua-danh-muc-b", "name": "Danh mục B" }
      // ...
    ]
    ```

**Lưu ý Quan trọng:**

*   **Form Tạo/Sửa Sản phẩm:**
    *   Sử dụng endpoint `GET /admin/categories` để lấy danh sách danh mục và hiển thị dưới dạng **dropdown** (thay vì ô nhập text) trong form tạo và sửa sản phẩm.
    *   Khi người dùng chọn một danh mục từ dropdown và gửi form (POST `/admin/products` hoặc PATCH `/admin/products/:id`), hãy đảm bảo gửi **ID (UUID)** của danh mục đã chọn trong trường `categoryId` của body request.
*   **Bộ lọc Sản phẩm:**
    *   Sử dụng endpoint `GET /admin/categories` để lấy danh sách danh mục cho dropdown lọc sản phẩm.
    *   Khi người dùng chọn danh mục để lọc, sử dụng **ID** của danh mục đó làm giá trị cho query parameter `categoryId` khi gọi `GET /admin/products/search`.
*   **Các Lưu ý Khác:**
    *   Cập nhật giao diện quản trị để thêm các ô nhập liệu/dropdown cho các bộ lọc và tùy chọn sắp xếp.
    *   Khi người dùng thay đổi bộ lọc hoặc sắp xếp, gọi lại API `GET /admin/products/search` với các query parameters tương ứng.
    *   Sử dụng thông tin `meta` trong response của `/admin/products/search` để hiển thị phân trang.

Vui lòng tích hợp các API và logic này vào trang quản lý sản phẩm nhé.

**Xin cảm ơn!** 