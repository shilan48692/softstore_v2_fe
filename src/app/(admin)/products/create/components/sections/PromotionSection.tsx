'use client';

import React, { ChangeEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface FormState {
  promotionPrice: number;
  promotionStartDate: string | null;
  promotionEndDate: string | null;
  promotionQuantity: number;
}

interface PromotionSectionProps {
  formState: FormState;
  updateFormState: (data: Partial<FormState>) => void;
}

const PromotionSection: React.FC<PromotionSectionProps> = ({ formState, updateFormState }) => {
  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="promotionPrice">Giá Khuyến Mãi</Label>
            <Input
              id="promotionPrice"
              type="number"
              value={formState.promotionPrice || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ promotionPrice: e.target.value ? parseFloat(e.target.value) : 0 })}
            />
          </div>
          <div>
            <Label htmlFor="promotionStartDate">Ngày Bắt Đầu</Label>
            <Input
              id="promotionStartDate"
              type="datetime-local"
              value={formState.promotionStartDate || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ promotionStartDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="promotionEndDate">Ngày Kết Thúc</Label>
            <Input
              id="promotionEndDate"
              type="datetime-local"
              value={formState.promotionEndDate || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ promotionEndDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="promotionQuantity">Số Lượng Khuyến Mãi</Label>
            <Input
              id="promotionQuantity"
              type="number"
              value={formState.promotionQuantity || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ promotionQuantity: e.target.value ? parseInt(e.target.value) : 0 })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromotionSection; 