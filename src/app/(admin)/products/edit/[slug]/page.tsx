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

// Define the canonical FormState based on API Product type + form needs
export interface FormState {
  name?: string;
  slug?: string;
  gameCode?: string;
  analyticsCode?: string;
  requirePhone?: boolean;
  shortDescription?: string;
  description?: string; // For Rich Text Editor
  warrantyPolicy?: string; // For Rich Text Editor
  faq?: string; // For Rich Text Editor
  metaTitle?: string;
  metaDescription?: string;
  mainKeyword?: string;
  secondaryKeywords?: string[];
  tags?: string[];
  popupEnabled?: boolean;
  popupTitle?: string;
  popupContent?: string;
  guideUrl?: string;
  imageUrl?: string;
  originalPrice?: number | ''; // Allow empty string for input
  importPrice?: number | '';   // Allow empty string for input
  importSource?: string;
  quantity?: number | '';     // Allow empty string for input
  autoSyncQuantityWithKey?: boolean;
  minPerOrder?: number | '';    // Allow empty string for input
  maxPerOrder?: number | null | ''; // Allow null and empty string
  autoDeliverKey?: boolean;
  showMoreDescription?: boolean;
  promotionEnabled?: boolean;
  lowStockWarning?: number | null | ''; // Allow null and empty string
  gameKeyText?: string;
  guideText?: string; // For Rich Text Editor
  expiryDays?: number | null | ''; // Allow null and empty string
  allowComment?: boolean;
  promotionPrice?: number | null | ''; // Allow null and empty string
  promotionStartDate?: string | null; // Date string or null
  promotionEndDate?: string | null;   // Date string or null
  promotionQuantity?: number | null | ''; // Allow null and empty string
  categoryId?: string | null; // Allow null
  additionalRequirementIds?: string[];
  customHeadCode?: string;
  customBodyCode?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// Re-define StatusData locally as it was removed
interface StatusData {
  status: 'ACTIVE' | 'INACTIVE';
}

// Define a shared type for the form update callback
export type FormUpdateCallback = (updatedData: Partial<FormState>) => void;

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
          name: actualProductData.name ?? '',
          slug: actualProductData.slug ?? '',
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
          secondaryKeywords: actualProductData.secondaryKeywords ?? [],
          tags: actualProductData.tags ?? [],
          popupEnabled: actualProductData.popupEnabled ?? false,
          popupTitle: actualProductData.popupTitle ?? '',
          popupContent: actualProductData.popupContent ?? '',
          guideUrl: actualProductData.guideUrl ?? '',
          imageUrl: actualProductData.imageUrl ?? '',
          originalPrice: actualProductData.originalPrice ?? '',
          importPrice: actualProductData.importPrice ?? '',
          importSource: actualProductData.importSource ?? '',
          quantity: actualProductData.quantity ?? '',
          autoSyncQuantityWithKey: actualProductData.autoSyncQuantityWithKey ?? false,
          minPerOrder: actualProductData.minPerOrder ?? '',
          maxPerOrder: actualProductData.maxPerOrder ?? '',
          autoDeliverKey: actualProductData.autoDeliverKey ?? false,
          showMoreDescription: actualProductData.showMoreDescription ?? false,
          promotionEnabled: actualProductData.promotionEnabled ?? false,
          lowStockWarning: actualProductData.lowStockWarning ?? '',
          gameKeyText: actualProductData.gameKeyText ?? '',
          guideText: actualProductData.guideText ?? '',
          expiryDays: actualProductData.expiryDays ?? '',
          allowComment: actualProductData.allowComment ?? false,
          promotionPrice: actualProductData.promotionPrice ?? '',
          promotionStartDate: actualProductData.promotionStartDate,
          promotionEndDate: actualProductData.promotionEndDate,
          promotionQuantity: actualProductData.promotionQuantity ?? '',
          categoryId: actualProductData.categoryId ?? null,
          additionalRequirementIds: actualProductData.additionalRequirementIds ?? [],
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

  // Handle form updates from child components using a single handler
  const handleFormChange: FormUpdateCallback = useCallback((updatedData) => {
    setFormState((prev) => ({ ...prev, ...updatedData }));
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
      name: formState.name || undefined,
      gameCode: formState.gameCode || undefined,
      analyticsCode: formState.analyticsCode || undefined,
      requirePhone: formState.requirePhone ?? false,
      shortDescription: formState.shortDescription || undefined,
      description: formState.description || undefined,
      warrantyPolicy: formState.warrantyPolicy || undefined,
      faq: formState.faq || undefined,
      metaTitle: formState.metaTitle || undefined,
      metaDescription: formState.metaDescription || undefined,
      mainKeyword: formState.mainKeyword || undefined,
      secondaryKeywords: formState.secondaryKeywords?.length ? formState.secondaryKeywords : undefined,
      tags: formState.tags?.length ? formState.tags : undefined,
      popupEnabled: formState.popupEnabled ?? false,
      popupTitle: formState.popupTitle || undefined,
      popupContent: formState.popupContent || undefined,
      guideUrl: formState.guideUrl || undefined,
      imageUrl: formState.imageUrl || undefined,
      originalPrice: Number(formState.originalPrice) || 0,
      importPrice: Number(formState.importPrice) || 0,
      importSource: formState.importSource || undefined,
      quantity: Number(formState.quantity) || 0,
      autoSyncQuantityWithKey: formState.autoSyncQuantityWithKey ?? false,
      minPerOrder: Number(formState.minPerOrder) || 1,
      maxPerOrder: formState.maxPerOrder === '' ? undefined : Number(formState.maxPerOrder) || undefined,
      autoDeliverKey: formState.autoDeliverKey ?? false,
      showMoreDescription: formState.showMoreDescription ?? false,
      promotionEnabled: formState.promotionEnabled ?? false,
      lowStockWarning: formState.lowStockWarning === '' ? undefined : Number(formState.lowStockWarning) || undefined,
      gameKeyText: formState.gameKeyText || undefined,
      guideText: formState.guideText || undefined,
      expiryDays: formState.expiryDays === '' ? undefined : Number(formState.expiryDays) || undefined,
      allowComment: formState.allowComment ?? false,
      promotionPrice: formState.promotionPrice === '' ? undefined : Number(formState.promotionPrice) || undefined,
      promotionStartDate: formatDateForApi(formState.promotionStartDate),
      promotionEndDate: formatDateForApi(formState.promotionEndDate),
      promotionQuantity: formState.promotionQuantity === '' ? undefined : Number(formState.promotionQuantity) || undefined,
      categoryId: formState.categoryId || null,
      additionalRequirementIds: formState.additionalRequirementIds?.length ? formState.additionalRequirementIds : undefined,
      customHeadCode: formState.customHeadCode || undefined,
      customBodyCode: formState.customBodyCode || undefined,
      status: formState.status ?? 'INACTIVE',
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
    <div className="container mx-auto py-6 px-4 md:px-6 lg:px-8 max-w-5xl">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link href="/admin/products">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Chỉnh sửa sản phẩm: {formState.name || slug}</h1>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>

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
                key={productId || 'loading'}
                formState={formState}
                updateFormState={handleFormChange}
              />
            </TabsContent>
            <TabsContent value="data" className="p-6">
               <ProductDataSection 
                 formState={formState}
                 updateFormState={handleFormChange}
               />
            </TabsContent>
             <TabsContent value="linking" className="p-6">
               <LinkingSection 
                 formState={formState}
                 updateFormState={handleFormChange}
                 categories={categories}
               />
             </TabsContent>
            <TabsContent value="promotion" className="p-6">
               <PromotionSection 
                 key={`promo-${productId || 'loading'}`}
                 formState={formState}
                 updateFormState={handleFormChange}
               />
            </TabsContent>
            <TabsContent value="popup" className="p-6">
               <PopupNotificationSection 
                 formState={formState}
                 updateFormState={handleFormChange}
               />
            </TabsContent>
            <TabsContent value="status" className="p-6">
                 <StatusSection 
                     formState={{ status: formState.status || 'ACTIVE' }}
                     updateFormState={(data: StatusData) => handleFormChange({ status: data.status })}
                 />
             </TabsContent>
            <TabsContent value="customCode" className="p-6">
               <CustomCodeSection 
                 formState={formState}
                 updateFormState={handleFormChange}
               />
            </TabsContent>
          </Card>
        </Tabs>
        
        <div className="mt-6 flex justify-end">
           <Button type="submit" disabled={saving}>
             {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
             {saving ? "Đang lưu..." : "Lưu thay đổi"}
           </Button>
        </div>
      </form>
    </div>
  );
} 