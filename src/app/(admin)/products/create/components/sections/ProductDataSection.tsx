'use client';

import React, { ChangeEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import dynamic from 'next/dynamic';

// Dynamic import for RichTextEditor
const RichTextEditor = dynamic(
  () => import('@/components/RichTextEditor/RichTextEditor').then(mod => mod.RichTextEditor),
  { ssr: false, loading: () => <p>Loading Editor...</p> } 
);

interface FormState {
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

interface ProductDataSectionProps {
  formState: FormState;
  updateFormState: (data: Partial<FormState>) => void;
}

const ProductDataSection: React.FC<ProductDataSectionProps> = ({ formState, updateFormState }) => {

  const handleNumberChange = (key: keyof FormState, value: string) => {
      const num = value === '' ? 0 : parseInt(value, 10);
      if (!isNaN(num) && num >= 0) {
          updateFormState({ [key]: num } as Partial<FormState>);
      }
  };

  const handleMaxQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (rawValue === '') {
        updateFormState({ maxQuantity: 0 });
        return;
    }
    const value = parseInt(rawValue, 10);
    if (!isNaN(value) && value >= 0) {
        updateFormState({ maxQuantity: value });
    }
  };

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="guideUrl">URL Hướng Dẫn</Label>
              <Input
                id="guideUrl"
                value={formState.guideUrl}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ guideUrl: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="imageUrl">URL Hình Ảnh</Label>
              <Input
                id="imageUrl"
                value={formState.imageUrl}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ imageUrl: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="originalPrice">Giá Gốc <span className="text-red-500">*</span></Label>
              <Input
                id="originalPrice"
                type="number"
                value={formState.originalPrice}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleNumberChange('originalPrice', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="importPrice">Giá Nhập</Label>
              <Input
                id="importPrice"
                type="number"
                value={formState.importPrice}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleNumberChange('importPrice', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="importSource">Nguồn Nhập</Label>
              <Input
                id="importSource"
                value={formState.importSource}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ importSource: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity">Số Lượng <span className="text-red-500">*</span></Label>
              <Input
                id="quantity"
                type="number"
                value={formState.quantity}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleNumberChange('quantity', e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="autoSyncQuantity"
                checked={formState.autoSyncQuantity}
                onCheckedChange={(checked: boolean) => updateFormState({ autoSyncQuantity: checked })}
              />
              <Label htmlFor="autoSyncQuantity">Tự Động Đồng Bộ Số Lượng</Label>
            </div>
            <div>
              <Label htmlFor="minQuantity">Số Lượng Tối Thiểu</Label>
              <Input
                id="minQuantity"
                type="number"
                value={formState.minQuantity}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleNumberChange('minQuantity', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="maxQuantity">Số Lượng Tối Đa</Label>
              <Input
                id="maxQuantity"
                type="number"
                value={formState.maxQuantity ? String(formState.maxQuantity) : '10'}
                onChange={handleMaxQuantityChange}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
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
              id="showReadMore"
              checked={formState.showReadMore}
              onCheckedChange={(checked: boolean) => updateFormState({ showReadMore: checked })}
            />
            <Label htmlFor="showReadMore">Hiển Thị Xem Thêm</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="enablePromotion"
              checked={formState.enablePromotion}
              onCheckedChange={(checked: boolean) => updateFormState({ enablePromotion: checked })}
            />
            <Label htmlFor="enablePromotion">Bật Khuyến Mãi</Label>
          </div>
          <div>
            <Label htmlFor="lowStockThreshold">Ngưỡng Hết Hàng</Label>
            <Input
              id="lowStockThreshold"
              type="number"
              value={formState.lowStockThreshold}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleNumberChange('lowStockThreshold', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="gameKeyDisplayText">Văn Bản Hiển Thị Key Game</Label>
            <Input
              id="gameKeyDisplayText"
              value={formState.gameKeyDisplayText}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ gameKeyDisplayText: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="instructionalText">Văn Bản Hướng Dẫn</Label>
            <RichTextEditor
              initialContent={formState.instructionalText}
              onChange={(htmlContent) => {
                updateFormState({ instructionalText: htmlContent });
              }}
            />
          </div>
          <div>
            <Label htmlFor="expiryDays">Số Ngày Hết Hạn</Label>
            <Input
              id="expiryDays"
              type="number"
              value={formState.expiryDays}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleNumberChange('expiryDays', e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="allowComments"
              checked={formState.allowComments}
              onCheckedChange={(checked: boolean) => updateFormState({ allowComments: checked })}
            />
            <Label htmlFor="allowComments">Cho Phép Bình Luận</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductDataSection; 