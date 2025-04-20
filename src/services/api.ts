import axios from 'axios';

const API_URL = '/api'; // Sử dụng relative path để rewrite hoạt động

// Tạo instance axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Rất quan trọng: Cho phép gửi/nhận cookies cross-origin/same-origin
});

// Thêm interceptor để xử lý lỗi (bao gồm lỗi 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      // Nếu lỗi là 401 (Unauthorized), xóa thông tin admin và redirect về trang login
      // Việc xóa cookie HttpOnly phải được thực hiện bởi backend bằng cách gửi lại header Set-Cookie với thời gian hết hạn trong quá khứ.
      if (error.response.status === 401) {
        console.log('[Response Interceptor] Unauthorized (401). Removing local admin info and redirecting to login.');
        localStorage.removeItem('admin');
        // Chỉ thực hiện redirect nếu đang ở phía client và không phải đang ở trang login rồi
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login'; // Redirect về login
        }
      }
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export interface Product {
  id: string;
  name: string;
  slug: string;
  gameCode: string;
  analyticsCode: string;
  requirePhone: boolean;
  
  shortDescription: string;
  description: string;
  warrantyPolicy: string;
  faq: string;
  
  metaTitle: string;
  metaDescription: string;
  mainKeyword: string;
  secondaryKeywords: string[];
  tags: string[];
  
  popupEnabled: boolean;
  popupTitle: string;
  popupContent: string;
  
  guideUrl: string;
  imageUrl: string;
  originalPrice: number;
  importPrice: number;
  importSource: string;
  quantity: number;
  autoSyncQuantityWithKey: boolean;
  minPerOrder: number;
  maxPerOrder: number | null;
  autoDeliverKey: boolean;
  showMoreDescription: boolean;
  promotionEnabled: boolean;
  lowStockWarning: number;
  gameKeyText: string;
  guideText: string;
  expiryDays: number;
  allowComment: boolean;
  
  promotionPrice: number | null;
  promotionStartDate: string | null;
  promotionEndDate: string | null;
  promotionQuantity: number | null;
  
  categoryId: string | null;
  additionalRequirementIds: string[];
  
  customHeadCode: string;
  customBodyCode: string;
  
  status: 'ACTIVE' | 'INACTIVE';
  
  createdAt: string;
  updatedAt: string;
  category?: { name: string };
}

// Thêm interface cho Pagination Meta
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Thêm interface cho Response của API search
export interface AdminProductSearchResponse {
  data: Product[];
  meta: PaginationMeta;
}

// Thêm interface cho Category
export interface Category {
  id: string;
  name: string;
}

// Thêm interface cho các tham số tìm kiếm
export interface AdminProductSearchParams {
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE' | ''; // Thêm chuỗi rỗng để reset filter
  categoryId?: string;
  minQuantity?: number | ''; // Dùng chuỗi rỗng để dễ xử lý input trống
  maxQuantity?: number | '';
  minPrice?: number | '';
  maxPrice?: number | '';
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'originalPrice' | 'quantity' | 'status';
  sortOrder?: 'ASC' | 'DESC';
}

export const productApi = {
  searchPublic: async (params?: { name?: string }) => {
    try {
      const response = await apiClient.get<Product[]>('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching public products:', error);
      throw error;
    }
  },

  searchAdmin: async (params?: AdminProductSearchParams) => {
    try {
      const filteredParams = Object.entries(params || {})
        .filter(([_, value]) => value !== undefined && value !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        
      console.log("Calling /admin/products/search with params:", filteredParams);
      const response = await apiClient.get<AdminProductSearchResponse>('/admin/products/search', { 
        params: filteredParams 
      });
      return response.data;
    } catch (error) {
      console.error('Error searching admin products:', error);
      return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    }
  },

  getById: async (id: string) => {
    try {
      const response = await apiClient.get<Product>(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  create: async (data: Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'category'>) => {
    try {
      const response = await apiClient.post<Product>('/admin/products', data);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  update: async (id: string, data: Partial<Omit<Product, 'category'>>) => {
    try {
      console.log('Updating product:', id, data);
      const response = await apiClient.patch<Product>(`/admin/products/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await apiClient.delete<Product>(`/admin/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },
};

// (Optional) Có thể tạo một object API riêng cho categories
export const categoryApi = {
  getAllAdmin: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get<Category[]>('/admin/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Trả về mảng rỗng nếu lỗi
      return []; 
    }
  },
};

export default apiClient; 