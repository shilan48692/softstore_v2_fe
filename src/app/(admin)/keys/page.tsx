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

import { keyApi, ActivationKey, KeyStatus, PaginatedKeysResponse, SearchParams as KeySearchParams, productApi, Product } from '@/services/api'; // Updated to use consolidated api.ts
import { KeyDialog } from '@/components/admin/keys/KeyDialog';
import { KeyTable } from '@/components/admin/keys/KeyTable';
import { Trash2 as TrashIcon } from 'lucide-react'; // Import Trash2 with alias
import { ProductSearchInput } from '@/components/shared/ProductSearchInput'; // Renamed ProductOption export in its file
import { ImportSourceSearchInput, ImportSourceOption } from '@/components/shared/ImportSourceSearchInput'; // Import ImportSource search component and its option type

const DEFAULT_LIMIT = 10;

const KeysManagementPage = () => {
  // State for filters - Include new date filters and importSourceId
  const [filters, setFilters] = useState<Omit<KeySearchParams, 'page' | 'limit'>>({});
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for dialogs
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ActivationKey | null>(null);

  // State for product list (for dropdowns)
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  // State to hold the name of the selected import source for the filter input
  const [filterImportSource, setFilterImportSource] = useState<ImportSourceOption | null>(null);

  // ---> NEW: State for selected keys and bulk delete loading
  const [selectedKeyIds, setSelectedKeyIds] = useState<string[]>([]);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

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

  // SWR Key for data fetching - remove searchTerm parameter
  const getSwrKey = (page: number, currentFilters: Omit<KeySearchParams, 'page' | 'limit'>): string | null => {
    const params: Partial<KeySearchParams> = {
        ...currentFilters,
        page,
        limit: DEFAULT_LIMIT,
    };
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

  // SWR Fetcher function (no change needed here, it already handles various param types)
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

  // useSWR hook - remove debouncedSearchTerm dependency
  const swrKey = getSwrKey(currentPage, filters);
  const { data: keyData, error, isLoading, mutate: revalidateKeys } = useSWR<PaginatedKeysResponse>(
    swrKey,
    fetcher,
    { revalidateOnFocus: false } // Optional: disable revalidation on window focus
  );

  // Handlers for filters - handleFilterChange now handles text and date inputs
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => { // Add type
    const { name, value, type } = e.target;
    setFilters((prev: Omit<KeySearchParams, 'page' | 'limit'>) => ({
       ...prev, 
       [name]: value === '' ? undefined : value 
      }));
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

  // NEW: Handler specifically for ProductSearchInput
  const handleProductFilterChange = (selectedOption: { id: string; name: string } | undefined) => {
    setFilters((prev) => ({
      ...prev,
      productId: selectedOption?.id,
    }));
    setCurrentPage(1);
  };

  // NEW: Handler for Import Source Filter Input
  const handleImportSourceFilterChange = (selectedOption: ImportSourceOption | undefined) => {
    setFilters(prev => ({
      ...prev,
      importSourceId: selectedOption?.id // Update the ID in filters
    }));
    setFilterImportSource(selectedOption ?? null); // Update the object state for display
    setCurrentPage(1); // Reset page on filter change
  };

  // Combined reset function - clear import source filter as well
  const resetFiltersAndSearch = () => {
    setFilters({});
    setFilterImportSource(null); // Reset import source filter display state
    setCurrentPage(1);
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

  // Find initial product name for the search input
  const initialProductName = filters.productId
    ? products.find(p => p.id === filters.productId)?.name
    : null;

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
          {/* Filter Section - Updated Layout */} 
          <div className="mb-6 p-4 border rounded-lg bg-muted/40">
            <div className="flex justify-between items-center mb-3">
               <h3 className="text-lg font-semibold">Bộ lọc</h3>
               <Button variant="outline" size="sm" onClick={resetFiltersAndSearch} title="Reset Filters">
                   <RotateCcw className="mr-1 h-4 w-4" /> Reset
               </Button>
            </div>
            {/* Adjusted grid layout - Potentially more columns needed or adjust spans */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
               {/* Removed General Search Input - Fully removing the commented block */}

               {/* Filter Inputs - Reordered and Added Date/Import Source Filters */}
               <div>
                 <Label htmlFor="activationCode">Mã Key</Label>
                 <Input id="activationCode" name="activationCode" value={filters.activationCode || ''} onChange={handleFilterChange} placeholder="Lọc theo mã..."/>
               </div>
               <div>
                 <Label htmlFor="productId">Sản phẩm</Label>
                 <ProductSearchInput
                    // Pass the product ID string to value
                    value={filters.productId}
                    // Ensure ProductSearchInput onChange handles the object correctly
                    onChange={(selected) => handleProductFilterChange(selected ? { id: selected.id, name: selected.name } : undefined)}
                    initialProductName={initialProductName}
                    placeholder="Lọc theo sản phẩm..."
                    className="w-full"
                 />
               </div>
               {/* Add Import Source Filter */}
               <div>
                 <Label htmlFor="importSourceFilter">Nguồn Nhập</Label>
                 <ImportSourceSearchInput
                    value={filterImportSource} // Bind to the object state for display
                    onChange={handleImportSourceFilterChange}
                    placeholder="Lọc theo nguồn nhập..."
                    className="w-full"
                 />
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
               {/* Created At Date Range */}
               <div className="md:col-span-2 grid grid-cols-2 gap-2">
                   <div>
                       <Label htmlFor="createdAtFrom">Ngày tạo từ</Label>
                       <Input id="createdAtFrom" name="createdAtFrom" type="date" value={filters.createdAtFrom || ''} onChange={handleFilterChange} />
                   </div>
                   <div>
                       <Label htmlFor="createdAtTo">đến</Label>
                       <Input id="createdAtTo" name="createdAtTo" type="date" value={filters.createdAtTo || ''} onChange={handleFilterChange} />
                   </div>
               </div>

               {/* Used At Date Range */}
               <div className="md:col-span-2 grid grid-cols-2 gap-2">
                   <div>
                       <Label htmlFor="usedAtFrom">Ngày bán từ</Label>
                       <Input id="usedAtFrom" name="usedAtFrom" type="date" value={filters.usedAtFrom || ''} onChange={handleFilterChange} />
                   </div>
                   <div>
                       <Label htmlFor="usedAtTo">đến</Label>
                       <Input id="usedAtTo" name="usedAtTo" type="date" value={filters.usedAtTo || ''} onChange={handleFilterChange} />
                   </div>
               </div>

               {/* Cost Range - potentially move to span 2 cols */}
               <div className="md:col-span-2 grid grid-cols-2 gap-2 items-end">
                   <div>
                       <Label htmlFor="minCost">Giá nhập từ</Label>
                       <Input id="minCost" name="minCost" type="number" value={filters.minCost ?? ''} onChange={handleNumericFilterChange} placeholder="Từ"/>
                   </div>
                   <div>
                       <Label htmlFor="maxCost">đến</Label>
                       <Input id="maxCost" name="maxCost" type="number" value={filters.maxCost ?? ''} onChange={handleNumericFilterChange} placeholder="Đến"/>
                   </div>
               </div>
               {/* Note Filter Input - Moved here */}
               <div>
                 <Label htmlFor="note">Ghi chú</Label>
                 <Input id="note" name="note" value={filters.note || ''} onChange={handleFilterChange} placeholder="Lọc theo ghi chú..."/>
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