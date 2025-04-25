'use client';

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
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
import { ImportSourceSearchInput, ImportSourceOption } from '@/components/shared/ImportSourceSearchInput';

interface KeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback after successful add/edit
  keyData?: ActivationKey | null; // Data for editing, null/undefined for adding
  products: Pick<Product, 'id' | 'name'>[]; // List of products for select
}

// Schema for the form's internal shape
const KeyFormSchema = z.object({
    activationCodesInput: z.string().min(1, "Cần nhập ít nhất một mã key").optional(), 
    activationCode: z.string().optional(), 
    productId: z.string().min(1, "Vui lòng chọn sản phẩm"),
    status: z.nativeEnum(KeyStatus),
    cost: z.string().refine(value => value === '' || !isNaN(parseFloat(value)), {
      message: "Giá nhập phải là số hoặc để trống",
    }),
    note: z.string().optional(),
    importSource: z.custom<ImportSourceOption | null | undefined>(),
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
      
  // Prepare initial import source object for edit mode
  const initialImportSource = isEditMode && keyData?.importSource 
      ? { id: keyData.importSource.id, name: keyData.importSource.name } 
      : undefined;

  const form = useForm<KeyFormShape>({
    resolver: zodResolver(KeyFormSchema), // Use the form-specific schema
    defaultValues: {
      activationCodesInput: !isEditMode ? '' : undefined, 
      activationCode: isEditMode ? keyData?.activationCode : undefined, 
      productId: keyData?.productId ?? '',
      status: keyData?.status ?? KeyStatus.AVAILABLE,
      cost: keyData?.cost === null || keyData?.cost === undefined ? '' : String(keyData.cost),
      note: keyData?.note ?? '',
      importSource: initialImportSource,
    },
  });

  useEffect(() => {
    // Reset form when dialog opens or keyData changes
    if (isOpen) {
       const currentImportSource = keyData?.importSource 
          ? { id: keyData.importSource.id, name: keyData.importSource.name } 
          : undefined;
      form.reset({
        activationCodesInput: !isEditMode ? '' : undefined,
        activationCode: isEditMode ? keyData?.activationCode : undefined,
        productId: keyData?.productId ?? '',
        status: keyData?.status ?? KeyStatus.AVAILABLE,
        cost: keyData?.cost === null || keyData?.cost === undefined ? '' : String(keyData.cost),
        note: keyData?.note ?? '',
        importSource: currentImportSource,
      });
    }
  }, [isOpen, keyData, form, isEditMode]); // Add isEditMode

  // Use SubmitHandler with the form shape type
  const onSubmit: SubmitHandler<KeyFormShape> = async (values) => {
    setIsSubmitting(true);
    // Extract importSourceId from the selected object
    const importSourceId = values.importSource?.id;
    
    try {
      if (isEditMode && keyData?.id) {
        // Parse with EditKeySchema to get correctly typed API payload
        const editPayload = EditKeySchema.parse({
            status: values.status,
            cost: values.cost, // Schema handles string -> number/null
            note: values.note,
            importSourceId: importSourceId ?? null, // Pass ID or null if cleared
        });
        await keyApi.update(keyData.id, editPayload);
        toast.success('Cập nhật key thành công!');
      } else {
        if (!values.activationCodesInput) {
            form.setError('activationCodesInput', { message: 'Cần nhập ít nhất một mã key' });
            setIsSubmitting(false);
            return;
        }

        const codesArray = values.activationCodesInput
          .split('\n')
          .map(code => code.trim())
          .filter(Boolean); 

        if (codesArray.length === 0) {
            form.setError('activationCodesInput', { message: 'Không tìm thấy mã key hợp lệ nào sau khi xử lý' });
            setIsSubmitting(false);
            return;
        }

        // Parse with BulkCreateKeysSchema
        const bulkPayload = BulkCreateKeysSchema.parse({
            productId: values.productId,
            activationCodes: codesArray,
            status: values.status,
            cost: values.cost, // Schema handles string -> number/null
            note: values.note,
            importSourceId: importSourceId, // Pass ID or undefined
        });

        const result = await keyApi.createBulk(bulkPayload);
        toast.success(`Thêm thành công ${result.count} key mới!`);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving key:", error);
      if (error instanceof z.ZodError) {
          console.error("Zod validation errors:", error.errors);
          error.errors.forEach((err) => {
             // Adjust field mapping if necessary, especially for importSource
             let fieldName = err.path[0] as keyof KeyFormShape | undefined;
              // Map Zod error for importSourceId back to the importSource field
             if (err.path[0] === 'importSourceId' && 'importSource' in KeyFormSchema.shape) {
                fieldName = 'importSource';
             }
             
            if (fieldName && fieldName in KeyFormSchema.shape) { 
                form.setError(fieldName, { type: 'manual', message: err.message });
            } else {
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
              name="importSource"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Nguồn Nhập</FormLabel>
                  <ImportSourceSearchInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Tìm hoặc chọn nguồn nhập..."
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