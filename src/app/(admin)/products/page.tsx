'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { productApi, Product, AdminProductSearchParams, PaginationMeta, categoryApi, Category } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Package, Search, Plus, Edit, RotateCcw, Check, X } from 'lucide-react';
import Link from 'next/link';
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

// Helper function for debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({ 
    total: 0, page: 1, limit: 9, totalPages: 0
  });
  
  const [filters, setFilters] = useState<AdminProductSearchParams>({
    search: '',
    status: '',
    categoryId: '',
    minQuantity: '',
    maxQuantity: '',
    minPrice: '',
    maxPrice: '',
    page: 1,
    limit: 9,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  // States for input values to apply debounce
  const [searchInput, setSearchInput] = useState('');
  const [minPriceInput, setMinPriceInput] = useState<string | number>('');
  const [maxPriceInput, setMaxPriceInput] = useState<string | number>('');
  const [minQuantityInput, setMinQuantityInput] = useState<string | number>('');
  const [maxQuantityInput, setMaxQuantityInput] = useState<string | number>('');

  // Debounce the input values
  const debouncedSearch = useDebounce(searchInput, 500);
  const debouncedMinPrice = useDebounce(minPriceInput, 500);
  const debouncedMaxPrice = useDebounce(maxPriceInput, 500);
  const debouncedMinQuantity = useDebounce(minQuantityInput, 500);
  const debouncedMaxQuantity = useDebounce(maxQuantityInput, 500);

  const isMounted = useRef(false); // Ref to track initial mount

  const loadProducts = useCallback(async (params: AdminProductSearchParams) => {
    try {
      setLoading(true);
      console.log("Loading products with params:", params);
      const response = await productApi.searchAdmin(params);
      console.log('API Response:', response);
      if (response && response.data) {
        setProducts(response.data || []);
        setPaginationMeta(response.meta || { total: 0, page: params.page || 1, limit: params.limit || 9, totalPages: 0 });
      } else {
         setProducts([]);
         setPaginationMeta({ total: 0, page: params.page || 1, limit: params.limit || 9, totalPages: 0 });
         // Optionally show a toast message if response format is unexpected
         // toast.error("Lỗi định dạng dữ liệu sản phẩm từ server.");
      }
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast.error(`Lỗi tải sản phẩm: ${error?.response?.data?.message || error.message || 'Lỗi không xác định'}`);
      setProducts([]);
      setPaginationMeta({ total: 0, page: params.page || 1, limit: params.limit || 9, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
        const fetchedCategories = await categoryApi.getAllAdmin();
        setCategories(fetchedCategories || []);
    } catch (error: any) {
        console.error('Error loading categories:', error);
        toast.error(`Lỗi tải danh mục: ${error?.response?.data?.message || error.message || 'Lỗi không xác định'}`);
        setCategories([]);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Effect to update filters based on debounced input values
  useEffect(() => {
    const parseNumericFilter = (value: string | number): number | undefined => {
        if (value === '' || value === null || value === undefined) return undefined;
        const num = Number(value);
        return isNaN(num) ? undefined : num;
    };

    const newSearch = debouncedSearch;
    const newMinPrice = parseNumericFilter(debouncedMinPrice) ?? undefined;
    const newMaxPrice = parseNumericFilter(debouncedMaxPrice) ?? undefined;
    const newMinQuantity = parseNumericFilter(debouncedMinQuantity) ?? undefined;
    const newMaxQuantity = parseNumericFilter(debouncedMaxQuantity) ?? undefined;

    setFilters(prev => {
      // Check if any debounced value actually changed the corresponding filter value
      const searchChanged = newSearch !== prev.search;
      const minPriceChanged = newMinPrice !== prev.minPrice;
      const maxPriceChanged = newMaxPrice !== prev.maxPrice;
      const minQuantityChanged = newMinQuantity !== prev.minQuantity;
      const maxQuantityChanged = newMaxQuantity !== prev.maxQuantity;

      const filterChanged = searchChanged || minPriceChanged || maxPriceChanged || minQuantityChanged || maxQuantityChanged;

      // If nothing effectively changed, return the previous state to avoid re-render trigger
      if (!filterChanged) {
        return prev;
      }

      // If something changed, update state and reset page
      return {
        ...prev,
        search: newSearch,
        minPrice: newMinPrice,
        maxPrice: newMaxPrice,
        minQuantity: newMinQuantity,
        maxQuantity: newMaxQuantity,
        page: 1 // Reset page because a filter changed
      };
    });
  // Keep dependencies for debounced values
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, debouncedMinPrice, debouncedMaxPrice, debouncedMinQuantity, debouncedMaxQuantity]);


  // Effect to load products when filters change
  useEffect(() => {
    if (isMounted.current) {
      // Subsequent runs: Load products only when filters have actually changed
      console.log("Filters changed, reloading products:", filters);
      loadProducts(filters);
    } else {
      // First run after mount: Mark as mounted and load initial data
      isMounted.current = true;
      console.log("Initial mount load triggered:", filters);
      loadProducts(filters);
    }
  }, [filters, loadProducts]); // Depend only on filters and the stable loadProducts

  // Function to handle changes in Select components (no debounce needed)
  const handleSelectFilterChange = (key: keyof AdminProductSearchParams, value: any) => {
    const shouldResetPage = key !== 'page';
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(shouldResetPage && { page: 1 })
    }));
  };
  
  const handleResetFilters = () => {
    // Reset input states
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setMinQuantityInput('');
    setMaxQuantityInput('');
    // Reset filters state (this will trigger the useEffect to load products)
    setFilters({
      search: '',
      status: '',
      categoryId: '',
      minQuantity: '',
      maxQuantity: '',
      minPrice: '',
      maxPrice: '',
      page: 1,
      limit: 9,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginationMeta.totalPages) {
      // Directly update the page in filters state
       setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const formatPrice = (price: number | null | undefined) => {
     if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
      switch (status) {
          case 'ACTIVE':
              return <Badge variant="default">Hoạt động</Badge>;
          case 'INACTIVE':
              return <Badge variant="destructive">Ngừng KD</Badge>;
          default:
              return <Badge variant="secondary">{status || 'Không rõ'}</Badge>;
      }
  }

  const sortOptions: { value: AdminProductSearchParams['sortBy'], label: string }[] = [
    { value: 'createdAt', label: 'Ngày tạo' },
    { value: 'updatedAt', label: 'Ngày cập nhật' },
    { value: 'name', label: 'Tên sản phẩm' },
    { value: 'originalPrice', label: 'Giá gốc' },
    { value: 'quantity', label: 'Số lượng' },
    { value: 'status', label: 'Trạng thái' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Danh Sách Sản Phẩm ({paginationMeta.total || 0})</h1>
        <Link href="/products/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm Sản Phẩm
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Bộ lọc và Sắp xếp</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Input
              placeholder="Tìm kiếm tên, mã game..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="md:col-span-1"
            />
            <Select 
              value={filters.status}
              onValueChange={(value) => handleSelectFilterChange('status', value === 'ALL' ? '' : value as 'ACTIVE' | 'INACTIVE')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filters.categoryId || 'ALL'} 
              onValueChange={(value) => handleSelectFilterChange('categoryId', value === 'ALL' ? '' : value)}
              disabled={categories.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả danh mục</SelectItem>
                 {Array.isArray(categories) && categories.length > 0 && categories.map(cat => (
                   <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                 ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
             <div className="flex flex-col gap-1">
                <Label className="text-sm">Khoảng giá</Label>
                <div className="flex gap-2">
                   <Input 
                     type="number" 
                     placeholder="Từ" 
                     value={minPriceInput}
                     onChange={(e) => setMinPriceInput(e.target.value)}
                     className="h-9"
                   />
                   <Input 
                     type="number" 
                     placeholder="Đến" 
                     value={maxPriceInput}
                     onChange={(e) => setMaxPriceInput(e.target.value)}
                     className="h-9"
                   />
                 </div>
             </div>
              <div className="flex flex-col gap-1">
                <Label className="text-sm">Khoảng số lượng</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    placeholder="Từ" 
                    value={minQuantityInput}
                    onChange={(e) => setMinQuantityInput(e.target.value)}
                    className="h-9"
                  />
                  <Input 
                    type="number" 
                    placeholder="Đến" 
                    value={maxQuantityInput}
                    onChange={(e) => setMaxQuantityInput(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                 <Label htmlFor="sortBy" className="text-sm">Sắp xếp theo</Label>
                 <Select 
                   value={filters.sortBy} 
                   onValueChange={(value) => handleSelectFilterChange('sortBy', value as AdminProductSearchParams['sortBy'])}
                 >
                   <SelectTrigger id="sortBy" className="h-9">
                     <SelectValue placeholder="Chọn trường sắp xếp" />
                   </SelectTrigger>
                   <SelectContent>
                     {sortOptions.map(option => (
                       <SelectItem key={option.value} value={option.value!}>{option.label}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>
              <div className="flex gap-2 items-end">
                  <Select 
                    value={filters.sortOrder} 
                    onValueChange={(value) => handleSelectFilterChange('sortOrder', value as 'ASC' | 'DESC')}
                  >
                    <SelectTrigger className="h-9 w-[120px]">
                      <SelectValue placeholder="Thứ tự" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ASC">Tăng dần</SelectItem>
                      <SelectItem value="DESC">Giảm dần</SelectItem>
                    </SelectContent>
                  </Select>
                   <Button variant="outline" onClick={handleResetFilters} className="h-9 flex-1">
                      <RotateCcw className="mr-2 h-4 w-4" /> Reset
                  </Button>
              </div>
          </div>
        </CardContent>
      </Card>

      {/* Product List */}
      {loading ? (
        <div className="text-center py-8">Đang tải sản phẩm...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-8">Không tìm thấy sản phẩm nào phù hợp.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow duration-200 flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-semibold line-clamp-2 flex-1 mr-2">{product.name}</CardTitle>
                   <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Link href={`/products/edit/${product.id}`} legacyBehavior>
                         <a className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                            <Edit className="h-4 w-4" />
                         </a>
                      </Link>
                      {getStatusBadge(product.status || '')}
                   </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2 flex-grow flex flex-col justify-between">
                  <div className="mb-3">
                     <p className="text-xs text-gray-500 mb-1">Mã game: {product.gameCode || 'N/A'}</p>
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{formatPrice(product.originalPrice)}</span>
                        <span className={`text-xs font-medium ${product.quantity <= (product.lowStockWarning || 0) ? 'text-red-600' : 'text-green-600'}`}>
                           Còn: {product.quantity}
                        </span>
                     </div>
                     {product.promotionEnabled && product.promotionPrice && (
                         <p className="text-xs text-red-600">KM: {formatPrice(product.promotionPrice)}</p>
                     )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-auto border-t pt-2">
                    {product.tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs font-normal">{tag}</Badge>
                    ))}
                    {product.tags?.length > 3 && <Badge variant="secondary" className="text-xs font-normal">...</Badge>}
                  </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {paginationMeta.totalPages > 1 && (
         <Pagination>
           <PaginationContent>
             <PaginationItem>
               <PaginationPrevious 
                 href="#"
                 onClick={(e) => { e.preventDefault(); handlePageChange(paginationMeta.page - 1); }}
                 aria-disabled={paginationMeta.page <= 1}
                 className={paginationMeta.page <= 1 ? "pointer-events-none opacity-50" : undefined}
               />
             </PaginationItem>
             
             {/* Logic to display pagination numbers (simplified) */}
             {Array.from({ length: paginationMeta.totalPages }, (_, i) => i + 1)
              // Limit displayed pages for brevity if many pages exist
              .filter(page => 
                  page === 1 || 
                  page === paginationMeta.totalPages || 
                  (page >= paginationMeta.page - 1 && page <= paginationMeta.page + 1)
              )
              .map((page, index, arr) => {
                const showEllipsis = index > 0 && page !== arr[index-1] + 1;
                return (
                 <React.Fragment key={`page-${page}`}>
                    {showEllipsis && (
                       <PaginationItem key={`ellipsis-before-${page}`}>
                         <PaginationEllipsis />
                       </PaginationItem>
                    )}
                    <PaginationItem>
                       <PaginationLink 
                         href="#" 
                         isActive={page === paginationMeta.page}
                         onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                       >
                         {page}
                       </PaginationLink>
                    </PaginationItem>
                 </React.Fragment>
                )
              })
             }

             <PaginationItem>
               <PaginationNext 
                 href="#"
                 onClick={(e) => { e.preventDefault(); handlePageChange(paginationMeta.page + 1); }}
                 aria-disabled={paginationMeta.page >= paginationMeta.totalPages}
                 className={paginationMeta.page >= paginationMeta.totalPages ? "pointer-events-none opacity-50" : undefined}
               />
             </PaginationItem>
           </PaginationContent>
         </Pagination>
      )}
    </div>
  );
} 