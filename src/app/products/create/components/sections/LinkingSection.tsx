'use client';

import React, { ChangeEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FormState {
  productCategory: string;
  relatedProducts: string[];
  additionalRequirements: string[];
}

interface LinkingSectionProps {
  formState: FormState;
  updateFormState: (data: Partial<FormState>) => void;
}

const LinkingSection: React.FC<LinkingSectionProps> = ({ formState, updateFormState }) => {
  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="productCategory">Danh Mục Sản Phẩm</Label>
            <Input
              id="productCategory"
              value={formState.productCategory}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ productCategory: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="relatedProducts">Sản Phẩm Liên Quan</Label>
            <Input
              id="relatedProducts"
              value={formState.relatedProducts.join(', ')}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ relatedProducts: e.target.value.split(',').map(p => p.trim()) })}
              placeholder="Nhập ID sản phẩm, phân cách bằng dấu phẩy"
            />
          </div>
          <div>
            <Label htmlFor="additionalRequirements">Yêu Cầu Bổ Sung</Label>
            <Textarea
              id="additionalRequirements"
              value={formState.additionalRequirements.join('\n')}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateFormState({ additionalRequirements: e.target.value.split('\n').map(r => r.trim()) })}
              placeholder="Nhập yêu cầu (mỗi yêu cầu một dòng)"
              className="min-h-[100px]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkingSection; 