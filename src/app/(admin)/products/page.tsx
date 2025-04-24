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
import Image from 'next/image';
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from '@/components/admin/ProductCard';

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
        if (response.data.length > 0) {
            console.log('First product data sample:', response.data[0]);
        }
        setProducts(response.data || []);
        setPaginationMeta(response.meta || { total: 0, page: params.page || 1, limit: params.limit || 9, totalPages: 0 });
      } else {
         setProducts([]);
         setPaginationMeta({ total: 0, page: params.page || 1, limit: params.limit || 9, totalPages: 0 });
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
        const apiResponse = await categoryApi.getAllAdmin(); // Get the full ApiResponse object
        // Check if the request was successful and data is an array
        if (apiResponse && apiResponse.success && Array.isArray(apiResponse.data)) {
             setCategories(apiResponse.data);
        } else {
             console.warn('Received unexpected category data format or API error:', apiResponse);
             setCategories([]); // Set to empty array if data is invalid or request failed
             if (apiResponse && !apiResponse.success) {
                toast.error(`Lỗi tải danh mục: ${apiResponse.message || 'Lỗi không rõ từ API'}`);
             }
        }
    } catch (error: any) {
        // Catch errors from the API call itself (network, 401 handled by interceptor, etc.)
        console.error('Error loading categories:', error);
        // Toast error might be redundant if interceptor handles 401, but good for other network errors
        if (error.response?.status !== 401) {
             toast.error(`Lỗi tải danh mục: ${error?.response?.data?.message || error.message || 'Lỗi không xác định'}`);
        }
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

  // Skeleton component for loading state
  const ProductCardSkeleton = () => (
    <Card className="flex items-start gap-4 p-4 rounded-xl shadow-sm">
      <Skeleton className="w-24 h-20 rounded-md" /> {/* Image Skeleton */}
      <div className="flex-grow space-y-2">
        <Skeleton className="h-5 w-3/4" /> {/* Name Skeleton */}
        <Skeleton className="h-4 w-1/4" /> {/* Code Skeleton */}
        <Skeleton className="h-4 w-1/2" /> {/* Price Skeleton */}
        <Skeleton className="h-4 w-1/3" /> {/* Stock Skeleton */}
      </div>
      <div className="flex flex-col items-end space-y-2">
        <Skeleton className="h-5 w-20" /> {/* Status Skeleton */}
        <Skeleton className="h-8 w-8 rounded-full" /> {/* Edit Button Skeleton */}
      </div>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center">
              <Package className="mr-2 h-6 w-6" />
              Danh sách Sản phẩm ({paginationMeta?.total || 0})
            </CardTitle>
            <div className="flex items-center space-x-2">
               <Button variant="outline" size="icon" onClick={handleResetFilters} title="Làm mới bộ lọc">
                 <RotateCcw className="h-4 w-4" />
                 <span className="sr-only">Làm mới</span>
               </Button>
              <Button asChild>
                <Link href="/products/create">
                  <Plus className="mr-2 h-4 w-4" /> Thêm Sản phẩm
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6 items-end">
            {/* Search Input */}
            <div className="space-y-1">
              <Label htmlFor="search">Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  type="search"
                  placeholder="Tên, mã sản phẩm..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Category Select */}
            <div className="space-y-1">
              <Label htmlFor="category">Danh mục</Label>
              <Select
                value={filters.categoryId || ''}
                onValueChange={(value) => handleSelectFilterChange('categoryId', value === 'all' ? '' : value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Select */}
            <div className="space-y-1">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleSelectFilterChange('status', value === 'all' ? '' : value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                   {/* Add other relevant statuses */}
                </SelectContent>
              </Select>
            </div>
            
             {/* Price Range */}
            <div className="space-y-1 md:col-span-1">
              <Label>Khoảng giá</Label>
              <div className="flex gap-2">
                 <Input
                   type="number"
                   placeholder="Từ"
                   value={minPriceInput}
                   onChange={(e) => setMinPriceInput(e.target.value)}
                   min="0"
                   aria-label="Giá tối thiểu"
                 />
                 <Input
                   type="number"
                   placeholder="Đến"
                   value={maxPriceInput}
                   onChange={(e) => setMaxPriceInput(e.target.value)}
                   min="0"
                   aria-label="Giá tối đa"
                 />
              </div>
            </div>

            {/* Quantity Range */}
            <div className="space-y-1 md:col-span-1">
              <Label>Tồn kho</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Từ"
                  value={minQuantityInput}
                  onChange={(e) => setMinQuantityInput(e.target.value)}
                   min="0"
                   aria-label="Số lượng tồn tối thiểu"
                />
                 <Input
                   type="number"
                   placeholder="Đến"
                   value={maxQuantityInput}
                   onChange={(e) => setMaxQuantityInput(e.target.value)}
                   min="0"
                   aria-label="Số lượng tồn tối đa"
                 />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Grid */}
      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Render skeletons based on limit */}
           {Array.from({ length: filters.limit || 9 }).map((_, index) => (
             <ProductCardSkeleton key={`skeleton-${index}`} />
           ))}
         </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {products.map((product) => (
             <ProductCard key={product.id} product={product} />
           ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          <Package className="mx-auto h-12 w-12 mb-4" />
          <p>Không tìm thấy sản phẩm nào phù hợp.</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && paginationMeta && paginationMeta.totalPages > 1 && (
         <div className="mt-8 flex justify-center">
           <Pagination>
             <PaginationContent>
               <PaginationItem>
                 <PaginationPrevious
                   href="#"
                   onClick={(e) => { e.preventDefault(); handlePageChange(paginationMeta.page - 1); }}
                   className={paginationMeta.page <= 1 ? "pointer-events-none opacity-50" : undefined}
                 />
               </PaginationItem>
               {/* Logic to render page numbers - simplified for brevity */}
               {Array.from({ length: paginationMeta.totalPages }, (_, i) => i + 1).map(pageNumber => (
                 <PaginationItem key={pageNumber}>
                   <PaginationLink
                     href="#"
                     onClick={(e) => { e.preventDefault(); handlePageChange(pageNumber); }}
                     isActive={paginationMeta.page === pageNumber}
                   >
                     {pageNumber}
                   </PaginationLink>
                 </PaginationItem>
               ))}
               {/* Consider adding Ellipsis logic for many pages */}
               <PaginationItem>
                 <PaginationNext
                   href="#"
                   onClick={(e) => { e.preventDefault(); handlePageChange(paginationMeta.page + 1); }}
                   className={paginationMeta.page >= paginationMeta.totalPages ? "pointer-events-none opacity-50" : undefined}
                 />
               </PaginationItem>
             </PaginationContent>
           </Pagination>
         </div>
      )}
    </div>
  );
} 