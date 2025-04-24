'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useSWR, { mutate } from 'swr'; // Import useSWR and mutate
import { toast } from 'sonner';
import { PlusCircle, Search, X, Loader2, Edit, Trash2, RotateCcw } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from "@/components/ui/pagination";
import { Badge } from '@/components/ui/badge';
import { debounce } from 'lodash';

import { keyApi, ActivationKey, KeyStatus, PaginatedKeysResponse, SearchParams as KeySearchParams, productApi, Product } from '@/services/api'; // Updated to use consolidated api.ts
import { KeyDialog } from '@/components/admin/keys/KeyDialog';
import { KeyTable } from '@/components/admin/keys/KeyTable';
import { Trash2 as TrashIcon } from 'lucide-react'; // Import Trash2 with alias

const DEFAULT_LIMIT = 10;

const KeysManagementPage = () => {
  // State for filters
  const [filters, setFilters] = useState<Omit<KeySearchParams, 'page' | 'limit'>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // State for dialogs
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ActivationKey | null>(null);

  // State for product list (for dropdowns)
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);

  // ---> NEW: State for selected keys and bulk delete loading
  const [selectedKeyIds, setSelectedKeyIds] = useState<string[]>([]);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

  // Debounce search term
  const debouncedSetSearch = useCallback(debounce((value: string) => {
    setDebouncedSearchTerm(value);
    setCurrentPage(1); // Reset page when search term changes
  }, 500), []); // 500ms delay

  useEffect(() => {
    debouncedSetSearch(searchTerm);
    // Cleanup function to cancel debounce on unmount
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [searchTerm, debouncedSetSearch]);

  // Fetch product list on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Use searchAdmin to fetch products
        const productResponse = await productApi.searchAdmin({}); // Correct API call
        setProducts(productResponse.data.map((p: Product) => ({ id: p.id, name: p.name }))); // Add Product type
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error('Không thể tải danh sách sản phẩm.');
      }
    };
    fetchProducts();
  }, []);

  // SWR Key for data fetching
  const getSwrKey = (page: number, currentFilters: Omit<KeySearchParams, 'page' | 'limit'>, searchTerm: string): string | null => {
    const params: Partial<KeySearchParams> = {
        ...currentFilters,
        page,
        limit: DEFAULT_LIMIT,
    };
    // Use searchTerm for activationCode filter if it exists
    if (searchTerm) {
       params.activationCode = searchTerm;
    }

    // Remove undefined/null/empty string values before creating search params
    Object.keys(params).forEach(key => {
        const typedKey = key as keyof KeySearchParams;
        if (params[typedKey] === undefined || params[typedKey] === null || params[typedKey] === '') {
            delete params[typedKey];
        }
    });

    // Ensure values passed to URLSearchParams are strings
    const stringParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            stringParams[key] = String(value);
        }
    });

    const basePath = '/admin/keys/search'; // Reverted based on API guide
    return `${basePath}?${new URLSearchParams(stringParams).toString()}`;
  };

  // SWR Fetcher function
  const fetcher = (url: string): Promise<PaginatedKeysResponse> => {
    const searchParams = new URLSearchParams(url.split('?')[1] || '');
    // Convert URLSearchParams to an object suitable for keyApi.search
    const paramsObject: Record<string, string | number | boolean> = {}; // More specific type
    searchParams.forEach((value, key) => {
      // Basic auto-conversion for potential numbers or booleans if needed
      // This is simplistic; the API should ideally handle string inputs robustly
      if (!isNaN(Number(value)) && value.trim() !== '') {
        paramsObject[key] = Number(value);
      } else if (value === 'true' || value === 'false') {
        paramsObject[key] = value === 'true';
      } else {
        paramsObject[key] = value;
      }
    });
     // Ensure page and limit are numbers if they exist
     if (paramsObject.page !== undefined) paramsObject.page = Number(paramsObject.page);
     if (paramsObject.limit !== undefined) paramsObject.limit = Number(paramsObject.limit);

    return keyApi.search(paramsObject as KeySearchParams); // Pass the object, cast to expected type
  }

  // useSWR hook
  const swrKey = getSwrKey(currentPage, filters, debouncedSearchTerm);
  const { data: keyData, error, isLoading, mutate: revalidateKeys } = useSWR<PaginatedKeysResponse>(
    swrKey,
    fetcher,
    { revalidateOnFocus: false } // Optional: disable revalidation on window focus
  );

  // Handlers for filters
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => { // Add type
    const { name, value } = e.target;
    setFilters((prev: Omit<KeySearchParams, 'page' | 'limit'>) => ({ ...prev, [name]: value === '' ? undefined : value }));
    setCurrentPage(1); // Reset page on filter change
  };

  const handleNumericFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => { // Add type
    const { name, value } = e.target;
    const numericValue = value === '' ? undefined : Number(value);
    setFilters((prev: Omit<KeySearchParams, 'page' | 'limit'>) => ({
        ...prev,
        [name]: isNaN(numericValue as number) ? undefined : numericValue
    }));
     setCurrentPage(1); // Reset page on filter change
  };

  const handleSelectFilterChange = (name: keyof Omit<KeySearchParams, 'page' | 'limit'>, value: string) => { // Use Omit here too
    setFilters((prev: Omit<KeySearchParams, 'page' | 'limit'>) => ({
      ...prev,
      [name]: value === 'all' ? undefined : value as any // Cast if needed
    }));
    setCurrentPage(1); // Reset page on filter change
  };

  // Handler for search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Combined reset function
  const resetFiltersAndSearch = () => {
    setFilters({});
    setSearchTerm(''); // Clear search input, triggers debounced update
    // setCurrentPage(1); // Debounced effect already resets page
    // No need to call revalidateKeys here explicitly
  };

  // Handlers for Dialogs
  const openAddDialog = () => {
    setEditingKey(null);
    setIsAddEditDialogOpen(true);
  };

  const openEditDialog = (key: ActivationKey) => { // Add type
    setEditingKey(key);
    setIsAddEditDialogOpen(true);
  };

  // Updated delete handler to use window.confirm()
  const handleDeleteRequest = async (keyToDelete: ActivationKey) => {
    const confirmation = window.confirm(
      `Bạn có chắc chắn muốn xóa key "${keyToDelete.activationCode}" không? Hành động này không thể hoàn tác.`
    );
    if (confirmation) {
      // Directly call the delete API
      toast.promise(
          keyApi.delete(keyToDelete.id),
          {
              loading: 'Đang xóa key...',
              success: () => {
                  revalidateKeys(); // Revalidate SWR data
                  return `Đã xóa key: ${keyToDelete.activationCode}`;
              },
              error: (err: any) => {
                  console.error("Error deleting key:", err);
                  return err?.response?.data?.message || 'Lỗi xóa key.';
              }
          }
      );
    }
  };

  const closeDialogs = () => {
    setIsAddEditDialogOpen(false);
    setEditingKey(null);
    // No need to manage delete dialog state anymore
  };

  // Handler for successful add/edit
  const handleSuccess = () => {
    revalidateKeys(); // Revalidate SWR data
    closeDialogs(); // Close the Add/Edit dialog on success
  };

  // ---> NEW: Handlers for row selection
  const handleSelectKey = (id: string, checked: boolean) => {
    setSelectedKeyIds((prevSelected) =>
      checked
        ? [...prevSelected, id]
        : prevSelected.filter((selectedId) => selectedId !== id)
    );
  };

  const handleSelectAllKeys = (checked: boolean) => {
    if (checked && keyData?.data) {
      setSelectedKeyIds(keyData.data.map((key) => key.id));
    } else {
      setSelectedKeyIds([]);
    }
  };

  // ---> NEW: Handler for deleting selected keys
  const handleDeleteSelected = async () => {
    if (selectedKeyIds.length === 0) return;

    const confirmation = window.confirm(
      `Bạn có chắc chắn muốn xóa ${selectedKeyIds.length} key đã chọn không? Hành động này không thể hoàn tác.`
    );

    if (confirmation) {
      setIsDeletingSelected(true);
      toast.promise(
        keyApi.deleteBulk(selectedKeyIds), // Assuming keyApi.deleteBulk exists
        {
          loading: `Đang xóa ${selectedKeyIds.length} key...`,
          success: () => {
            setSelectedKeyIds([]); // Clear selection
            revalidateKeys();    // Revalidate data
            return `Đã xóa ${selectedKeyIds.length} key thành công.`;
          },
          error: (err: any) => {
            console.error("Error deleting selected keys:", err);
            return err?.response?.data?.message || 'Lỗi xóa các key đã chọn.';
          },
          finally: () => {
            setIsDeletingSelected(false);
          }
        }
      );
    }
  };

  // Error Handling for SWR
  useEffect(() => {
    if (error) {
      toast.error("Lỗi tải danh sách key.");
      console.error("SWR Error fetching keys:", error);
    }
  }, [error]);

  const totalPages = keyData ? Math.ceil(keyData.total / DEFAULT_LIMIT) : 0;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-2xl font-bold">Quản lý Key Kích Hoạt</CardTitle>
            {/* Modified Button Group */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline"
                onClick={handleDeleteSelected}
                disabled={selectedKeyIds.length === 0 || isDeletingSelected}
                className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
              >
                {isDeletingSelected ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <TrashIcon className="mr-2 h-4 w-4" />
                )}
                Xóa đã chọn ({selectedKeyIds.length})
              </Button>
              <Button onClick={openAddDialog}>
                <PlusCircle className="mr-2 h-4 w-4" /> Thêm Key
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Section */}
          <div className="mb-6 p-4 border rounded-lg bg-muted/40">
            <div className="flex justify-between items-center mb-3">
               <h3 className="text-lg font-semibold">Bộ lọc và Tìm kiếm</h3>
               <Button variant="outline" size="sm" onClick={resetFiltersAndSearch} title="Reset Filters and Search">
                   <RotateCcw className="mr-1 h-4 w-4" /> Reset
               </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
               {/* Search Input */}
               <div className="sm:col-span-2 md:col-span-1 lg:col-span-2 xl:col-span-1">
                 <Label htmlFor="search">Tìm kiếm chung</Label>
                 <div className="relative">
                   <Input
                     id="search"
                     name="search"
                     value={searchTerm}
                     onChange={handleSearchInputChange}
                     placeholder="Tìm mã key, email, ghi chú..."
                     className="pr-8"
                   />
                   <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 </div>
               </div>

               {/* Filter Inputs */}
               <div>
                 <Label htmlFor="activationCode">Mã Key</Label>
                 <Input id="activationCode" name="activationCode" value={filters.activationCode || ''} onChange={handleFilterChange} placeholder="Lọc theo mã..."/>
               </div>
               <div>
                 <Label htmlFor="productId">Sản phẩm</Label>
                 <Select name="productId" value={filters.productId?.toString() || 'all'} onValueChange={(value: string) => handleSelectFilterChange('productId', value)}>
                   <SelectTrigger>
                     <SelectValue placeholder="Tất cả sản phẩm" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">Tất cả sản phẩm</SelectItem>
                     {products.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                   </SelectContent>
                 </Select>
               </div>
                <div>
                 <Label htmlFor="status">Trạng thái</Label>
                 <Select name="status" value={filters.status || 'all'} onValueChange={(value: string) => handleSelectFilterChange('status', value)}>
                   <SelectTrigger>
                     <SelectValue placeholder="Tất cả trạng thái" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">Tất cả trạng thái</SelectItem>
                     {Object.values(KeyStatus).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                   </SelectContent>
                 </Select>
               </div>
               <div>
                 <Label htmlFor="userEmail">Email người dùng</Label>
                 <Input id="userEmail" name="userEmail" value={filters.userEmail || ''} onChange={handleFilterChange} placeholder="Lọc theo email..."/>
               </div>
               {/* Cost Range */}
                <div className="flex gap-2 items-end">
                    <div>
                        <Label htmlFor="minCost">Giá nhập từ</Label>
                        <Input id="minCost" name="minCost" type="number" value={filters.minCost ?? ''} onChange={handleNumericFilterChange} placeholder="Từ"/>
                    </div>
                    <div>
                        <Label htmlFor="maxCost">đến</Label>
                        <Input id="maxCost" name="maxCost" type="number" value={filters.maxCost ?? ''} onChange={handleNumericFilterChange} placeholder="Đến"/>
                    </div>
                </div>
             </div>
          </div>

          {/* Table Section */}
          {isLoading && <div className="text-center p-4">Đang tải dữ liệu...</div>} {/* Centered loading */} 
          {error && !isLoading && <div className="text-center p-4 text-red-500">Lỗi tải dữ liệu. Vui lòng thử lại.</div>} {/* Centered error */}
          {!isLoading && !error && keyData && (
            <>
              <KeyTable
                keys={keyData.data}
                isLoading={isLoading}
                onEdit={openEditDialog}
                onDelete={handleDeleteRequest}
                selectedIds={selectedKeyIds} // Pass state down
                onSelectChange={handleSelectKey} // Pass handler down
                onSelectAllChange={handleSelectAllKeys} // Pass handler down
              />
              {/* Pagination - Moved outside KeyTable, uses CardFooter */}
              {totalPages > 1 && (
                <CardFooter className="pt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} aria-disabled={currentPage === 1} tabIndex={currentPage === 1 ? -1 : undefined} className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined} />
                      </PaginationItem>
                      {/* Simple page number rendering - Consider adding ellipsis for many pages */}
                      {[...Array(totalPages).keys()].map((page) => (
                        <PaginationItem key={page + 1}>
                          <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }} isActive={currentPage === page + 1}>
                            {page + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} aria-disabled={currentPage === totalPages} tabIndex={currentPage === totalPages ? -1 : undefined} className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </CardFooter>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      {isAddEditDialogOpen && (
        <KeyDialog
          isOpen={isAddEditDialogOpen}
          onClose={closeDialogs}
          onSuccess={handleSuccess}
          keyData={editingKey}
          products={products}
        />
      )}
    </div>
  );
};

export default KeysManagementPage; 