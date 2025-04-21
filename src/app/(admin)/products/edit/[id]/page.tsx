'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { productApi, categoryApi, Category } from "@/services/api";

// Import các section components
import OverviewSection from "../../create/components/sections/OverviewSection";
import PopupNotificationSection from "../../create/components/sections/PopupNotificationSection";
import ProductDataSection from "../../create/components/sections/ProductDataSection";
import LinkingSection from "../../create/components/sections/LinkingSection";
import PromotionSection from "../../create/components/sections/PromotionSection";
import CustomCodeSection from "../../create/components/sections/CustomCodeSection";

interface FormState {
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
  
  // Popup notification section
  enablePopup: boolean;
  popupTitle: string;
  popupContent: string;
  
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
  
  // Linking section
  productCategory: string;
  relatedProducts: string[];
  additionalRequirements: string[];
  
  // Promotion section
  promotionPrice: number;
  promotionStartDate: string | null;
  promotionEndDate: string | null;
  promotionQuantity: number;
  
  // Custom code section
  customHtmlHead: string;
  customHtmlBody: string;

  slug: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formState, setFormState] = React.useState<FormState>({
    // Overview section
    gameCode: "",
    analyticsCode: "",
    productName: "",
    requirePhoneNumber: false,
    shortSummary: "",
    fullDescription: "",
    warrantyPolicy: "",
    faq: "",
    metaTitle: "",
    metaDescription: "",
    mainKeyword: "",
    secondaryKeywords: [],
    tags: [],
    
    // Popup notification section
    enablePopup: false,
    popupTitle: "",
    popupContent: "",
    
    // Product data section
    guideUrl: "",
    imageUrl: "",
    originalPrice: 0,
    importPrice: 0,
    importSource: "",
    quantity: 0,
    autoSyncQuantity: false,
    minQuantity: 1,
    maxQuantity: 0,
    autoDeliverKey: true,
    showReadMore: false,
    enablePromotion: false,
    lowStockThreshold: 5,
    gameKeyDisplayText: "",
    instructionalText: "",
    expiryDays: 30,
    allowComments: true,
    
    // Linking section
    productCategory: "",
    relatedProducts: [],
    additionalRequirements: [],
    
    // Promotion section
    promotionPrice: 0,
    promotionStartDate: null,
    promotionEndDate: null,
    promotionQuantity: 0,
    
    // Custom code section
    customHtmlHead: "",
    customHtmlBody: "",
    
    slug: "",
    status: 'ACTIVE',
  });

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Promise.all now returns [ApiResponse<Product>, ApiResponse<Category[]>] 
      const [productResponse, categoriesResponse] = await Promise.all([
        productApi.getById(id),
        categoryApi.getAllAdmin()
      ]);
      
      console.log('Product API response:', productResponse);
      console.log('Categories API response:', categoriesResponse);
      
      // Check if API calls were successful before accessing data
      if (!productResponse?.success || !categoriesResponse?.success) {
          const errorMsg = productResponse?.message || categoriesResponse?.message || 'Lỗi không xác định từ API.';
          console.error("API call failed:", errorMsg);
          toast.error(`Không thể tải dữ liệu: ${errorMsg}`);
          setLoading(false);
          return;
      }
      
      // Access data correctly using response.data
      const actualProductData = productResponse.data;
      const validCategories = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [];
      
      setCategories(validCategories);
      
      // Check if actualProductData exists (should be guaranteed by success check, but good practice)
      if (!actualProductData) {
          console.error("Product data is unexpectedly missing after success check");
          toast.error('Dữ liệu sản phẩm trả về không hợp lệ (sau kiểm tra thành công).');
          setLoading(false);
          return;
      }
      
      // Set form state using actualProductData
      setFormState({
        // Overview section
        gameCode: actualProductData.gameCode || "",
        analyticsCode: actualProductData.analyticsCode || "",
        productName: actualProductData.name || "",
        requirePhoneNumber: actualProductData.requirePhone || false,
        shortSummary: actualProductData.shortDescription || "",
        fullDescription: actualProductData.description || "",
        warrantyPolicy: actualProductData.warrantyPolicy || "",
        faq: actualProductData.faq || "",
        metaTitle: actualProductData.metaTitle || "",
        metaDescription: actualProductData.metaDescription || "",
        mainKeyword: actualProductData.mainKeyword || "",
        secondaryKeywords: actualProductData.secondaryKeywords || [],
        tags: actualProductData.tags || [],
        
        // Popup notification section
        enablePopup: actualProductData.popupEnabled || false,
        popupTitle: actualProductData.popupTitle || "",
        popupContent: actualProductData.popupContent || "",
        
        // Product data section
        guideUrl: actualProductData.guideUrl || "",
        imageUrl: actualProductData.imageUrl || "",
        originalPrice: actualProductData.originalPrice || 0,
        importPrice: actualProductData.importPrice || 0,
        importSource: actualProductData.importSource || "",
        quantity: actualProductData.quantity || 0,
        autoSyncQuantity: actualProductData.autoSyncQuantityWithKey || false,
        minQuantity: actualProductData.minPerOrder || 1,
        maxQuantity: actualProductData.maxPerOrder === null ? 0 : (actualProductData.maxPerOrder || 0),
        autoDeliverKey: actualProductData.autoDeliverKey || true,
        showReadMore: actualProductData.showMoreDescription || false,
        enablePromotion: actualProductData.promotionEnabled || false,
        lowStockThreshold: actualProductData.lowStockWarning || 5,
        gameKeyDisplayText: actualProductData.gameKeyText || "",
        instructionalText: actualProductData.guideText || "",
        expiryDays: actualProductData.expiryDays || 30,
        allowComments: actualProductData.allowComment || true,
        
        // Linking section
        productCategory: actualProductData.categoryId || "",
        relatedProducts: [],
        additionalRequirements: actualProductData.additionalRequirementIds || [],
        
        // Promotion section
        promotionPrice: actualProductData.promotionPrice === null ? 0 : (actualProductData.promotionPrice || 0),
        promotionStartDate: actualProductData.promotionStartDate || null,
        promotionEndDate: actualProductData.promotionEndDate || null,
        promotionQuantity: actualProductData.promotionQuantity === null ? 0 : (actualProductData.promotionQuantity || 0),
        
        // Custom code section
        customHtmlHead: actualProductData.customHeadCode || "",
        customHtmlBody: actualProductData.customBodyCode || "",
        
        slug: actualProductData.slug || "",
        status: actualProductData.status || 'ACTIVE',
      });
    } catch (error) {
      console.error('Error loading initial data:', error);
      // Display error message from the caught error if available
      const errorMsg = (error as any)?.response?.data?.message || (error as Error)?.message || 'Lỗi không xác định';
      toast.error(`Không thể tải thông tin: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Xử lý định dạng ngày tháng cho promotionStartDate và promotionEndDate
      const formatDateForApi = (dateString: string | null) => {
        if (!dateString) return null;
        // Chuyển đổi từ định dạng datetime-local sang ISO string
        return new Date(dateString).toISOString();
      };
      
      // Chuẩn bị dữ liệu để gửi lên API theo cấu trúc trong API.md
      const productData = {
        name: formState.productName,
        slug: formState.slug,
        gameCode: formState.gameCode,
        analyticsCode: formState.analyticsCode,
        requirePhone: formState.requirePhoneNumber,
        
        shortDescription: formState.shortSummary,
        description: formState.fullDescription,
        warrantyPolicy: formState.warrantyPolicy,
        faq: formState.faq,
        
        metaTitle: formState.metaTitle,
        metaDescription: formState.metaDescription,
        mainKeyword: formState.mainKeyword,
        secondaryKeywords: formState.secondaryKeywords,
        tags: formState.tags,
        
        popupEnabled: formState.enablePopup,
        popupTitle: formState.popupTitle,
        popupContent: formState.popupContent,
        
        guideUrl: formState.guideUrl,
        imageUrl: formState.imageUrl,
        originalPrice: formState.originalPrice,
        importPrice: formState.importPrice,
        importSource: formState.importSource,
        quantity: formState.quantity,
        autoSyncQuantityWithKey: formState.autoSyncQuantity,
        minPerOrder: formState.minQuantity,
        maxPerOrder: formState.maxQuantity ? formState.maxQuantity : 10,
        autoDeliverKey: formState.autoDeliverKey,
        showMoreDescription: formState.showReadMore,
        promotionEnabled: formState.enablePromotion,
        lowStockWarning: formState.lowStockThreshold,
        gameKeyText: formState.gameKeyDisplayText,
        guideText: formState.instructionalText,
        expiryDays: formState.expiryDays,
        allowComment: formState.allowComments,
        
        promotionPrice: formState.promotionPrice || null,
        promotionStartDate: formatDateForApi(formState.promotionStartDate),
        promotionEndDate: formatDateForApi(formState.promotionEndDate),
        promotionQuantity: formState.promotionQuantity || null,
        
        categoryId: formState.productCategory || null,
        additionalRequirementIds: formState.additionalRequirements,
        
        customHeadCode: formState.customHtmlHead,
        customBodyCode: formState.customHtmlBody,

        status: formState.status,
      };
      
      console.log('Sending product data to API:', productData);
      await productApi.update(id, productData);
      
      toast.success("Cập nhật sản phẩm thành công!");
      router.push('/products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Không thể cập nhật sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  const updateFormState = useCallback((data: Partial<typeof formState>) => {
    setFormState(prev => ({
      ...prev,
      ...data
    }));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Sửa Sản Phẩm</h1>
        <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Lưu Thay Đổi
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <Card className="mb-4">
              <TabsList className="flex flex-wrap w-full bg-gray-100 p-1 gap-1">
                <TabsTrigger value="overview" className="whitespace-nowrap flex-grow">Tổng Quan</TabsTrigger>
                <TabsTrigger value="product-data" className="whitespace-nowrap flex-grow">Dữ Liệu Sản Phẩm</TabsTrigger>
                <TabsTrigger value="promotion" className="whitespace-nowrap flex-grow">Khuyến Mãi</TabsTrigger>
                <TabsTrigger value="linking" className="whitespace-nowrap flex-grow">Liên Kết</TabsTrigger>
                <TabsTrigger value="popup" className="whitespace-nowrap flex-grow">Thông Báo</TabsTrigger>
                <TabsTrigger value="custom-code" className="whitespace-nowrap flex-grow">Mã Tùy Chỉnh</TabsTrigger>
              </TabsList>
            </Card>

            <TabsContent value="overview">
              <OverviewSection 
                formState={formState} 
                updateFormState={(data: Partial<FormState>) => {
                    setFormState(prevState => ({ ...prevState, ...data }));
                }}
              />
            </TabsContent>

            <TabsContent value="product-data">
              <ProductDataSection 
                formState={formState} 
                updateFormState={(data: Partial<FormState>) => {
                    setFormState(prevState => ({ ...prevState, ...data }));
                }}
              />
            </TabsContent>

            <TabsContent value="promotion">
              <PromotionSection 
                formState={formState} 
                updateFormState={(data: Partial<FormState>) => {
                    setFormState(prevState => ({ ...prevState, ...data }));
                }}
              />
            </TabsContent>

            <TabsContent value="linking">
              <LinkingSection 
                formState={formState} 
                categories={categories}
                updateFormState={(data: Partial<FormState>) => {
                    setFormState(prevState => ({ ...prevState, ...data }));
                }}
              />
            </TabsContent>

            <TabsContent value="popup">
              <PopupNotificationSection 
                formState={formState} 
                updateFormState={(data: Partial<FormState>) => {
                    setFormState(prevState => ({ ...prevState, ...data }));
                }}
              />
            </TabsContent>

            <TabsContent value="custom-code">
              <CustomCodeSection 
                formState={formState} 
                updateFormState={(data: Partial<FormState>) => {
                    setFormState(prevState => ({ ...prevState, ...data }));
                }}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-8">
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Lưu Thay Đổi
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
} 