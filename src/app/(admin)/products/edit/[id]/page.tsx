'use client';

import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [productData, fetchedCategories] = await Promise.all([
          productApi.getById(id),
          categoryApi.getAllAdmin()
        ]);
        
        console.log('Product data from server:', productData);
        console.log('Categories from server:', fetchedCategories);
        
        setCategories(fetchedCategories);
        
        setFormState({
          // Overview section
          gameCode: productData.gameCode || "",
          analyticsCode: productData.analyticsCode || "",
          productName: productData.name || "",
          requirePhoneNumber: productData.requirePhone || false,
          shortSummary: productData.shortDescription || "",
          fullDescription: productData.description || "",
          warrantyPolicy: productData.warrantyPolicy || "",
          faq: productData.faq || "",
          metaTitle: productData.metaTitle || "",
          metaDescription: productData.metaDescription || "",
          mainKeyword: productData.mainKeyword || "",
          secondaryKeywords: productData.secondaryKeywords || [],
          tags: productData.tags || [],
          
          // Popup notification section
          enablePopup: productData.popupEnabled || false,
          popupTitle: productData.popupTitle || "",
          popupContent: productData.popupContent || "",
          
          // Product data section
          guideUrl: productData.guideUrl || "",
          imageUrl: productData.imageUrl || "",
          originalPrice: productData.originalPrice || 0,
          importPrice: productData.importPrice || 0,
          importSource: productData.importSource || "",
          quantity: productData.quantity || 0,
          autoSyncQuantity: productData.autoSyncQuantityWithKey || false,
          minQuantity: productData.minPerOrder || 1,
          maxQuantity: productData.maxPerOrder || 0,
          autoDeliverKey: productData.autoDeliverKey || true,
          showReadMore: productData.showMoreDescription || false,
          enablePromotion: productData.promotionEnabled || false,
          lowStockThreshold: productData.lowStockWarning || 5,
          gameKeyDisplayText: productData.gameKeyText || "",
          instructionalText: productData.guideText || "",
          expiryDays: productData.expiryDays || 30,
          allowComments: productData.allowComment || true,
          
          // Linking section
          productCategory: productData.categoryId || "",
          relatedProducts: [],
          additionalRequirements: productData.additionalRequirementIds || [],
          
          // Promotion section
          promotionPrice: productData.promotionPrice || 0,
          promotionStartDate: productData.promotionStartDate || null,
          promotionEndDate: productData.promotionEndDate || null,
          promotionQuantity: productData.promotionQuantity || 0,
          
          // Custom code section
          customHtmlHead: productData.customHeadCode || "",
          customHtmlBody: productData.customBodyCode || "",
          
          slug: productData.slug || "",
          status: productData.status || 'ACTIVE',
        });
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Không thể tải thông tin sản phẩm hoặc danh mục');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [id]);

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
        maxPerOrder: formState.maxQuantity || null,
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

  const updateFormState = (data: Partial<typeof formState>) => {
    setFormState(prev => ({
      ...prev,
      ...data
    }));
  };

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
                updateFormState={updateFormState} 
              />
            </TabsContent>

            <TabsContent value="product-data">
              <ProductDataSection 
                formState={formState} 
                updateFormState={updateFormState} 
              />
            </TabsContent>

            <TabsContent value="promotion">
              <PromotionSection 
                formState={formState} 
                updateFormState={updateFormState} 
              />
            </TabsContent>

            <TabsContent value="linking">
              <LinkingSection 
                formState={formState} 
                updateFormState={updateFormState} 
                categories={categories}
              />
            </TabsContent>

            <TabsContent value="popup">
              <PopupNotificationSection 
                formState={formState} 
                updateFormState={updateFormState} 
              />
            </TabsContent>

            <TabsContent value="custom-code">
              <CustomCodeSection 
                formState={formState} 
                updateFormState={updateFormState} 
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