'use client';

import React, { ChangeEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FormState {
  customHtmlHead: string;
  customHtmlBody: string;
}

interface CustomCodeSectionProps {
  formState: FormState;
  updateFormState: (data: Partial<FormState>) => void;
}

const CustomCodeSection: React.FC<CustomCodeSectionProps> = ({ formState, updateFormState }) => {
  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="customHtmlHead">Custom HTML Head</Label>
            <Textarea
              id="customHtmlHead"
              value={formState.customHtmlHead}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateFormState({ customHtmlHead: e.target.value })}
              className="min-h-[200px] font-mono"
              placeholder="Enter custom HTML code for head section..."
            />
          </div>
          <div>
            <Label htmlFor="customHtmlBody">Custom HTML Body</Label>
            <Textarea
              id="customHtmlBody"
              value={formState.customHtmlBody}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateFormState({ customHtmlBody: e.target.value })}
              className="min-h-[200px] font-mono"
              placeholder="Enter custom HTML code for body section..."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomCodeSection; 