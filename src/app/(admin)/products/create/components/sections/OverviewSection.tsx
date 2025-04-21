'use client';

import React, { ChangeEvent, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { RichTextEditor } from '@/components/RichTextEditor/RichTextEditor'; // Comment out static import
import dynamic from 'next/dynamic';

// Dynamic import for RichTextEditor
const RichTextEditor = dynamic(
  () => import('@/components/RichTextEditor/RichTextEditor').then(mod => mod.RichTextEditor),
  { ssr: false, loading: () => <p>Loading Editor...</p> } // Disable SSR and add a loading state
);

// Helper function to generate slug
const generateSlug = (str: string): string => {
  str = str.toLowerCase();
  // remove accents, swap ñ for n, etc
  const from = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ·/_,:;";
  const to   = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd-------";
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }
  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes
  return str;
};

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
  slug: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface OverviewSectionProps {
  formState: FormState;
  updateFormState: (data: Partial<FormState>) => void;
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
      updateFormState({ productName: newName });
      // Reset cờ sửa slug thủ công nếu tên sản phẩm trống
      if (newName === '') {
          setIsSlugManuallyEdited(false);
          updateFormState({ slug: '' }); 
      }
  }

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
              <Label htmlFor="productName">Tên Sản Phẩm <span className="text-red-500">*</span></Label>
              <Input
                id="productName"
                value={formState.productName}
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
            <div>
              <Label htmlFor="status">Trạng Thái</Label>
              <Select
                value={formState.status}
                onValueChange={(value: 'ACTIVE' | 'INACTIVE') => updateFormState({ status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Đang hoạt động (ACTIVE)</SelectItem>
                  <SelectItem value="INACTIVE">Ngừng hoạt động (INACTIVE)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-2">
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
              <RichTextEditor
                initialContent={formState.fullDescription}
                onChange={(htmlContent) => {
                  updateFormState({ fullDescription: htmlContent });
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="warrantyPolicy">Chính Sách Bảo Hành</Label>
            <RichTextEditor
              initialContent={formState.warrantyPolicy}
              onChange={(htmlContent) => {
                updateFormState({ warrantyPolicy: htmlContent });
              }}
            />
          </div>
          <div>
            <Label htmlFor="faq">Câu Hỏi Thường Gặp</Label>
            <RichTextEditor
              initialContent={formState.faq}
              onChange={(htmlContent) => {
                updateFormState({ faq: htmlContent });
              }}
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