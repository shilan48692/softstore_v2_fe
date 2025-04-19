'use client';

import React, { ChangeEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface FormState {
  gameCode: string;
  analyticsCode: string;
  productName: string;
  requirePhoneNumber: boolean;
  shortSummary: string;
  fullDescription: string;
  warrantyPolicy: string;
  faq: string;
  metaTitle: string;
  metaDescription: string;
  mainKeyword: string;
  secondaryKeywords: string[];
  tags: string[];
}

interface OverviewSectionProps {
  formState: FormState;
  updateFormState: (data: Partial<FormState>) => void;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({ formState, updateFormState }) => {
  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="gameCode">Mã Game</Label>
              <Input
                id="gameCode"
                value={formState.gameCode}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ gameCode: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="analyticsCode">Mã Analytics</Label>
              <Input
                id="analyticsCode"
                value={formState.analyticsCode}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ analyticsCode: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="productName">Tên Sản Phẩm</Label>
              <Input
                id="productName"
                value={formState.productName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ productName: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="requirePhoneNumber"
                checked={formState.requirePhoneNumber}
                onCheckedChange={(checked) => updateFormState({ requirePhoneNumber: checked })}
              />
              <Label htmlFor="requirePhoneNumber">Yêu Cầu Số Điện Thoại</Label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="shortSummary">Tóm Tắt Ngắn</Label>
              <Textarea
                id="shortSummary"
                value={formState.shortSummary}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateFormState({ shortSummary: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="fullDescription">Mô Tả Đầy Đủ</Label>
              <Textarea
                id="fullDescription"
                value={formState.fullDescription}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateFormState({ fullDescription: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="warrantyPolicy">Chính Sách Bảo Hành</Label>
            <Textarea
              id="warrantyPolicy"
              value={formState.warrantyPolicy}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateFormState({ warrantyPolicy: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="faq">Câu Hỏi Thường Gặp</Label>
            <Textarea
              id="faq"
              value={formState.faq}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateFormState({ faq: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="metaTitle">Tiêu Đề Meta</Label>
            <Input
              id="metaTitle"
              value={formState.metaTitle}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ metaTitle: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="metaDescription">Mô Tả Meta</Label>
            <Textarea
              id="metaDescription"
              value={formState.metaDescription}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateFormState({ metaDescription: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="mainKeyword">Từ Khóa Chính</Label>
            <Input
              id="mainKeyword"
              value={formState.mainKeyword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ mainKeyword: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="secondaryKeywords">Từ Khóa Phụ</Label>
            <Input
              id="secondaryKeywords"
              value={formState.secondaryKeywords.join(', ')}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ secondaryKeywords: e.target.value.split(',').map(k => k.trim()) })}
              placeholder="Nhập từ khóa, phân cách bằng dấu phẩy"
            />
          </div>
          <div>
            <Label htmlFor="tags">Thẻ</Label>
            <Input
              id="tags"
              value={formState.tags.join(', ')}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ tags: e.target.value.split(',').map(t => t.trim()) })}
              placeholder="Nhập thẻ, phân cách bằng dấu phẩy"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverviewSection; 