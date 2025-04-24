'use client';

import React from 'react';
import { format } from 'date-fns'; // For date formatting
import { Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ActivationKey, KeyStatus } from '@/services/api';
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

interface KeyTableProps {
  keys: ActivationKey[];
  isLoading: boolean;
  onEdit: (key: ActivationKey) => void;
  onDelete: (key: ActivationKey) => void;
  // Optional props for pagination, sorting if handled here
}

// Helper function to get badge color based on status
const getStatusBadgeVariant = (status: KeyStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case KeyStatus.AVAILABLE:
      return "default"; // Greenish/Blueish default
    case KeyStatus.SOLD:
      return "secondary"; // Grayish
    case KeyStatus.USED:
      return "destructive"; // Reddish
    default:
      return "outline";
  }
};

export const KeyTable: React.FC<KeyTableProps> = ({ keys, isLoading, onEdit, onDelete }) => {
  
  if (isLoading) {
    // Render skeleton loaders
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Adjust skeleton count and widths as needed */}
              <TableHead><Skeleton className="h-5 w-32" /></TableHead>
              <TableHead><Skeleton className="h-5 w-24" /></TableHead>
              <TableHead><Skeleton className="h-5 w-20" /></TableHead>
              <TableHead><Skeleton className="h-5 w-32" /></TableHead>
              <TableHead><Skeleton className="h-5 w-24" /></TableHead>
              <TableHead><Skeleton className="h-5 w-16" /></TableHead>
              <TableHead><Skeleton className="h-5 w-24" /></TableHead>
              <TableHead><Skeleton className="h-5 w-12" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!keys || keys.length === 0) {
    return <p className="text-center text-muted-foreground py-4">Không tìm thấy key nào.</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã Key</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Email người dùng</TableHead>
            <TableHead>Ghi chú</TableHead>
            <TableHead>Giá nhập</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((key) => (
            <TableRow key={key.id}>
              <TableCell className="font-medium">{key.activationCode}</TableCell>
              <TableCell>{key.product?.name || key.productId}</TableCell> {/* Display product name or ID */}
              <TableCell>
                <Badge variant={getStatusBadgeVariant(key.status)}>{key.status}</Badge>
              </TableCell>
              <TableCell>{key.userEmail || '-'}</TableCell>
              <TableCell className="max-w-xs truncate" title={key.note || ''}>{key.note || '-'}</TableCell>
              <TableCell>{key.cost != null ? key.cost.toLocaleString('vi-VN') : '-'}</TableCell> {/* Format cost */}
              <TableCell>{format(new Date(key.createdAt), 'dd/MM/yyyy HH:mm')}</TableCell> {/* Format date */}
              <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Mở menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(key)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(key)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}; 