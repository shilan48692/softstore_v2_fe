'use client';

import React, { ChangeEvent, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FormState, FormUpdateCallback } from '@/app/(admin)/products/edit/[slug]/page';

interface PromotionSectionProps {
  formState: FormState;
  updateFormState: FormUpdateCallback;
}

// Helper function to format Date or ISO String to YYYY-MM-DDTHH:mm
const formatDateForInput = (dateStringOrNull: string | null): string => {
  if (!dateStringOrNull) return '';
  try {
    const date = new Date(dateStringOrNull);
    if (isNaN(date.getTime())) return ''; // Handle invalid date string
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (e) {
    console.error("Error formatting date for input:", dateStringOrNull, e);
    return '';
  }
};

const PromotionSection: React.FC<PromotionSectionProps> = ({ formState, updateFormState }) => {

  // State for formatted date strings suitable for datetime-local input
  const [formattedStartDate, setFormattedStartDate] = useState('');
  const [formattedEndDate, setFormattedEndDate] = useState('');

  // Effect to update formatted dates when formState dates change
  useEffect(() => {
    setFormattedStartDate(formatDateForInput(formState.promotionStartDate));
  }, [formState.promotionStartDate]);

  useEffect(() => {
    setFormattedEndDate(formatDateForInput(formState.promotionEndDate));
  }, [formState.promotionEndDate]);

  // Effect to automatically set dates based on price (Adjusted logic)
  useEffect(() => {
    const price = formState.promotionPrice;
    const hasPrice = typeof price === 'number' && price > 0;
    const startIsNullOrEmpty = !formState.promotionStartDate;
    const endIsNullOrEmpty = !formState.promotionEndDate;

    if (hasPrice && startIsNullOrEmpty) {
      // Only set if price exists AND start date is missing
      const now = new Date();
      const startDateISO = now.toISOString(); // Update main state with ISO
      const endDate = new Date(now.setFullYear(now.getFullYear() + 10));
      const endDateISO = endDate.toISOString(); // Update main state with ISO

      updateFormState({
        promotionStartDate: startDateISO,
        promotionEndDate: endDateISO
      });
    } else if (hasPrice && formState.promotionStartDate && endIsNullOrEmpty) {
       // Only set end date if start date exists and end date is missing
        const startDate = new Date(formState.promotionStartDate);
        const endDate = new Date(startDate.setFullYear(startDate.getFullYear() + 10));
        const endDateISO = endDate.toISOString();
        updateFormState({ promotionEndDate: endDateISO });
    } else if (!hasPrice) {
      // If no price, clear dates only if they currently exist
      if (formState.promotionStartDate || formState.promotionEndDate) {
        updateFormState({ promotionStartDate: null, promotionEndDate: null });
      }
    }
  }, [formState.promotionPrice, formState.promotionStartDate, formState.promotionEndDate, updateFormState]);

  // Hàm xử lý input số (có thể là null hoặc '')
  const handleNullableNumericChange = (key: keyof FormState, value: string) => {
    if (value === '') {
      updateFormState({ [key]: '' } as any); // Update state with '' for controlled input
    } else {
      const num = parseInt(value, 10);
      if (!isNaN(num) && num >= 0) {
        updateFormState({ [key]: num } as any);
      } else {
         updateFormState({ [key]: '' } as any); // Reset to empty string if invalid number
      }
    }
  };

  // Handler for date input changes
  const handleDateChange = (key: 'promotionStartDate' | 'promotionEndDate', value: string) => {
    // The value from datetime-local is already in YYYY-MM-DDTHH:mm format or empty
    // We need to convert it back to ISO string or null for the main formState
    if (value === '') {
      updateFormState({ [key]: null });
    } else {
      try {
        const date = new Date(value); // Parse the local time string
        updateFormState({ [key]: date.toISOString() }); // Store as ISO string
      } catch (e) {
        console.error("Error parsing date input:", value, e);
        updateFormState({ [key]: null }); // Set to null if parsing fails
      }
    }
  };

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="promotionEnabled"
            checked={formState.promotionEnabled || false}
            onCheckedChange={(checked) => updateFormState({ promotionEnabled: checked })}
          />
          <Label htmlFor="promotionEnabled">Bật Khuyến Mãi</Label>
        </div>

        {formState.promotionEnabled && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label htmlFor="promotionPrice">Giá Khuyến Mãi</Label>
              <Input
                id="promotionPrice"
                type="number"
                value={formState.promotionPrice ?? ''}
                onChange={(e) => handleNullableNumericChange('promotionPrice', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="promotionStartDate">Ngày Bắt Đầu</Label>
              <Input
                id="promotionStartDate"
                type="datetime-local"
                value={formattedStartDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleDateChange('promotionStartDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="promotionEndDate">Ngày Kết Thúc</Label>
              <Input
                id="promotionEndDate"
                type="datetime-local"
                value={formattedEndDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleDateChange('promotionEndDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="promotionQuantity">Số Lượng Áp Dụng (để trống nếu không giới hạn)</Label>
              <Input
                id="promotionQuantity"
                type="number"
                value={formState.promotionQuantity ?? ''}
                onChange={(e) => handleNullableNumericChange('promotionQuantity', e.target.value)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PromotionSection; 