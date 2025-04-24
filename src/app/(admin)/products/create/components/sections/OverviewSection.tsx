'use client';

import React, { ChangeEvent, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormState, FormUpdateCallback } from '@/types/productForm';
import CKEditor4Field from '@/components/CKEditor4Field';

// Helper function to generate slug
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};

interface OverviewSectionProps {
  formState: FormState;
  updateFormState: FormUpdateCallback;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({ formState, updateFormState }) => {
  console.log("OverviewSection received formState:", formState);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Auto-generate slug when productName changes, if not manually edited
  useEffect(() => {
    if (!isSlugManuallyEdited && formState.productName) {
      const newSlug = generateSlug(formState.productName);
      // Chỉ cập nhật nếu slug thực sự thay đổi để tránh vòng lặp vô hạn
      if (newSlug !== formState.slug) {
        updateFormState({ slug: newSlug });
      }
    }
    // Dependency array chỉ cần productName để theo dõi thay đổi tên
    // Không cần isSlugManuallyEdited ở đây để tránh trigger khi nó thay đổi
  }, [formState.productName, updateFormState, formState.slug, isSlugManuallyEdited]); // Thêm isSlugManuallyEdited để lint hài lòng, nhưng logic chính dựa vào check !isSlugManuallyEdited bên trong

  const handleSlugChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true); // Đánh dấu slug đã được sửa thủ công
    updateFormState({ slug: e.target.value });
  };
  
  const handleProductNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    updateFormState({ productName: newName }); // Update product name
    // If name is cleared, reset manual slug edit flag so it can auto-generate again
    if (newName === '') {
        setIsSlugManuallyEdited(false);
    }
    // Auto-generation logic is now handled by the useEffect
  };

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        {/* Section 1: Basic Info (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1.1: Name & Slug */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="productName">Tên Sản Phẩm <span className="text-red-500">*</span></Label>
              <Input
                id="productName"
                value={formState.productName ?? ''}
                onChange={handleProductNameChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={formState.slug}
                onChange={handleSlugChange}
                placeholder="Tự động tạo hoặc nhập thủ công"
              />
            </div>
          </div>

          {/* Column 1.2: Codes & Switch */}
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
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="requirePhoneNumber"
                checked={formState.requirePhone ?? false}
                onCheckedChange={(checked) => updateFormState({ requirePhone: checked })}
              />
              <Label htmlFor="requirePhoneNumber">Yêu Cầu Số Điện Thoại</Label>
            </div>
          </div>
        </div>

        {/* Section 2: Descriptive Content (Full Width, Stacked) */}
        <div className="space-y-4">
          <div> {/* Keep div wrapper for short summary */}
              <Label htmlFor="shortDescription">Tóm Tắt Ngắn</Label>
              <textarea
                id="shortDescription"
                value={formState.shortDescription ?? ''}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateFormState({ shortDescription: e.target.value })}
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Mô Tả Đầy Đủ</Label>
          <CKEditor4Field
            id="description"
            value={formState.description}
            onChange={(data) => updateFormState({ description: data })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="warrantyPolicy">Chính Sách Bảo Hành</Label>
          <CKEditor4Field
            id="warrantyPolicy"
            value={formState.warrantyPolicy}
            onChange={(data) => updateFormState({ warrantyPolicy: data })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="faq">Câu Hỏi Thường Gặp (FAQ)</Label>
          <CKEditor4Field
            id="faq"
            value={formState.faq}
            onChange={(data) => updateFormState({ faq: data })}
          />
        </div>

        {/* Section 3: SEO/Meta Info (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 3.1: Meta Title & Description */}
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
              <textarea
                id="metaDescription"
                value={formState.metaDescription}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateFormState({ metaDescription: e.target.value })}
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          {/* Column 3.2: Keywords & Tags */}
          <div className="space-y-4">
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
                value={formState.secondaryKeywords?.join(', ') ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ secondaryKeywords: e.target.value.split(',').map(k => k.trim()) })}
                placeholder="Nhập từ khóa, phân cách bằng dấu phẩy"
              />
            </div>
            <div>
              <Label htmlFor="tags">Thẻ</Label>
              <Input
                id="tags"
                value={formState.tags?.join(', ') ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormState({ tags: e.target.value.split(',').map(t => t.trim()) })}
                placeholder="Nhập thẻ, phân cách bằng dấu phẩy"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverviewSection; 