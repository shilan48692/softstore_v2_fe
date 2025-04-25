'use client';

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { keyApi, ActivationKey, AddKeyInput, AddKeySchema, EditKeyInput, EditKeySchema, KeyStatus } from '@/services/api';
import { BulkCreateKeysInput, BulkCreateKeysSchema } from '@/services/api';
import { Product } from '@/services/api'; // Import Product type
import { ProductSearchInput } from '@/components/shared/ProductSearchInput';

interface KeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback after successful add/edit
  keyData?: ActivationKey | null; // Data for editing, null/undefined for adding
  products: Pick<Product, 'id' | 'name'>[]; // List of products for select
}

// Schema for the form's internal shape (cost as string)
const KeyFormSchema = z.object({
    // Use a different name for the textarea input in add mode
    activationCodesInput: z.string().min(1, "Cần nhập ít nhất một mã key").optional(), 
    // Keep original for edit mode display (won't be in form state directly if disabled)
    activationCode: z.string().optional(), 
    productId: z.string().min(1, "Vui lòng chọn sản phẩm"),
    status: z.nativeEnum(KeyStatus),
    // Cost is a string in the form, allow empty string
    cost: z.string().refine(value => value === '' || !isNaN(parseFloat(value)), {
      message: "Giá nhập phải là số hoặc để trống",
    }),
    note: z.string().optional(),
});

// Type derived from the form schema
type KeyFormShape = z.infer<typeof KeyFormSchema>;

export const KeyDialog: React.FC<KeyDialogProps> = ({ isOpen, onClose, onSuccess, keyData, products }) => {
  const isEditMode = !!keyData;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find initial product name for edit mode
  const initialProductName = isEditMode && keyData?.productId 
      ? products.find(p => p.id === keyData.productId)?.name
      : undefined;

  const form = useForm<KeyFormShape>({
    resolver: zodResolver(KeyFormSchema), // Use the form-specific schema
    defaultValues: {
      // Set codes input only if NOT in edit mode
      activationCodesInput: !isEditMode ? '' : undefined, 
      // Set activationCode only IF in edit mode for display
      activationCode: isEditMode ? keyData?.activationCode : undefined, 
      productId: keyData?.productId ?? '',
      status: keyData?.status ?? KeyStatus.AVAILABLE,
      cost: keyData?.cost === null || keyData?.cost === undefined ? '' : String(keyData.cost), // Cost as string
      note: keyData?.note ?? '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        activationCodesInput: !isEditMode ? '' : undefined,
        activationCode: isEditMode ? keyData?.activationCode : undefined,
        productId: keyData?.productId ?? '',
        status: keyData?.status ?? KeyStatus.AVAILABLE,
        cost: keyData?.cost === null || keyData?.cost === undefined ? '' : String(keyData.cost),
        note: keyData?.note ?? '',
      });
    }
  }, [isOpen, keyData, form]);

  // Use SubmitHandler with the form shape type
  const onSubmit: SubmitHandler<KeyFormShape> = async (values) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && keyData?.id) {
        // Parse with EditKeySchema (from api.ts) to get correctly typed API payload
        // This schema handles conversion (e.g., cost string to number/null)
        const editPayload = EditKeySchema.parse({
            status: values.status,
            cost: values.cost, // EditKeySchema handles string -> number/null conversion
            note: values.note,
        });
        await keyApi.update(keyData.id, editPayload);
        toast.success('Cập nhật key thành công!');
      } else {
        // ---> Handle Bulk Key Creation
        if (!values.activationCodesInput) {
            form.setError('activationCodesInput', { message: 'Cần nhập ít nhất một mã key' });
            setIsSubmitting(false);
            return;
        }

        const codesArray = values.activationCodesInput
          .split('\n')
          .map(code => code.trim())
          .filter(Boolean); // Remove empty lines

        if (codesArray.length === 0) {
            form.setError('activationCodesInput', { message: 'Không tìm thấy mã key hợp lệ nào sau khi xử lý' });
            setIsSubmitting(false);
            return;
        }

        const bulkPayload: BulkCreateKeysInput = {
            productId: values.productId,
            activationCodes: codesArray,
            status: values.status,
            cost: values.cost, // Schema handles string -> number/null
            note: values.note,
        };

        // Validate payload before sending (optional here if validated in api.ts)
        // const validationResult = BulkCreateKeysSchema.safeParse(bulkPayload);
        // if (!validationResult.success) { ... handle validation errors ... }

        const result = await keyApi.createBulk(bulkPayload); // Call the new bulk API function
        toast.success(`Thêm thành công ${result.count} key mới!`);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving key:", error);
      if (error instanceof z.ZodError) {
          console.error("Zod validation errors:", error.errors);
          // Map errors back to the form fields based on KeyFormShape
          error.errors.forEach((err) => {
            // Path might be nested if Zod schemas transform/refine deeply
            // For simple cases, path[0] is often the field name
            const fieldName = err.path[0] as keyof KeyFormShape | undefined;
            if (fieldName && fieldName in KeyFormSchema.shape) { // Check if field exists in form schema
                form.setError(fieldName, { type: 'manual', message: err.message });
            } else {
                // Handle cases where error path doesn't directly map or is a global error
                console.warn(`Could not map Zod error path "${err.path.join('.')}" to form field.`);
                toast.error(`Lỗi dữ liệu không xác định: ${err.message}`);
            }
          });
          toast.error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
      } else {
        const errorMsg = error?.response?.data?.message || error?.message || (isEditMode ? 'Lỗi cập nhật key' : 'Lỗi thêm key');
        toast.error(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Sửa Key Kích Hoạt' : 'Thêm Key Kích Hoạt Mới'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Chỉnh sửa thông tin chi tiết của key.' : 'Nhập thông tin để thêm key mới vào hệ thống.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Conditionally render Input (Edit) or Textarea (Add) */}
            {isEditMode ? (
                <FormField
                  control={form.control} 
                  name="activationCode" // Use the dedicated field for edit mode display
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã Key</FormLabel>
                        <FormControl>
                            {/* Display the original code, maybe use Input disabled or just text */}
                            <Input {...field} disabled value={keyData?.activationCode ?? ''} /> 
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}
                />
             ) : (
                 <FormField
                    control={form.control}
                    name="activationCodesInput" // Use the textarea field for add mode
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã Key (mỗi key một dòng) <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="KEY123...\nABC456...\nXYZ789..."
                            {...field} 
                            rows={5} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
            )}

            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Sản Phẩm <span className="text-red-500">*</span></FormLabel>
                  <ProductSearchInput
                      value={field.value}
                      onChange={(selectedOption) => {
                        field.onChange(selectedOption ? selectedOption.id : undefined);
                      }}
                      initialProductName={initialProductName}
                      placeholder="Tìm và chọn sản phẩm..."
                      disabled={isEditMode}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng Thái</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(KeyStatus).map(status => (
                        <SelectItem key={status} value={status}>
                          {status} 
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá Nhập</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} min="0" step="any" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi Chú</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Thêm ghi chú (nếu có)..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Lưu Thay Đổi' : 'Thêm Key'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 