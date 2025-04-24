'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { productApi, categoryApi, Category, Product } from "@/services/api";
import Link from 'next/link';

// Import shared types
import { FormState, FormUpdateCallback } from '@/types/productForm';

// Import các section components
import OverviewSection from "./components/sections/OverviewSection";
import PopupNotificationSection from "./components/sections/PopupNotificationSection";
import ProductDataSection from "./components/sections/ProductDataSection";
import LinkingSection from "./components/sections/LinkingSection";
import PromotionSection from "./components/sections/PromotionSection";
import CustomCodeSection from "./components/sections/CustomCodeSection";

// Helper function to generate slug
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/ /g, '-') // Replace spaces with hyphens
    .replace(/[^\w-]+/g, ''); // Remove all non-word chars except hyphens
};

const CreateProductPage = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = React.useState<FormState>({
    // Initialize state according to the SHARED FormState
    // Use '' for fields allowing empty string, null for nullable fields
    gameCode: "",
    analyticsCode: "",
    productName: "", // Changed from name
    requirePhone: false,
    shortDescription: "",
    description: "",
    warrantyPolicy: "",
    faq: "",
    guideUrl: "",
    imageUrl: "",
    originalPrice: '', 
    importPrice: '',
    salePrice: '', // Added
    stockQuantity: '', // Added
    categoryId: null,
    popupEnabled: false,
    metaTitle: "",
    metaDescription: "",
    mainKeyword: "",
    secondaryKeywords: [],
    tags: [],
    promotionEnabled: true, // default from previous create state
    promotionStartDate: null,
    promotionEndDate: null,
    promotionDiscount: '', // Added
    promotionType: 'percentage', // Added
    promotionPrice: '',
    promotionQuantity: '',
    relatedProducts: [], // Added
    additionalRequirementIds: [], // Changed name
    popupTitle: "",
    popupContent: "",
    popupButtonText: "", // Added
    popupButtonLink: "", // Added
    customHeadCode: "",
    customBodyCode: "",
    importSource: "",
    quantity: '',
    autoSyncQuantityWithKey: false, // Changed name
    minPerOrder: '', // Changed name
    maxPerOrder: '', // Changed name
    autoDeliverKey: false,
    showMoreDescription: false, // Changed name
    lowStockWarning: '', // Changed name
    gameKeyText: "", // Changed name
    guideText: "", // Changed name
    expiryDays: '',
    allowComment: false, // Changed name
    status: 'ACTIVE',
    slug: "",
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Assume the API response structure is { data: Category[] }
        const response = await categoryApi.getAllAdmin(); 
        // Check if response and response.data exist and is an array
        if (response && Array.isArray((response as any).data)) {
          setCategories((response as any).data);
        } else {
          console.warn("Unexpected format for categories data or empty data:", response);
          setCategories([]); // Set to empty array on unexpected format or no data
        }
      } catch (error) {
        console.error("Error loading categories:", error);
        toast.error("Không thể tải danh mục.");
        setCategories([]); // Set to empty array on error
      }
    };
    loadCategories();
  }, []);

  // Keep helper functions for number conversion
  const toNumberOrUndefined = (value: number | string | null | undefined): number | undefined => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  };
    
  const toNumberOrDefault = (value: number | string | null | undefined, defaultValue: number): number => {
    if (value === '' || value === null || value === undefined) {
      return defaultValue;
    }
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const formatDateForApi = (dateString: string | null | undefined): string | null => {
      if (!dateString) return null;
      try {
        return new Date(dateString).toISOString();
      } catch (error) {
        console.error("Invalid date format:", dateString);
        return null; // Handle invalid date strings gracefully
      }
    };
    const autoGeneratedSlug = formState.slug || generateSlug(formState.productName || 'temp-product');

    // Adjust payload creation based on the SHARED FormState names
    const productData = { // Type inference might be sufficient now
        name: formState.productName || undefined,
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
        originalPrice: toNumberOrDefault(formState.originalPrice, 0),
        importPrice: toNumberOrUndefined(formState.importPrice),
        importSource: formState.importSource || undefined,
        quantity: toNumberOrDefault(formState.quantity, 0),
        autoSyncQuantityWithKey: formState.autoSyncQuantityWithKey ?? false,
        minPerOrder: toNumberOrDefault(formState.minPerOrder, 1),
        maxPerOrder: toNumberOrUndefined(formState.maxPerOrder),
        autoDeliverKey: formState.autoDeliverKey ?? false,
        showMoreDescription: formState.showMoreDescription ?? false,
        promotionEnabled: formState.promotionEnabled ?? false,
        lowStockWarning: toNumberOrUndefined(formState.lowStockWarning),
        gameKeyText: formState.gameKeyText || undefined,
        guideText: formState.guideText || undefined,
        expiryDays: toNumberOrUndefined(formState.expiryDays),
        allowComment: formState.allowComment ?? false,
        promotionPrice: toNumberOrUndefined(formState.promotionPrice),
        promotionStartDate: formatDateForApi(formState.promotionStartDate),
        promotionEndDate: formatDateForApi(formState.promotionEndDate),
        promotionQuantity: toNumberOrUndefined(formState.promotionQuantity),
        categoryId: formState.categoryId || null,
        customHeadCode: formState.customHeadCode || undefined,
        customBodyCode: formState.customBodyCode || undefined,
        status: formState.status ?? 'ACTIVE',
        // Include fields added for consistency if needed by API
        salePrice: toNumberOrUndefined(formState.salePrice),
        promotionDiscount: toNumberOrUndefined(formState.promotionDiscount),
        promotionType: formState.promotionType || undefined,
        popupButtonText: formState.popupButtonText || undefined,
        popupButtonLink: formState.popupButtonLink || undefined,
        relatedProducts: formState.relatedProducts?.length ? formState.relatedProducts : undefined,
    };

    const finalPayload = { 
      ...productData,
      slug: autoGeneratedSlug,
      additionalRequirementIds: formState.additionalRequirementIds?.length ? formState.additionalRequirementIds : undefined,
    };

    // Remove undefined keys - this logic is fine
    Object.keys(finalPayload).forEach(key => {
      const typedKey = key as keyof typeof finalPayload;
      if (finalPayload[typedKey] === undefined) {
        delete finalPayload[typedKey];
      }
    });

    try {
      console.log("Submitting new product data:", finalPayload);
      const createdProduct = await productApi.create(finalPayload as any); // Keep 'as any' for now if API type is complex
      
      toast.success("Tạo sản phẩm thành công!");
      router.push('/products'); // Use correct redirect path

    } catch (error) {
      console.error('Error creating product:', error);
      // Provide more specific error message if possible
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Không thể tạo sản phẩm: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const updateFormState: FormUpdateCallback = useCallback((data) => {
    // Check if productName is being updated to regenerate slug
    if ('productName' in data && data.productName !== formState.productName) {
      const newSlug = generateSlug(data.productName || '');
      setFormState(prev => ({
        ...prev,
        ...data,
        slug: newSlug // Update slug automatically
      }));
    } else {
      setFormState(prev => ({
        ...prev,
        ...data
      }));
    }
  }, [formState.productName]); // Add productName to dependency array

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Link href="/products" passHref>
             <Button variant="outline" size="icon" aria-label="Go back to products">
               <ArrowLeft className="h-4 w-4" />
             </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Thêm Sản Phẩm</h1>
        </div>
        <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Tạo Sản Phẩm
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
              Tạo Sản Phẩm
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProductPage; 