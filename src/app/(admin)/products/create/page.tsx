'use client';

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { categoryApi, Category } from "@/services/api";

// Import các section components
import OverviewSection from "./components/sections/OverviewSection";
import PopupNotificationSection from "./components/sections/PopupNotificationSection";
import ProductDataSection from "./components/sections/ProductDataSection";
import LinkingSection from "./components/sections/LinkingSection";
import PromotionSection from "./components/sections/PromotionSection";
import CustomCodeSection from "./components/sections/CustomCodeSection";

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
  guideUrl: string;
  imageUrl: string;
  originalPrice: number;
  importPrice: number;
  salePrice: number;
  stockQuantity: number;
  productCategory: string;
  enablePopup: boolean;

  // SEO section
  metaTitle: string;
  metaDescription: string;
  mainKeyword: string;
  primaryKeywords: string[];
  secondaryKeywords: string[];
  tags: string[];

  // Promotion section
  promotionStartDate: string | null;
  promotionEndDate: string | null;
  promotionDiscount: number;
  promotionType: 'percentage' | 'fixed';
  promotionPrice: number;
  promotionQuantity: number;

  // Linking section
  relatedProducts: string[];
  additionalRequirements: string[];

  // Popup section
  popupTitle: string;
  popupContent: string;
  popupButtonText: string;
  popupButtonLink: string;

  // Custom code section
  customHtmlHead: string;
  customHtmlBody: string;

  slug: string;
  status: 'ACTIVE' | 'INACTIVE';

  // Additional properties
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

const CreateProductPage = () => {
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
    guideUrl: "",
    imageUrl: "",
    originalPrice: 0,
    importPrice: 0,
    salePrice: 0,
    stockQuantity: 0,
    productCategory: "",
    enablePopup: false,
    
    // SEO section
    metaTitle: "",
    metaDescription: "",
    mainKeyword: "",
    primaryKeywords: [],
    secondaryKeywords: [],
    tags: [],
    
    // Promotion section
    promotionStartDate: null,
    promotionEndDate: null,
    promotionDiscount: 0,
    promotionType: 'percentage',
    promotionPrice: 0,
    promotionQuantity: 0,
    
    // Linking section
    relatedProducts: [],
    additionalRequirements: [],
    
    // Popup section
    popupTitle: "",
    popupContent: "",
    popupButtonText: "",
    popupButtonLink: "",
    
    // Custom code section
    customHtmlHead: "",
    customHtmlBody: "",

    // Additional properties
    importSource: "",
    quantity: 0,
    autoSyncQuantity: false,
    minQuantity: 0,
    maxQuantity: 0,
    autoDeliverKey: false,
    showReadMore: false,
    enablePromotion: true,
    lowStockThreshold: 0,
    gameKeyDisplayText: "",
    instructionalText: "",
    expiryDays: 0,
    allowComments: false,
    status: 'ACTIVE',
    slug: "",
  });

  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await categoryApi.getAllAdmin();
      setCategories(fetchedCategories);
    };
    loadCategories();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to an API
    console.log("Form submitted", formState);
    toast.success("Tạo sản phẩm thành công!");
  };

  const updateFormState = (data: Partial<typeof formState>) => {
    setFormState(prev => ({
      ...prev,
      ...data
    }));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Thêm Sản Phẩm</h1>
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
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
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