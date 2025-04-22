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

interface OverviewData {
  // Overview section
  gameCode: string;
  analyticsCode: string;
  productName: string;
  requirePhoneNumber: boolean;
  shortSummary: string;
  fullDescription: string;
  warrantyPolicy: string;
  faq: string;
  metaTitle: string;
  metaDescription: string;
  mainKeyword: string;
  secondaryKeywords: string[];
  tags: string[];
}

interface PopupNotificationData {
  // Popup notification section
  enablePopup: boolean;
  popupTitle: string;
  popupContent: string;
}

interface ProductDataSectionData {
  // Product data section
  guideUrl: string;
  imageUrl: string;
  originalPrice: number;
  importPrice: number;
  importSource: string;
  quantity: number;
  autoSyncQuantity: boolean;
  minQuantity: number;
  maxQuantity: number;
  autoDeliverKey: boolean;
  showReadMore: boolean;
  enablePromotion: boolean;
  lowStockThreshold: number;
  gameKeyDisplayText: string;
  instructionalText: string;
  expiryDays: number;
  allowComments: boolean;
}

interface LinkingSectionData {
  // Linking section
  productCategory: string;
  relatedProducts: string[];
  additionalRequirements: string[];
}

interface PromotionSectionData {
  // Promotion section
  promotionPrice: number;
  promotionStartDate: string | null;
  promotionEndDate: string | null;
  promotionQuantity: number;
}

interface CustomCodeSectionData {
  // Custom code section
  customHtmlHead: string;
  customHtmlBody: string;
}

interface StatusData {
  status: 'ACTIVE' | 'INACTIVE';
}

interface FormState extends Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'category'>> {
  // Add fields that might not directly map or need special handling if any
}

// Define a shared type for the form update callback
type FormUpdateCallback = (updatedData: Partial<FormState>) => void;

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

        setFormState({
          name: actualProductData.name,
          slug: actualProductData.slug,
          gameCode: actualProductData.gameCode,
          analyticsCode: actualProductData.analyticsCode,
          requirePhone: actualProductData.requirePhone,
          shortDescription: actualProductData.shortDescription,
          description: actualProductData.description,
          warrantyPolicy: actualProductData.warrantyPolicy,
          faq: actualProductData.faq,
          metaTitle: actualProductData.metaTitle,
          metaDescription: actualProductData.metaDescription,
          mainKeyword: actualProductData.mainKeyword,
          secondaryKeywords: actualProductData.secondaryKeywords,
          tags: actualProductData.tags,
          popupEnabled: actualProductData.popupEnabled,
          popupTitle: actualProductData.popupTitle,
          popupContent: actualProductData.popupContent,
          guideUrl: actualProductData.guideUrl,
          imageUrl: actualProductData.imageUrl,
          originalPrice: actualProductData.originalPrice,
          importPrice: actualProductData.importPrice,
          importSource: actualProductData.importSource,
          quantity: actualProductData.quantity,
          autoSyncQuantityWithKey: actualProductData.autoSyncQuantityWithKey,
          minPerOrder: actualProductData.minPerOrder,
          maxPerOrder: actualProductData.maxPerOrder,
          autoDeliverKey: actualProductData.autoDeliverKey,
          showMoreDescription: actualProductData.showMoreDescription,
          promotionEnabled: actualProductData.promotionEnabled,
          lowStockWarning: actualProductData.lowStockWarning,
          gameKeyText: actualProductData.gameKeyText,
          guideText: actualProductData.guideText,
          expiryDays: actualProductData.expiryDays,
          allowComment: actualProductData.allowComment,
          promotionPrice: actualProductData.promotionPrice,
          promotionStartDate: actualProductData.promotionStartDate,
          promotionEndDate: actualProductData.promotionEndDate,
          promotionQuantity: actualProductData.promotionQuantity,
          categoryId: actualProductData.categoryId,
          additionalRequirementIds: actualProductData.additionalRequirementIds,
          customHeadCode: actualProductData.customHeadCode,
          customBodyCode: actualProductData.customBodyCode,
          status: actualProductData.status,
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
  const handleFormChange = useCallback((updatedData: Partial<FormState>) => {
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
      name: formState.name,
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
      originalPrice: Number(formState.originalPrice) || 0,
      importPrice: Number(formState.importPrice) || 0,
      importSource: formState.importSource,
      quantity: Number(formState.quantity) || 0,
      autoSyncQuantityWithKey: formState.autoSyncQuantityWithKey,
      minPerOrder: Number(formState.minPerOrder) || 1,
      maxPerOrder: formState.maxPerOrder === null ? null : (Number(formState.maxPerOrder) || null),
      autoDeliverKey: formState.autoDeliverKey,
      showMoreDescription: formState.showMoreDescription,
      promotionEnabled: formState.promotionEnabled,
      lowStockWarning: Number(formState.lowStockWarning) || 0,
      gameKeyText: formState.gameKeyText,
      guideText: formState.guideText,
      expiryDays: Number(formState.expiryDays) || 0,
      allowComment: formState.allowComment,
      promotionPrice: formState.promotionPrice === null ? null : (Number(formState.promotionPrice) || null),
      promotionStartDate: formatDateForApi(formState.promotionStartDate),
      promotionEndDate: formatDateForApi(formState.promotionEndDate),
      promotionQuantity: formState.promotionQuantity === null ? null : (Number(formState.promotionQuantity) || null),
      categoryId: formState.categoryId || null,
      additionalRequirementIds: formState.additionalRequirementIds,
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
                formState={formState as any}
                updateFormState={handleFormChange}
              />
            </TabsContent>
            <TabsContent value="data" className="p-6">
               <ProductDataSection 
                 formState={formState as any}
                 updateFormState={handleFormChange}
               />
            </TabsContent>
             <TabsContent value="linking" className="p-6">
               <LinkingSection 
                 formState={formState as any}
                 updateFormState={handleFormChange}
                 categories={categories}
               />
             </TabsContent>
            <TabsContent value="promotion" className="p-6">
               <PromotionSection 
                 formState={formState as any}
                 updateFormState={handleFormChange}
               />
            </TabsContent>
            <TabsContent value="popup" className="p-6">
               <PopupNotificationSection 
                 formState={formState as any}
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
                 formState={formState as any}
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