'use client';

import React, { ChangeEvent, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { FormState, FormUpdateCallback } from '@/types/productForm';
import CKEditor4Field from '@/components/CKEditor4Field';
import { ImportSourceSearchInput } from '@/components/shared/ImportSourceSearchInput';

interface ProductDataSectionProps {
  formState: FormState;
  updateFormState: FormUpdateCallback;
}

const ProductDataSection: React.FC<ProductDataSectionProps> = ({ formState, updateFormState }) => {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Put the functions back inside the component
  const handleNumberChange = (key: keyof FormState, value: string) => {
      // Allow null for optional fields by checking the key
      const optionalNumericFields: (keyof FormState)[] = ['maxPerOrder', 'lowStockWarning', 'expiryDays'];
      const isOptional = optionalNumericFields.includes(key);
      
      if (value === '') {
          updateFormState({ [key]: isOptional ? null : 0 } as Partial<FormState>);
          return;
      }
      const num = parseInt(value, 10);
      if (!isNaN(num) && num >= 0) {
          updateFormState({ [key]: num } as Partial<FormState>);
      } else if (value === '' && isOptional) {
           updateFormState({ [key]: null } as Partial<FormState>);
      }
  };

  const handleMaxQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Use handleNumberChange for consistency
    handleNumberChange('maxPerOrder', e.target.value);
  };

  // --- Image Upload Logic ---
  const triggerImageInput = () => {
    imageInputRef.current?.click();
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      uploadProductImage(event.target.files[0]);
    }
  };

  const uploadProductImage = async (file: File) => {
    if (isUploadingImage) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        toast.error('Loại file không hợp lệ. Chỉ chấp nhận JPG, PNG, GIF, WEBP.');
        return;
    }
    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`Kích thước file quá lớn. Tối đa là ${maxSizeMB}MB.`);
        return;
    }

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // REMOVE localStorage token retrieval and header creation
      /* 
      const token = localStorage.getItem('token'); 
      if (!token) {
        throw new Error('Authentication token not found.');
      }
      const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
      */

      // Make fetch request WITHOUT manual Authorization header
      const response = await fetch('/api/upload', { 
        method: 'POST', 
        // headers: headers, // REMOVE headers option
        body: formData 
      });

      if (!response.ok) {
        let errorMsg = 'Upload failed';
        try { const errorData = await response.json(); errorMsg = errorData.error || `Upload failed with status: ${response.status}`; } 
        catch (e) { errorMsg = `Upload failed with status: ${response.status}`; }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      if (data.url) {
        updateFormState({ imageUrl: data.url });
        toast.success('Ảnh sản phẩm đã được tải lên!');
      } else {
        throw new Error('Invalid response from server: URL missing');
      }
    } catch (error: any) {
      console.error("Product image upload error:", error);
      toast.error(error.message || 'Tải ảnh sản phẩm lên thất bại.');
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) { imageInputRef.current.value = ''; }
    }
  };
  // --- End Image Upload Logic ---

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        {/* Section 1: Pricing & Limits (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1.1: Prices */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="originalPrice">Giá Gốc <span className="text-red-500">*</span></Label>
              <Input
                id="originalPrice"
                type="number"
                value={formState.originalPrice ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleNumberChange('originalPrice', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="importPrice">Giá Nhập</Label>
              <Input
                id="importPrice"
                type="number"
                value={formState.importPrice ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleNumberChange('importPrice', e.target.value)}
              />
            </div>
          </div>
          {/* Column 1.2: Order & Expiry Limits */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="minPerOrder">Số Lượng Tối Thiểu / Đơn</Label>
              <Input
                id="minPerOrder"
                type="number"
                value={formState.minPerOrder ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleNumberChange('minPerOrder', e.target.value)}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="maxPerOrder">Số Lượng Tối Đa</Label>
              <Input
                id="maxPerOrder"
                type="number"
                value={formState.maxPerOrder ?? ''}
                onChange={handleMaxQuantityChange}
              />
            </div>
             <div>
              <Label htmlFor="expiryDays">Số Ngày Hết Hạn</Label>
              <Input
                id="expiryDays"
                type="number"
                value={formState.expiryDays ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleNumberChange('expiryDays', e.target.value)}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Source & Inventory (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 2.1: Source & Quantity */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="importSource">Nguồn Nhập</Label>
              <ImportSourceSearchInput
                value={formState.importSource}
                onChange={(value) => updateFormState({ importSource: value })}
                placeholder="Tìm hoặc nhập nguồn nhập..."
              />
            </div>
             <div>
              <Label htmlFor="quantity">Số Lượng <span className="text-red-500">*</span></Label>
              <Input
                id="quantity"
                type="number"
                value={formState.quantity ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleNumberChange('quantity', e.target.value)}
                required
              />
            </div>
          </div>
          {/* Column 2.2: Inventory Management */}
          <div className="space-y-4">
             <div className="flex items-center space-x-2 pt-2"> {/* Added pt-2 for alignment with Input */} 
              <Switch
                id="autoSyncQuantityWithKey"
                checked={formState.autoSyncQuantityWithKey}
                onCheckedChange={(checked: boolean) => updateFormState({ autoSyncQuantityWithKey: checked })}
              />
              <Label htmlFor="autoSyncQuantityWithKey">Tự Động Đồng Bộ Số Lượng Theo Key</Label>
            </div>
            <div>
              <Label htmlFor="lowStockWarning">Ngưỡng Hết Hàng</Label>
              <Input
                id="lowStockWarning"
                type="number"
                value={formState.lowStockWarning ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleNumberChange('lowStockWarning', e.target.value)}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Image (Full Width) */}
        <div className="space-y-2">
          <Label htmlFor="imageUrl">URL Hình Ảnh</Label>
          <div className="flex items-center gap-2">
            <Input
              id="imageUrl"
              value={formState.imageUrl}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ imageUrl: e.target.value })}
              placeholder="https://... hoặc tải lên"
              className="flex-grow"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerImageInput}
              disabled={isUploadingImage}
            >
              {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tải lên"}
            </Button>
          </div>
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageFileChange}
            style={{ display: 'none' }}
            accept="image/jpeg,image/png,image/gif,image/webp"
          />
          {/* Image Preview - Keep existing styles/structure */}
          {formState.imageUrl && (
            <div className="mt-2 w-full max-w-xs">
              <div
                style={{ width: '160px', height: '120px' }}
                className="rounded border border-muted bg-muted overflow-hidden flex items-center justify-center"
              >
                <img
                  src={formState.imageUrl}
                  alt="Xem trước ảnh sản phẩm"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    console.warn('Failed to load image preview:', formState.imageUrl);
                  }}
                  onLoad={(e) => {
                     (e.target as HTMLImageElement).style.display = 'block';
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Links & Guide (Full Width) */}
        <div className="space-y-4">
           <div>
              <Label htmlFor="guideUrl">URL Hướng Dẫn</Label>
              <Input
                id="guideUrl"
                value={formState.guideUrl ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ guideUrl: e.target.value })}
              />
            </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="guideText">Nội dung Hướng Dẫn</Label>
          <CKEditor4Field
            id="guideText"
            value={formState.guideText}
            onChange={(data) => updateFormState({ guideText: data })}
          />
        </div>

        {/* Section 5: Key Display (Full Width) */}
        <div className="space-y-2"> {/* Single div for this section */}
            <Label htmlFor="gameKeyText">Văn Bản Hiển Thị Key Game</Label>
            <Input
              id="gameKeyText"
              value={formState.gameKeyText}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ gameKeyText: e.target.value })}
            />
        </div>

        {/* Section 6: Flags/Switches (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"> {/* Use gap-x for column gap, gap-y for row gap */} 
          {/* Column 6.1 */}
           <div className="flex items-center space-x-2">
              <Switch
                id="autoDeliverKey"
                checked={formState.autoDeliverKey}
                onCheckedChange={(checked: boolean) => updateFormState({ autoDeliverKey: checked })}
              />
              <Label htmlFor="autoDeliverKey">Tự Động Giao Key</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="allowComment"
                checked={formState.allowComment}
                onCheckedChange={(checked: boolean) => updateFormState({ allowComment: checked })}
              />
              <Label htmlFor="allowComment">Cho Phép Bình Luận</Label>
            </div>

           {/* Column 6.2 */}
           <div className="flex items-center space-x-2">
              <Switch
                id="showMoreDescription"
                checked={formState.showMoreDescription}
                onCheckedChange={(checked: boolean) => updateFormState({ showMoreDescription: checked })}
              />
              <Label htmlFor="showMoreDescription">Hiển Thị Nút Đọc Thêm</Label>
            </div>
             {/* Placeholder for potential future switch */}
             <div></div>
        </div>

      </CardContent>
    </Card>
  );
};

export default ProductDataSection; 