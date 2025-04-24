'use client';

import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category, productApi, Product, ApiResponse } from "@/services/api";
import { useDebounce } from './useDebounce';
import { Skeleton } from '@/components/ui/skeleton';
import { FormState, FormUpdateCallback } from '@/types/productForm';

interface SelectedProduct {
  id: string;
  name: string;
}

interface LinkingSectionProps {
  formState: FormState;
  updateFormState: FormUpdateCallback;
  categories: Category[];
  currentProductId?: string;
}

const LinkingSection: React.FC<LinkingSectionProps> = ({ formState, updateFormState, categories, currentProductId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Pick<Product, 'id' | 'name'>[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Effect to fetch initial product details
  useEffect(() => {
    let isMounted = true;
    const fetchInitialProducts = async () => {
      // This logic relies on internal state (`selectedProducts`), not directly on formState for initial IDs
      // We need to get the initial IDs from the parent formState if they exist elsewhere
      // Assuming the parent state *doesn't* hold initial related product IDs directly:
      // Let the component manage its selected products entirely based on search/add/remove
      // OR If parent *should* provide initial IDs (e.g., via a different prop or potentially formState.someOtherField?)
      // We need to clarify how initial related products are passed.
      // For now, assume it starts empty or relies on internal logic if needed.
      setIsInitialLoad(false); // Simplify: Assume we don't load initial related products from parent state this way
      /* 
      const relatedProductIds = formState.relatedProductsIds ?? []; // This field doesn't exist
      if (relatedProductIds.length > 0 && isInitialLoad) { ... }
      */
    };
    fetchInitialProducts();
    return () => { isMounted = false; };
  }, [isInitialLoad]);

  // Effect to search products when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    let isMounted = true;
    const searchProducts = async () => {
      setIsLoadingSearch(true);
      try {
        console.log("Searching for:", debouncedSearchQuery);
        const results = await productApi.searchByName(debouncedSearchQuery);
        console.log("Search results raw:", results);
        
        // Filter out already selected products AND the current product being edited
        const availableResults = results.filter(
          (result) => 
            result.id !== currentProductId && // Exclude current product
            !selectedProducts.some((selected) => selected.id === result.id)
        );

        console.log("Search results available:", availableResults);
        if (isMounted) {
            setSearchResults(availableResults);
        }
      } catch (error) {
        console.error('Error searching products:', error);
        if (isMounted) {
            setSearchResults([]);
        }
      } finally {
        if (isMounted) {
            setIsLoadingSearch(false);
        }
      }
    };

    searchProducts();

    return () => {
        isMounted = false; // Cleanup
    };

  }, [debouncedSearchQuery, selectedProducts, currentProductId]);

  const handleSelectProduct = (product: Pick<Product, 'id' | 'name'>) => {
    if (!selectedProducts.some(p => p.id === product.id)) {
      const newSelectedProducts = [...selectedProducts, { id: product.id, name: product.name }];
      setSelectedProducts(newSelectedProducts);
      // REMOVE call to updateFormState as parent doesn't track this
      // updateFormState({ relatedProductsIds: newSelectedProducts.map(p => p.id) });
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveProduct = (productId: string) => {
    const newSelectedProducts = selectedProducts.filter((p) => p.id !== productId);
    setSelectedProducts(newSelectedProducts);
    // REMOVE call to updateFormState as parent doesn't track this
    // updateFormState({ relatedProductsIds: newSelectedProducts.map(p => p.id) });
  };

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="categoryId">Danh Mục Sản Phẩm</Label>
            <Select
              value={formState.categoryId ?? ''}
              onValueChange={(value) => updateFormState({ categoryId: value || null })}
              disabled={categories.length === 0}
            >
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat: Category) => (
                   <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                 ))}
              </SelectContent>
            </Select>
          </div>
         
          {/* Related Products Search */}
          <div className="relative">
            <Label htmlFor="relatedProductSearch">Sản Phẩm Liên Quan</Label>
            <Input
              id="relatedProductSearch"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên sản phẩm..."
              autoComplete="off"
              // Disable prop doesn't depend on formState related products
              disabled={isInitialLoad} 
            />
            {(isLoadingSearch || searchResults.length > 0 || (searchQuery.length >= 2 && !isLoadingSearch && searchResults.length === 0) ) && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {isLoadingSearch ? (
                  <div className="p-2 text-gray-500 text-sm">Đang tìm...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => handleSelectProduct(product)}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {product.name}
                    </div>
                  ))
                ) : (
                   <div className="p-2 text-gray-500 text-sm">Không tìm thấy sản phẩm.</div>
                )}
              </div>
            )}
           
            {/* Display Selected Products */}
            <div className="mt-2 flex flex-wrap gap-2 min-h-[24px]">
              {/* Skeleton/Display logic depends on internal `selectedProducts` state, not formState */}
              {isInitialLoad ? (
                 <Skeleton className="h-6 w-24 rounded-full" /> // Show one skeleton while loading?
              ) : (
                  selectedProducts.map((product) => (
                    <Badge key={product.id} variant="secondary" className="flex items-center gap-1">
                      {product.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(product.id)}
                        className="ml-1 p-0.5 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-1 focus:ring-ring"
                        aria-label={`Remove ${product.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
              )}
            </div>
          </div>
         
          <div>
            <Label htmlFor="additionalRequirementIds">Yêu Cầu Bổ Sung</Label>
            <Textarea
              id="additionalRequirementIds"
              value={(formState.additionalRequirementIds ?? []).join('\n')}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateFormState({ additionalRequirementIds: e.target.value ? e.target.value.split('\n').map(r => r.trim()) : [] })}
              placeholder="Nhập yêu cầu (mỗi yêu cầu một dòng)"
              className="min-h-[100px]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkingSection; 