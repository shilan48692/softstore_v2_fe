'use client';

import React, { ChangeEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface FormState {
  enablePopup: boolean;
  popupTitle: string;
  popupContent: string;
}

interface PopupNotificationSectionProps {
  formState: FormState;
  updateFormState: (data: Partial<FormState>) => void;
}

const PopupNotificationSection: React.FC<PopupNotificationSectionProps> = ({ formState, updateFormState }) => {
  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="enablePopup"
              checked={formState.enablePopup}
              onCheckedChange={(checked) => updateFormState({ enablePopup: checked })}
            />
            <Label htmlFor="enablePopup">Bật Thông Báo Popup</Label>
          </div>
          <div>
            <Label htmlFor="popupTitle">Tiêu Đề Popup</Label>
            <Input
              id="popupTitle"
              value={formState.popupTitle}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ popupTitle: e.target.value })}
              disabled={!formState.enablePopup}
            />
          </div>
          <div>
            <Label htmlFor="popupContent">Nội Dung Popup</Label>
            <Textarea
              id="popupContent"
              value={formState.popupContent}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateFormState({ popupContent: e.target.value })}
              disabled={!formState.enablePopup}
              className="min-h-[100px]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PopupNotificationSection; 