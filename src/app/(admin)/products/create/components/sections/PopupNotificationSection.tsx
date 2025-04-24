'use client';

import React, { ChangeEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FormState, FormUpdateCallback } from '@/types/productForm';
import CKEditor4Field from '@/components/CKEditor4Field';

interface PopupNotificationSectionProps {
  formState: FormState;
  updateFormState: FormUpdateCallback;
}

const PopupNotificationSection: React.FC<PopupNotificationSectionProps> = ({ formState, updateFormState }) => {
  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="popupEnabled"
            checked={formState.popupEnabled ?? false}
            onCheckedChange={(checked: boolean) => updateFormState({ popupEnabled: checked })}
          />
          <Label htmlFor="popupEnabled">Kích hoạt Popup Thông Báo</Label>
        </div>

        {formState.popupEnabled && (
          <div className="space-y-4 pl-6 border-l-2 border-gray-200 ml-2">
            <div>
              <Label htmlFor="popupTitle">Tiêu đề Popup</Label>
              <Input
                id="popupTitle"
                value={formState.popupTitle ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ popupTitle: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="popupContent">Nội dung Popup</Label>
              <CKEditor4Field
                id="popupContent"
                value={formState.popupContent}
                onChange={(data) => updateFormState({ popupContent: data })}
                config={{ height: 200 }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PopupNotificationSection; 