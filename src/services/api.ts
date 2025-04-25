import axios from 'axios';
import { z } from 'zod';

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

// Define a generic API response structure
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string | null;
  data: T;
}

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
  Product_A?: { id: string; name: string }[];
  
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

  getById: async (id: string): Promise<ApiResponse<Product>> => {
    try {
      const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Product>> => {
    try {
      console.log(`[API] Fetching product by slug: ${slug}`);
      const response = await apiClient.get<ApiResponse<Product>>(`/products/by-slug/${slug}`);
      console.log(`[API] Product data received for slug ${slug}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product by slug ${slug}:`, error);
      // Re-throw the error or return a specific error structure
      throw error;
      // Example of returning error structure:
      // return { success: false, statusCode: error.response?.status || 500, message: error.message, data: null };
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

  searchByName: async (name: string): Promise<Pick<Product, 'id' | 'name'>[]> => {
    try {
      // Define the expected response structure
      interface SearchResponse {
        data: Pick<Product, 'id' | 'name'>[];
        meta: any; // Or define meta structure if needed
      }
      
      console.log(`[API] Searching products by name: ${name}`);
      const response = await apiClient.get<SearchResponse>('/products', {
        params: { name: name, limit: 10 } // Search by name, limit results
      });
      console.log(`[API] Search response received:`, response.data);
      // Return the nested data array
      return response.data.data || []; 
    } catch (error) {
      console.error('Error searching products by name:', error);
      // Return empty array in case of error to prevent breaking the component
      return []; 
    }
  },

  // Re-added function to fetch multiple products by their IDs
  getProductsByIds: async (ids: string[]): Promise<Pick<Product, 'id' | 'name'>[]> => {
    if (ids.length === 0) return [];
    try {
      // Assume a backend endpoint like /products/batch?ids=id1,id2...
      // Adjust endpoint and parameter name ('ids') if needed
      const response = await apiClient.get<Pick<Product, 'id' | 'name'>[]>('/products/batch', {
        params: { ids: ids.join(',') } 
      });
      // Assuming the API returns an array of products directly
      return response.data;
    } catch (error) {
      console.error('Error fetching products by IDs:', error);
      return []; // Return empty array on error
    }
  },
};

// (Optional) Có thể tạo một object API riêng cho categories
export const categoryApi = {
  getAllAdmin: async (): Promise<ApiResponse<Category[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<Category[]>>('/admin/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Trả về một cấu trúc lỗi phù hợp nếu API không thành công
      // Hoặc throw error để component cha xử lý
      throw error; // Re-throw error instead of returning empty array directly
      // return { success: false, statusCode: 500, message: 'Error fetching categories', data: [] }; // Alternative: return error structure
    }
  },
};

// --- Key Management Enums and Types ---
export enum KeyStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  EXPORTED = 'EXPORTED',
}

export interface ActivationKey {
  id: string;
  activationCode: string;
  productId: string;
  product?: Pick<Product, 'id' | 'name'>; // Include product name for display
  status: KeyStatus;
  userEmail?: string | null;
  note?: string | null;
  cost?: number | null;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  usedAt?: string | null; // Added usedAt field
  importSourceId?: string; // Add importSourceId for filtering
  importSource?: ImportSource | null; // Add importSource object
}

export interface SearchParams {
  page?: number;
  limit?: number;
  activationCode?: string;
  productId?: string;
  status?: KeyStatus;
  userEmail?: string;
  note?: string;
  minCost?: number;
  maxCost?: number;
  createdAtFrom?: string;
  createdAtTo?: string;
  usedAtFrom?: string;
  usedAtTo?: string;
  importSourceId?: string; // Add importSourceId for filtering
  sortBy?: string; // e.g., 'createdAt'
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedKeysResponse {
  data: ActivationKey[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Zod Schemas for Validation
export const AddKeySchema = z.object({
  activationCode: z.string().min(1, { message: "Mã key không được để trống" }),
  productId: z.string().min(1, { message: "Vui lòng chọn sản phẩm" }),
  status: z.nativeEnum(KeyStatus).default(KeyStatus.AVAILABLE),
  cost: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0, "Giá nhập phải lớn hơn hoặc bằng 0").nullable().optional() // Allow null and optional
  ),
  note: z.string().optional(),
  importSourceId: z.string().uuid("ID Nguồn nhập không hợp lệ").optional(), // Add optional importSourceId
});

export type AddKeyInput = z.infer<typeof AddKeySchema>;

// Edit schema - allow editing status, cost, note. Product and code usually fixed.
export const EditKeySchema = z.object({
  status: z.nativeEnum(KeyStatus),
  cost: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0, "Giá nhập phải lớn hơn hoặc bằng 0").nullable().optional()
  ),
  note: z.string().optional(),
  importSourceId: z.string().uuid("ID Nguồn nhập không hợp lệ").nullable().optional(), // Add optional nullable importSourceId
  // Keep productId and activationCode as read-only or handled separately if needed
  // productId: z.string().optional(),
  // activationCode: z.string().optional(),
});

export type EditKeyInput = z.infer<typeof EditKeySchema>;

// ---> Schema and Type for Bulk Key Creation
export const BulkCreateKeysSchema = z.object({
  productId: z.string().uuid("ID sản phẩm không hợp lệ"),
  activationCodes: z.array(z.string().min(1, "Mã key không được để trống")).min(1, "Cần ít nhất một mã key"),
  status: z.nativeEnum(KeyStatus).optional(), // Optional, backend might default
  cost: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0, "Giá nhập phải lớn hơn hoặc bằng 0").nullable().optional()
  ),
  note: z.string().optional(),
  importSourceId: z.string().uuid("ID Nguồn nhập không hợp lệ").optional(), // Add optional importSourceId
});

export type BulkCreateKeysInput = z.infer<typeof BulkCreateKeysSchema>;

// --- Key Management API Functions ---

export const keyApi = {
  search: async (params: SearchParams): Promise<PaginatedKeysResponse> => {
    try {
      const response = await apiClient.get<PaginatedKeysResponse>('/admin/keys/search', { params });
      // Assuming API response directly matches PaginatedKeysResponse
      return response.data;
    } catch (error) {
      console.error("Error searching keys:", error);
      throw error;
    }
  },

  create: async (data: AddKeyInput): Promise<ActivationKey> => {
    try {
      const response = await apiClient.post<ActivationKey>('/admin/keys', data);
      return response.data;
    } catch (error) {
      console.error("Error creating key:", error);
      throw error;
    }
  },

  update: async (id: string, data: EditKeyInput): Promise<ActivationKey> => {
    try {
      const response = await apiClient.patch<ActivationKey>(`/admin/keys/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating key ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/admin/keys/${id}`);
    } catch (error) {
      console.error(`Error deleting key ${id}:`, error);
      throw error;
    }
  },

  // ---> NEW: Function to delete multiple keys
  deleteBulk: async (ids: string[]): Promise<{ deletedCount: number }> => {
    if (ids.length === 0) return { deletedCount: 0 };
    try {
      // Reverted endpoint back to /admin/keys/bulk, keeping POST method
      const response = await apiClient.post<{ deletedCount: number }>('/admin/keys/bulk', { ids }); 
      return response.data;
    } catch (error) {
      console.error(`Error deleting multiple keys:`, error);
      throw error;
    }
  },

  // ---> NEW: Function to create multiple keys
  createBulk: async (data: BulkCreateKeysInput): Promise<{ count: number }> => { // Assuming API returns count
    try {
      // Validate input data using Zod schema before sending
      const validatedData = BulkCreateKeysSchema.parse(data);
      const response = await apiClient.post<{ count: number }>('/admin/keys/bulk-create', validatedData);
      return response.data; // Assuming response format { count: number }
    } catch (error) {
      console.error("Error bulk creating keys:", error);
      // Re-throw Zod errors or other errors for handling in the component
      throw error; 
    }
  },
};

// --- Import Source Types and API ---
// Assuming ImportSource has at least id and name
export interface ImportSource {
  id: string;
  name: string;
  contactLink?: string | null; // Example optional field
  // Add other fields if available/needed
}

export interface ImportSourceSearchParams {
  name?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedImportSourcesResponse {
  data: ImportSource[];
  meta: PaginationMeta; // Reuse PaginationMeta from products
}

export const importSourceApi = {
  search: async (params: ImportSourceSearchParams): Promise<PaginatedImportSourcesResponse> => {
    try {
      // Filter out undefined/empty params (like product search)
      const filteredParams = Object.entries(params || {})
        .filter(([_, value]) => value !== undefined && value !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      console.log("[API] Searching import sources with params:", filteredParams);
      const response = await apiClient.get<PaginatedImportSourcesResponse>('/admin/import-sources/search', {
        params: filteredParams,
      });
      console.log("[API] Import source search response received:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error searching import sources:", error);
      // Return empty paginated structure on error
      return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    }
  },
  // Add missing CRUD operations
  create: async (data: Omit<ImportSource, 'id'>): Promise<ImportSource> => {
     try {
       const response = await apiClient.post<ImportSource>('/admin/import-sources', data);
       return response.data;
     } catch (error) {
       console.error("Error creating import source:", error);
       throw error;
     }
   },
   update: async (id: string, data: Partial<Omit<ImportSource, 'id'>>): Promise<ImportSource> => {
     try {
       const response = await apiClient.patch<ImportSource>(`/admin/import-sources/${id}`, data);
       return response.data;
     } catch (error) {
       console.error(`Error updating import source ${id}:`, error);
       throw error;
     }
   },
   delete: async (id: string): Promise<void> => {
     try {
       await apiClient.delete(`/admin/import-sources/${id}`);
     } catch (error) {
       console.error(`Error deleting import source ${id}:`, error);
       throw error;
     }
   },
};

export default apiClient; 