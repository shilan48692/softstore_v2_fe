# Hướng dẫn sử dụng API Quản lý Key cho Frontend Admin

Chào đội Frontend Admin,

Module quản lý Key (`/keys`) cung cấp các API để bạn thực hiện các thao tác quản lý kho key kích hoạt sản phẩm. Tất cả các endpoint dưới đây đều yêu cầu **xác thực Admin** (nghĩa là trình duyệt cần tự động gửi kèm cookie `accessToken` hợp lệ).

**1. Xem Danh sách Keys & Tìm kiếm/Lọc**

*   **Endpoint:** `GET /admin/keys/search`
*   **Mục đích:** Lấy danh sách các keys, hỗ trợ lọc theo nhiều tiêu chí và phân trang.
*   **Query Parameters (Optional - dựa trên `FindKeysDto`):**
    *   `activationCode` (string): Lọc theo mã kích hoạt chính xác.
    *   `productId` (string - UUID): Lọc theo ID sản phẩm.
    *   `orderId` (string - UUID): Lọc theo ID đơn hàng.
    *   `userId` (string - UUID): Lọc theo ID người dùng.
    *   `userEmail` (string): Lọc theo email người dùng.
    *   `status` (enum `KeyStatus`): Lọc theo trạng thái key (e.g., `AVAILABLE`, `SOLD`, `USED`).
    *   `note` (string): Tìm kiếm trong ghi chú.
    *   `minCost` (number): Giá nhập tối thiểu.
    *   `maxCost` (number): Giá nhập tối đa.
    *   `page` (number, default: 1): Số trang.
    *   `limit` (number, default: 10): Số lượng key mỗi trang.
    *   `sortBy` (string, default: 'createdAt'): Trường để sắp xếp.
    *   `sortOrder` ('ASC' | 'DESC', default: 'DESC'): Thứ tự sắp xếp.
*   **Ví dụ Request:**
    ```javascript
    // Lấy các key AVAILABLE của sản phẩm 'product-id-123', trang 2, 20 key/trang
    const productId = 'product-id-123';
    const page = 2;
    const limit = 20;
    const status = 'AVAILABLE';

    fetch(`/admin/keys/search?productId=${productId}&status=${status}&page=${page}&limit=${limit}`, {
        method: 'GET',
        credentials: 'include', // Đảm bảo cookie được gửi
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized');
            throw new Error(`API Error: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Keys found:', data.items); // data có thể có cấu trúc { items: [], meta: { total, page, limit, ... } }
        console.log('Pagination meta:', data.meta);
        // Cập nhật UI với danh sách keys và thông tin phân trang
    })
    .catch(error => {
        console.error('Failed to fetch keys:', error);
        // Xử lý lỗi (vd: hiển thị thông báo, redirect nếu 401)
    });
    ```

**2. Thêm Key Mới**

*   **Endpoint:** `POST /admin/keys`
*   **Mục đích:** Thêm một hoặc nhiều key mới vào hệ thống. API hiện tại có vẻ chỉ hỗ trợ thêm từng key một qua `CreateKeyDto`. Nếu cần thêm hàng loạt, có thể cần endpoint khác hoặc lặp lại request này.
*   **Request Body (`CreateKeyDto`):**
    *   `activationCode` (string, **required**): Mã key.
    *   `productId` (string - UUID, **required**): ID của sản phẩm.
    *   `status` (enum `KeyStatus`, optional): Trạng thái ban đầu (thường là `AVAILABLE`).
    *   `note` (string, optional): Ghi chú.
    *   `cost` (number, optional): Giá nhập.
*   **Ví dụ Request:**
    ```javascript
    const newKeyData = {
      activationCode: 'NEW-KEY-CODE-1234',
      productId: 'product-id-to-link',
      status: 'AVAILABLE', // Hoặc bỏ qua nếu backend có default
      cost: 5.50,
      note: 'Nhập lô tháng 7'
    };

    fetch('/admin/keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newKeyData),
      credentials: 'include',
    })
    .then(response => {
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized');
        // Check for validation errors (400 Bad Request)
        if (response.status === 400) {
           response.json().then(err => console.error('Validation errors:', err.message));
           throw new Error('Bad Request - Validation Failed');
        }
        throw new Error(`API Error: ${response.statusText}`);
      }
      return response.json();
    })
    .then(createdKey => {
      console.log('Key created successfully:', createdKey);
      // Cập nhật UI (vd: thêm vào danh sách, hiển thị thông báo thành công)
    })
    .catch(error => {
      console.error('Failed to create key:', error);
      // Xử lý lỗi
    });
    ```
    *(Lưu ý: Để thêm hàng loạt, bạn cần lặp lại request này cho mỗi key, hoặc yêu cầu backend tạo endpoint hỗ trợ bulk creation).*

**3. Xem Chi Tiết Key**

*   **Endpoint:** `GET /admin/keys/:id`
*   **Mục đích:** Lấy thông tin chi tiết của một key cụ thể.
*   **URL Parameter:** `id` (string - UUID): ID của key cần xem.
*   **Ví dụ Request:**
    ```javascript
    const keyIdToView = 'key-uuid-abcdef';

    fetch(`/admin/keys/${keyIdToView}`, {
      method: 'GET',
      credentials: 'include',
    })
    .then(response => {
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized');
        if (response.status === 404) throw new Error('Key not found');
        throw new Error(`API Error: ${response.statusText}`);
      }
      return response.json();
    })
    .then(keyDetails => {
      console.log('Key details:', keyDetails);
      // Hiển thị chi tiết key trên UI
    })
    .catch(error => {
      console.error('Failed to fetch key details:', error);
      // Xử lý lỗi
    });
    ```

**4. Cập Nhật Key**

*   **Endpoint:** `PATCH /admin/keys/:id`
*   **Mục đích:** Cập nhật thông tin của một key (ví dụ: đổi trạng thái, thêm ghi chú, gán cho đơn hàng/user - mặc dù việc gán thường xảy ra tự động khi bán hàng).
*   **URL Parameter:** `id` (string - UUID): ID của key cần cập nhật.
*   **Request Body (`UpdateKeyDto` - chứa các trường optional tương tự `CreateKeyDto`):** Chỉ cần gửi những trường bạn muốn thay đổi.
    *   `activationCode` (string, optional): *Thường không nên cho phép sửa mã key.*
    *   `productId` (string - UUID, optional): *Thường không nên thay đổi sản phẩm của key.*
    *   `status` (enum `KeyStatus`, optional): Cập nhật trạng thái.
    *   `orderId` (string - UUID, optional): Gán/cập nhật đơn hàng.
    *   `userId` (string - UUID, optional): Gán/cập nhật người dùng.
    *   `userEmail` (string, optional): Cập nhật email người dùng.
    *   `note` (string, optional): Cập nhật ghi chú.
    *   `cost` (number, optional): Cập nhật giá nhập.
*   **Ví dụ Request (Cập nhật trạng thái và ghi chú):**
    ```javascript
    const keyIdToUpdate = 'key-uuid-abcdef';
    const updateData = {
      status: 'SOLD',
      note: 'Đã bán trong đơn hàng #5678'
      // orderId: 'order-id-5678' // Có thể được cập nhật ở đây hoặc trong luồng xử lý đơn hàng
    };

    fetch(`/admin/keys/${keyIdToUpdate}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
      credentials: 'include',
    })
    .then(response => {
      if (!response.ok) {
         if (response.status === 401) throw new Error('Unauthorized');
         if (response.status === 404) throw new Error('Key not found');
         if (response.status === 400) {
           response.json().then(err => console.error('Validation errors:', err.message));
           throw new Error('Bad Request - Validation Failed');
         }
         throw new Error(`API Error: ${response.statusText}`);
      }
      return response.json();
    })
    .then(updatedKey => {
      console.log('Key updated successfully:', updatedKey);
      // Cập nhật UI (vd: cập nhật dòng trong bảng, hiển thị thông báo)
    })
    .catch(error => {
      console.error('Failed to update key:', error);
      // Xử lý lỗi
    });
    ```

**5. Xóa Key**

*   **Endpoint:** `DELETE /admin/keys/:id`
*   **Mục đích:** Xóa một key khỏi hệ thống (nên cẩn thận với thao tác này, đặc biệt là với key đã bán). Có thể cần xác nhận từ người dùng.
*   **URL Parameter:** `id` (string - UUID): ID của key cần xóa.
*   **Ví dụ Request:**
    ```javascript
    const keyIdToDelete = 'key-uuid-tobedeleted';

    // Nên có bước xác nhận từ người dùng trước khi gọi API này
    if (confirm(`Bạn có chắc chắn muốn xóa key có ID: ${keyIdToDelete}? Thao tác này không thể hoàn tác.`)) {
      fetch(`/admin/keys/${keyIdToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      .then(response => {
        if (!response.ok) { // DELETE thường trả về 200 OK hoặc 204 No Content khi thành công
          if (response.status === 401) throw new Error('Unauthorized');
          if (response.status === 404) throw new Error('Key not found');
          throw new Error(`API Error: ${response.statusText}`);
        }
        // Xóa thành công (có thể không có body trả về hoặc trả về object đã xóa)
        console.log(`Key ${keyIdToDelete} deleted successfully.`);
        // Cập nhật UI (vd: xóa dòng khỏi bảng, hiển thị thông báo)
      })
      .catch(error => {
        console.error(`Failed to delete key ${keyIdToDelete}:`, error);
        // Xử lý lỗi
      });
    }
    ```

**Lưu ý chung:**

*   **Error Handling:** Luôn kiểm tra `response.ok` và xử lý các mã lỗi phổ biến như `401` (Unauthorized), `403` (Forbidden), `404` (Not Found), `400` (Bad Request - Validation Errors).
*   **`credentials: 'include'`:** Rất quan trọng khi gọi API từ một origin khác với backend để đảm bảo cookie xác thực được gửi kèm. 