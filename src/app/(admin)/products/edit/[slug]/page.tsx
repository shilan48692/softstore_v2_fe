'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { productApi, categoryApi, Category, Product, ApiResponse } from "@/services/api";
import Link from 'next/link';

// Import các section components
import OverviewSection from "@/app/(admin)/products/create/components/sections/OverviewSection";
import PopupNotificationSection from "@/app/(admin)/products/create/components/sections/PopupNotificationSection";
import ProductDataSection from "@/app/(admin)/products/create/components/sections/ProductDataSection";
import LinkingSection from "@/app/(admin)/products/create/components/sections/LinkingSection";
import PromotionSection from "@/app/(admin)/products/create/components/sections/PromotionSection";
import CustomCodeSection from "@/app/(admin)/products/create/components/sections/CustomCodeSection";
import StatusSection from "@/app/(admin)/products/create/components/sections/StatusSection";

// Import Shared Types
import { FormState, FormUpdateCallback } from '@/types/productForm';

// Helper function to generate slug (can be imported or defined here)
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};

// Helper functions for number conversion
const toNumberOrUndefined = (value: any): number | undefined => {
  if (value === '' || value === null || value === undefined) return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};
const toNumberOrDefault = (value: any, defaultValue: number): number => {
  if (value === '' || value === null || value === undefined) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// Helper to safely get string or empty string
const toStringOrEmpty = (value: any): string => {
  return value === null || value === undefined ? '' : String(value);
};

// Helper to safely get number or empty string
const toNumberOrEmpty = (value: any): number | '' => {
  if (value === null || value === undefined) return '';
  const num = Number(value);
  return isNaN(num) ? '' : num; // Return '' if conversion fails or original was not a number
};

// Helper to safely get number or null or empty string
const toNumberOrNullOrEmpty = (value: any): number | null | '' => {
  if (value === null) return null;
  if (value === undefined || value === '') return '';
  const num = Number(value);
  return isNaN(num) ? '' : num;
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [productId, setProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formState, setFormState] = useState<FormState>({});
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);

  const loadInitialData = useCallback(async () => {
    if (!slug) {
      console.error("Slug not found in URL params.");
      setInitialLoadError("Không tìm thấy slug sản phẩm trong URL.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setInitialLoadError(null);
      
      const [productResponse, categoriesResponse] = await Promise.all([
        productApi.getBySlug(slug),
        categoryApi.getAllAdmin()
      ]);

      console.log('Product API response:', productResponse);
      console.log('Categories API response:', categoriesResponse);

      if (categoriesResponse?.success && Array.isArray(categoriesResponse.data)) {
        setCategories(categoriesResponse.data);
      } else {
        const catError = categoriesResponse?.message || 'Lỗi không rõ khi tải danh mục.';
        console.warn("Category API call failed or invalid data:", catError);
        toast.warning(`Không thể tải danh mục: ${catError}`);
        setCategories([]); 
      }

      if (productResponse?.success && productResponse.data) {
        const actualProductData = productResponse.data;
        setProductId(actualProductData.id);
        // Ensure defaults for potentially null/undefined fields expected by UI components
        setFormState({
          productName: actualProductData.name ?? '',
          slug: actualProductData.slug ?? '',
          originalSlug: actualProductData.slug ?? '',
          productId: actualProductData.id,
          gameCode: actualProductData.gameCode ?? '',
          analyticsCode: actualProductData.analyticsCode ?? '',
          requirePhone: actualProductData.requirePhone ?? false,
          shortDescription: actualProductData.shortDescription ?? '',
          description: actualProductData.description ?? '',
          warrantyPolicy: actualProductData.warrantyPolicy ?? '',
          faq: actualProductData.faq ?? '',
          metaTitle: actualProductData.metaTitle ?? '',
          metaDescription: actualProductData.metaDescription ?? '',
          mainKeyword: actualProductData.mainKeyword ?? '',
          secondaryKeywords: actualProductData.secondaryKeywords || [],
          tags: actualProductData.tags || [],
          popupEnabled: actualProductData.popupEnabled ?? false,
          popupTitle: actualProductData.popupTitle ?? '',
          popupContent: actualProductData.popupContent ?? '',
          guideUrl: actualProductData.guideUrl ?? '',
          imageUrl: actualProductData.imageUrl ?? '',
          originalPrice: toNumberOrEmpty(actualProductData.originalPrice),
          importPrice: toNumberOrEmpty(actualProductData.importPrice),
          importSource: actualProductData.importSource ?? '',
          quantity: toNumberOrEmpty(actualProductData.quantity),
          autoSyncQuantityWithKey: actualProductData.autoSyncQuantityWithKey ?? false,
          minPerOrder: toNumberOrEmpty(actualProductData.minPerOrder),
          maxPerOrder: toNumberOrNullOrEmpty(actualProductData.maxPerOrder),
          autoDeliverKey: actualProductData.autoDeliverKey ?? false,
          showMoreDescription: actualProductData.showMoreDescription ?? false,
          promotionEnabled: actualProductData.promotionEnabled ?? false,
          lowStockWarning: toNumberOrNullOrEmpty(actualProductData.lowStockWarning),
          gameKeyText: actualProductData.gameKeyText ?? '',
          guideText: actualProductData.guideText ?? '',
          expiryDays: toNumberOrNullOrEmpty(actualProductData.expiryDays),
          allowComment: actualProductData.allowComment ?? false,
          promotionPrice: toNumberOrNullOrEmpty(actualProductData.promotionPrice),
          promotionStartDate: actualProductData.promotionStartDate,
          promotionEndDate: actualProductData.promotionEndDate,
          promotionQuantity: toNumberOrNullOrEmpty(actualProductData.promotionQuantity),
          categoryId: actualProductData.categoryId ?? null,
          additionalRequirementIds: actualProductData.additionalRequirementIds ?? [],
          relatedProductsData: actualProductData.Product_A ?? [],
          relatedProductIds: (actualProductData.Product_A ?? []).map(p => p.id),
          customHeadCode: actualProductData.customHeadCode ?? '',
          customBodyCode: actualProductData.customBodyCode ?? '',
          status: actualProductData.status ?? 'INACTIVE',
        });
      } else {
        const prodError = productResponse?.message || 'Lỗi không rõ khi tải sản phẩm.';
        console.error("Product API call failed or invalid data:", prodError);
        setInitialLoadError(`Không thể tải dữ liệu sản phẩm: ${prodError}`);
        setProductId(null);
        setFormState({});
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
      const errorMsg = (error as any)?.response?.data?.message || (error as Error)?.message || 'Lỗi không xác định';
      setInitialLoadError(`Lỗi hệ thống khi tải dữ liệu: ${errorMsg}`);
      setProductId(null);
      setFormState({});
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Use the imported shared type
  const handleFormChange: FormUpdateCallback = useCallback((updatedData) => {
    setFormState(prevState => {
      const newState = { ...prevState, ...updatedData };
      // Auto-update slug if productName changes and slug hasn't been manually edited
      if ('productName' in updatedData && updatedData.productName &&
          (!newState.originalSlug || newState.slug === newState.originalSlug || newState.slug === generateSlug(prevState.productName || '')))
      {
        newState.slug = generateSlug(updatedData.productName);
      }
      return newState;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      toast.error("Không thể lưu: Thiếu ID sản phẩm. Vui lòng thử tải lại trang.");
      return;
    }
    setSaving(true);

    const formatDateForApi = (dateString: string | null | undefined): string | null => {
        if (!dateString) return null;
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? null : date.toISOString();
        } catch (error) {
            console.warn("Error formatting date:", dateString, error);
            return null;
        }
    };

    const updateData: Partial<Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'category'>> = {
      name: formState.productName,
      gameCode: formState.gameCode,
      analyticsCode: formState.analyticsCode,
      requirePhone: formState.requirePhone,
      shortDescription: formState.shortDescription,
      description: formState.description,
      warrantyPolicy: formState.warrantyPolicy,
      faq: formState.faq,
      metaTitle: formState.metaTitle,
      metaDescription: formState.metaDescription,
      mainKeyword: formState.mainKeyword,
      secondaryKeywords: formState.secondaryKeywords,
      tags: formState.tags,
      popupEnabled: formState.popupEnabled,
      popupTitle: formState.popupTitle,
      popupContent: formState.popupContent,
      guideUrl: formState.guideUrl,
      imageUrl: formState.imageUrl,
      originalPrice: toNumberOrUndefined(formState.originalPrice),
      importPrice: toNumberOrUndefined(formState.importPrice),
      importSource: formState.importSource,
      quantity: toNumberOrUndefined(formState.quantity),
      autoSyncQuantityWithKey: formState.autoSyncQuantityWithKey,
      minPerOrder: toNumberOrUndefined(formState.minPerOrder),
      maxPerOrder: toNumberOrUndefined(formState.maxPerOrder),
      autoDeliverKey: formState.autoDeliverKey,
      showMoreDescription: formState.showMoreDescription,
      promotionEnabled: formState.promotionEnabled,
      lowStockWarning: toNumberOrUndefined(formState.lowStockWarning),
      gameKeyText: formState.gameKeyText,
      guideText: formState.guideText,
      expiryDays: toNumberOrUndefined(formState.expiryDays),
      allowComment: formState.allowComment,
      promotionPrice: toNumberOrUndefined(formState.promotionPrice),
      promotionStartDate: formatDateForApi(formState.promotionStartDate),
      promotionEndDate: formatDateForApi(formState.promotionEndDate),
      promotionQuantity: toNumberOrUndefined(formState.promotionQuantity),
      categoryId: formState.categoryId,
      additionalRequirementIds: formState.additionalRequirementIds,
      relatedProductIds: formState.relatedProductIds ?? [],
      customHeadCode: formState.customHeadCode,
      customBodyCode: formState.customBodyCode,
      status: formState.status,
    };

    Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
            delete updateData[key as keyof typeof updateData];
        }
    });

    console.log('Sending update data to API:', updateData);

    try {
      const updatedProduct = await productApi.update(productId, updateData);
      console.log('Product updated:', updatedProduct);
      toast.success("Sản phẩm đã được cập nhật thành công!");
      setFormState(prev => ({...prev, originalSlug: prev.slug}));
    } catch (error) {
      console.error('Error updating product:', error);
      const errorMsg = (error as any)?.response?.data?.message || (error as Error)?.message || 'Lỗi không xác định';
      toast.error(`Không thể cập nhật sản phẩm: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  }

  if (initialLoadError) {
    return (
      <div className="container mx-auto py-8 text-center text-red-600">
        <p>{initialLoadError}</p>
        <Button onClick={loadInitialData} variant="outline" className="mt-4">
          Thử lại
        </Button>
      </div>
    );
  }

  // Log the state just before rendering
  console.log("Rendering EditProductPage with formState:", formState);

  return (
    <div className="p-6 space-y-6">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link href="/products">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Chỉnh sửa sản phẩm: {formState.productName || slug}</h1>
          </div>
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={saving || loading}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Lưu Thay Đổi
          </Button>
        </div>

        <div className="space-y-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-7 mb-4">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="data">Dữ liệu</TabsTrigger>
              <TabsTrigger value="linking">Liên kết</TabsTrigger>
              <TabsTrigger value="promotion">Khuyến mãi</TabsTrigger>
              <TabsTrigger value="popup">Popup</TabsTrigger>
              <TabsTrigger value="status">Trạng thái</TabsTrigger>
              <TabsTrigger value="customCode">Mã tùy chỉnh</TabsTrigger>
            </TabsList>

            <Card>
              <TabsContent value="overview" className="p-6">
                <OverviewSection 
                  key={`overview-${productId}`}
                  formState={formState}
                  updateFormState={handleFormChange}
                />
              </TabsContent>
              <TabsContent value="data" className="p-6">
                 <ProductDataSection 
                   key={`data-${productId}`}
                   formState={formState}
                   updateFormState={handleFormChange}
                 />
              </TabsContent>
               <TabsContent value="linking" className="p-6">
                 <LinkingSection 
                   key={`linking-${productId}`}
                   formState={formState}
                   updateFormState={handleFormChange}
                   categories={categories}
                 />
               </TabsContent>
              <TabsContent value="promotion" className="p-6">
                 <PromotionSection 
                   key={`promo-${productId}`}
                   formState={formState}
                   updateFormState={handleFormChange}
                 />
              </TabsContent>
              <TabsContent value="popup" className="p-6">
                 <PopupNotificationSection 
                   key={`popup-${productId}`}
                   formState={formState}
                   updateFormState={handleFormChange}
                 />
              </TabsContent>
              <TabsContent value="status" className="p-6">
                   <StatusSection 
                       key={`status-${productId}`}
                       formState={{ status: formState.status || 'ACTIVE' }}
                       updateFormState={(data: { status: 'ACTIVE' | 'INACTIVE' }) => handleFormChange({ status: data.status })}
                   />
               </TabsContent>
              <TabsContent value="customCode" className="p-6">
                 <CustomCodeSection 
                   key={`custom-${productId}`}
                   formState={formState}
                   updateFormState={handleFormChange}
                 />
              </TabsContent>
            </Card>
          </Tabs>
        </div>
        
        <div className="mt-6 flex justify-end">
           <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={saving || loading}>
             {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             <Save className="mr-2 h-4 w-4" />
             Lưu Thay Đổi
           </Button>
        </div>
      </form>
    </div>
  );
} 