import axios from 'axios';

const API_URL = '/api'; // Sử dụng relative path để rewrite hoạt động

// Tạo instance axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Cho phép gửi cookies trong request
});

// Thêm interceptor để tự động thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    console.log('[Request Interceptor] Running for URL:', config.url);
    const token = localStorage.getItem('accessToken');
    console.log('[Request Interceptor] Token from localStorage:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Request Interceptor] Authorization header added.');
    } else {
      console.log('[Request Interceptor] No token found in localStorage.');
    }
    return config;
  },
  (error) => {
    console.error('[Request Interceptor] Error:', error);
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý lỗi (bao gồm lỗi 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      // Nếu lỗi là 401 (Unauthorized), xóa token và redirect về trang login
      if (error.response.status === 401) {
        console.log('[Response Interceptor] Unauthorized (401). Removing token and redirecting to login.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('admin');
        // Chỉ thực hiện redirect nếu đang ở phía client
        if (typeof window !== 'undefined') {
          window.location.href = '/login'; // Hoặc sử dụng router nếu có
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
  
  createdAt: string;
  updatedAt: string;
}

export const productApi = {
  getAll: async (params?: {
    name?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    tags?: string[];
  }) => {
    try {
      const response = await apiClient.get<Product[]>('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
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

  create: async (data: Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await apiClient.post<Product>('/admin/products', data);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  update: async (id: string, data: Partial<Product>) => {
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

export default apiClient; 