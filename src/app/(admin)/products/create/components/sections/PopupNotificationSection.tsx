'use client';

import React, { ChangeEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import dynamic from 'next/dynamic';
// Import types from parent
import { FormState, FormUpdateCallback } from '@/app/(admin)/products/edit/[slug]/page';

// Dynamic import for RichTextEditor
const RichTextEditor = dynamic(
  () => import('@/components/RichTextEditor/RichTextEditor').then(mod => mod.RichTextEditor),
  { ssr: false, loading: () => <p>Loading Editor...</p> } 
);

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
            checked={formState.popupEnabled || false}
            onCheckedChange={(checked) => updateFormState({ popupEnabled: checked })}
          />
          <Label htmlFor="popupEnabled">Bật Thông Báo Popup</Label>
        </div>

        {formState.popupEnabled && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label htmlFor="popupTitle">Tiêu Đề Popup</Label>
              <Input
                id="popupTitle"
                value={formState.popupTitle ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ popupTitle: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="popupContent">Nội Dung Popup</Label>
              <RichTextEditor
                 initialContent={formState.popupContent ?? ''}
                 onChange={(htmlContent) => {
                    updateFormState({ popupContent: htmlContent });
                  }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PopupNotificationSection; 