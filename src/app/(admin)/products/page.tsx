'use client';

import { useEffect, useState, useCallback } from 'react';
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
import { Package, Search, Plus, Edit, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { Label } from "@/components/ui/label";

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

  const loadProducts = useCallback(async (params: AdminProductSearchParams) => {
    try {
      setLoading(true);
      console.log("Loading products with params:", params);
      const response = await productApi.searchAdmin(params);
      console.log('API Response:', response);
      setProducts(response.data || []);
      setPaginationMeta(response.meta || { total: 0, page: params.page || 1, limit: params.limit || 9, totalPages: 0 });
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
      setPaginationMeta({ total: 0, page: params.page || 1, limit: params.limit || 9, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    const fetchedCategories = await categoryApi.getAllAdmin();
    setCategories(fetchedCategories);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts(filters);
  }, [filters, loadProducts]);

  const handleFilterChange = (key: keyof AdminProductSearchParams, value: any) => {
    const shouldResetPage = key !== 'page';
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(shouldResetPage && { page: 1 })
    }));
  };
  
  const handleResetFilters = () => {
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
      handleFilterChange('page', newPage);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

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
        <h1 className="text-2xl font-bold">Danh Sách Sản Phẩm</h1>
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
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="md:col-span-1"
            />
            <Select 
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value === 'ALL' ? '' : value as 'ACTIVE' | 'INACTIVE')}
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
              value={filters.categoryId} 
              onValueChange={(value) => handleFilterChange('categoryId', value === 'ALL' ? '' : value)}
              disabled={categories.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả danh mục</SelectItem>
                 {categories.map(cat => (
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
                     value={filters.minPrice}
                     onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : '')}
                     className="h-9"
                   />
                   <Input 
                     type="number" 
                     placeholder="Đến" 
                     value={filters.maxPrice}
                     onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : '')}
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
                    value={filters.minQuantity}
                    onChange={(e) => handleFilterChange('minQuantity', e.target.value ? Number(e.target.value) : '')}
                    className="h-9"
                  />
                  <Input 
                    type="number" 
                    placeholder="Đến" 
                    value={filters.maxQuantity}
                    onChange={(e) => handleFilterChange('maxQuantity', e.target.value ? Number(e.target.value) : '')}
                    className="h-9"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                 <Label htmlFor="sortBy" className="text-sm">Sắp xếp theo</Label>
                 <Select 
                   value={filters.sortBy} 
                   onValueChange={(value) => handleFilterChange('sortBy', value as AdminProductSearchParams['sortBy'])}
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
                    onValueChange={(value) => handleFilterChange('sortOrder', value as 'ASC' | 'DESC')}
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

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-8">Không tìm thấy sản phẩm nào khớp bộ lọc.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex-1 mr-2">
                    <CardTitle className="text-xl font-bold mb-1">{product.name}</CardTitle>
                    <Badge variant={product.status === 'ACTIVE' ? 'default' : 'destructive'}>
                      {product.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                    </Badge>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/products/edit/${product.id}`}>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-500 line-clamp-2 h-10">
                    {product.shortDescription || product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      {product.promotionEnabled && product.promotionPrice && product.promotionPrice > 0 && (
                        <>
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                          <span className="font-bold text-lg text-red-600">
                            {formatPrice(product.promotionPrice)}
                          </span>
                        </>
                      )}
                      {(!product.promotionEnabled || !product.promotionPrice || product.promotionPrice <= 0) && (
                        <span className="font-bold text-lg">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      Còn lại: {product.quantity}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-auto">
                  {product.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                  {product.tags.length > 3 && <Badge variant="outline">...</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {paginationMeta.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {e.preventDefault(); handlePageChange(paginationMeta.page - 1)}}
                  aria-disabled={paginationMeta.page <= 1}
                  tabIndex={paginationMeta.page <= 1 ? -1 : undefined}
                  className={paginationMeta.page <= 1 ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
              
               <PaginationItem>
                 <PaginationLink href="#" isActive>
                   {paginationMeta.page}
                 </PaginationLink>
               </PaginationItem>
               {paginationMeta.totalPages > paginationMeta.page && (
                 <PaginationItem>
                   <PaginationEllipsis />
                 </PaginationItem>
               )}

              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {e.preventDefault(); handlePageChange(paginationMeta.page + 1)}}
                  aria-disabled={paginationMeta.page >= paginationMeta.totalPages}
                  tabIndex={paginationMeta.page >= paginationMeta.totalPages ? -1 : undefined}
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