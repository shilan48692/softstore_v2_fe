export interface FormState {
  // Overview section
  gameCode?: string;
  analyticsCode?: string;
  productName?: string; // Changed from name in edit page for consistency
  requirePhone?: boolean; // Changed from requirePhoneNumber in create page
  shortDescription?: string; // Changed from shortSummary in create page
  description?: string;      // Changed from fullDescription in create page
  warrantyPolicy?: string;
  faq?: string;
  guideUrl?: string;
  imageUrl?: string;
  originalPrice?: number | ''; // Allow empty string
  importPrice?: number | '';   // Allow empty string
  salePrice?: number | '';     // Added for consistency (was in create)
  stockQuantity?: number | ''; // Added for consistency (was in create)
  categoryId?: string | null; // Changed from productCategory in create page
  popupEnabled?: boolean;     // Changed from enablePopup in create page

  // SEO section
  metaTitle?: string;
  metaDescription?: string;
  mainKeyword?: string;
  // Changed from primaryKeywords/secondaryKeywords in create page
  secondaryKeywords?: string[]; 
  tags?: string[];

  // Promotion section
  promotionEnabled?: boolean; // Changed from enablePromotion in create page
  promotionStartDate?: string | null;
  promotionEndDate?: string | null;
  promotionDiscount?: number | ''; // Added for consistency (was in create)
  promotionType?: 'percentage' | 'fixed'; // Added for consistency (was in create)
  promotionPrice?: number | null | ''; // Allow null and empty string
  promotionQuantity?: number | null | ''; // Allow null and empty string

  // Linking section
  relatedProducts?: string[]; // Added for consistency (was in create)
  additionalRequirementIds?: string[]; // Changed from additionalRequirements in create page
  relatedProductIds?: string[]; // Re-added field for related products
  relatedProductsData?: { id: string; name: string }[]; // Add this to store fetched data {id, name}

  // Popup section
  popupTitle?: string;
  popupContent?: string;
  popupButtonText?: string; // Added for consistency (was in create)
  popupButtonLink?: string; // Added for consistency (was in create)

  // Custom code section
  customHeadCode?: string; // Changed from customHtmlHead in create page
  customBodyCode?: string; // Changed from customHtmlBody in create page

  slug?: string;
  status?: 'ACTIVE' | 'INACTIVE';

  // Additional properties (merged from both pages)
  importSource?: string;
  quantity?: number | '';
  autoSyncQuantityWithKey?: boolean; // Changed from autoSyncQuantity in create page
  minPerOrder?: number | '';        // Changed from minQuantity in create page
  maxPerOrder?: number | null | ''; // Changed from maxQuantity in create page
  autoDeliverKey?: boolean;
  showMoreDescription?: boolean;     // Changed from showReadMore in create page
  lowStockWarning?: number | null | ''; // Changed from lowStockThreshold in create page
  gameKeyText?: string;              // Changed from gameKeyDisplayText in create page
  guideText?: string;                // Changed from instructionalText in create page
  expiryDays?: number | null | '';
  allowComment?: boolean;            // Changed from allowComments in create page

  // Keep track of original slug for edit page logic if needed
  originalSlug?: string;
  productId?: string; // Add productId if needed by sections
}

export type FormUpdateCallback = (updatedData: Partial<FormState>) => void; 