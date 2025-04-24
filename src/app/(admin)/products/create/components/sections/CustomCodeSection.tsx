'use client';

import React, { ChangeEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormState, FormUpdateCallback } from '@/app/(admin)/products/edit/[slug]/page';

interface CustomCodeSectionProps {
  formState: FormState;
  updateFormState: FormUpdateCallback;
}

const CustomCodeSection: React.FC<CustomCodeSectionProps> = ({ formState, updateFormState }) => {
  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div>
          <Label htmlFor="customHeadCode">Mã tùy chỉnh trong thẻ &lt;head&gt;</Label>
          <Textarea
            id="customHeadCode"
            value={formState.customHeadCode ?? ''}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateFormState({ customHeadCode: e.target.value })}
            placeholder="<style>...</style> or <script>...</script>"
            className="min-h-[150px] font-mono"
          />
        </div>
        <div>
          <Label htmlFor="customBodyCode">Mã tùy chỉnh ở cuối thẻ &lt;body&gt;</Label>
          <Textarea
            id="customBodyCode"
            value={formState.customBodyCode ?? ''}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateFormState({ customBodyCode: e.target.value })}
            placeholder="<script>...</script>"
            className="min-h-[150px] font-mono"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomCodeSection; 