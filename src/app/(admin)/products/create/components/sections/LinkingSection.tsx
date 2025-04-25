'use client';

import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { Category, Product, ApiResponse } from "@/services/api";
import { FormState, FormUpdateCallback } from '@/types/productForm';
import { ProductSearchInput } from '@/components/shared/ProductSearchInput';

type ProductOption = Pick<Product, 'id' | 'name'>;

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
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(formState.relatedProductsData ?? []);

  useEffect(() => {
    setSelectedProducts(formState.relatedProductsData ?? []);
  }, [formState.relatedProductsData]);

  const handleSelectProduct = (product: ProductOption | undefined) => {
    if (product && !selectedProducts.some(p => p.id === product.id) && product.id !== currentProductId) {
      const newSelectedProducts = [...selectedProducts, { id: product.id, name: product.name }];
      setSelectedProducts(newSelectedProducts);
      updateFormState({ 
        relatedProductIds: newSelectedProducts.map(p => p.id),
        relatedProductsData: newSelectedProducts 
      });
    }
  };

  const handleRemoveProduct = (productId: string) => {
    const newSelectedProducts = selectedProducts.filter((p) => p.id !== productId);
    setSelectedProducts(newSelectedProducts);
    updateFormState({ 
        relatedProductIds: newSelectedProducts.map(p => p.id),
        relatedProductsData: newSelectedProducts
     });
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
          <div className="space-y-1">
              <Label htmlFor="relatedProductSearch">Thêm Sản Phẩm Liên Quan</Label>
              <ProductSearchInput
                  value={null} 
                  onChange={handleSelectProduct}
                  placeholder="Tìm kiếm để thêm..."
              />
          </div>

          {/* Display Selected Products */}
          {selectedProducts.length > 0 && (
            <div className="space-y-2 pt-2">
              <Label>Đã chọn:</Label>
              <div className="flex flex-wrap gap-2 min-h-[24px]">
                {selectedProducts.map((product) => (
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
                ))}
              </div>
            </div>
          )}
         
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