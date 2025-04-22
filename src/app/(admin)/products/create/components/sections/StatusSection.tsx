"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";

export interface StatusData {
  status: 'ACTIVE' | 'INACTIVE';
}

interface StatusSectionProps {
  formState: {
    status: string;
  };
  updateFormState: (data: StatusData) => void;
}

export function StatusSection({ formState, updateFormState }: StatusSectionProps) {
  const status = formState.status || 'ACTIVE';

  const handleStatusChange = (value: string) => {
    updateFormState({ status: value as 'ACTIVE' | 'INACTIVE' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trạng thái sản phẩm</CardTitle>
        <CardDescription>
          Cấu hình trạng thái hiển thị của sản phẩm trong cửa hàng
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="product-status">Trạng thái</Label>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger id="product-status">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Hoạt động</SelectItem>
              <SelectItem value="INACTIVE">Tạm ẩn</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-start mt-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mr-2 mt-0.5" />
            <p>
              Sản phẩm ở trạng thái <strong>Hoạt động</strong> sẽ hiển thị cho khách hàng. 
              Sản phẩm ở trạng thái <strong>Tạm ẩn</strong> sẽ không hiển thị trên trang chủ hoặc tìm kiếm.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default StatusSection; 