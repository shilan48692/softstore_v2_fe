'use client';

import React, { ChangeEvent, useEffect } from 'react';
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

// Helper function to format Date to YYYY-MM-DDTHH:mm for datetime-local input
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
  // return; // Thử thêm để sửa lỗi linter giả (nếu có)
};

const PromotionSection: React.FC<PromotionSectionProps> = ({ formState, updateFormState }) => {

  // useEffect để tự động cập nhật ngày dựa trên giá KM
  useEffect(() => {
    const promotionPrice = formState.promotionPrice;

    if (promotionPrice && promotionPrice > 0) {
      // Nếu giá KM > 0 và ngày bắt đầu chưa được đặt hoặc là null
      if (!formState.promotionStartDate) {
        const now = new Date();
        const startDate = formatDateForInput(now);

        // Đặt ngày kết thúc là +10 năm từ ngày bắt đầu
        const endDate = new Date(now.setFullYear(now.getFullYear() + 10));
        const endDateFormatted = formatDateForInput(endDate);

        updateFormState({ 
          promotionStartDate: startDate, 
          promotionEndDate: endDateFormatted 
        });
      }
      // Trường hợp đã có ngày bắt đầu nhưng chưa có ngày kết thúc
      else if (formState.promotionStartDate && !formState.promotionEndDate) {
        const startDate = new Date(formState.promotionStartDate);
        const endDate = new Date(startDate.setFullYear(startDate.getFullYear() + 10));
        const endDateFormatted = formatDateForInput(endDate);
         updateFormState({ promotionEndDate: endDateFormatted });
      }
    } else {
      // Nếu giá KM là 0 hoặc rỗng, reset ngày về null nếu chúng đang có giá trị
      if (formState.promotionStartDate || formState.promotionEndDate) {
         updateFormState({ promotionStartDate: null, promotionEndDate: null });
      }
    }
    // Chỉ chạy khi promotionPrice thay đổi
  }, [formState.promotionPrice, formState.promotionStartDate, formState.promotionEndDate, updateFormState]);

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