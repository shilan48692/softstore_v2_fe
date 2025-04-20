'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Key, ShoppingCart, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';

const HomePage = () => {
  const menuItems = [
    {
      title: 'Sản phẩm',
      description: 'Quản lý danh sách sản phẩm, thêm, sửa, xóa sản phẩm',
      icon: <Package className="h-8 w-8 text-purple-600" />,
      href: '/products',
    },
    {
      title: 'Mã kích hoạt',
      description: 'Quản lý mã kích hoạt, tạo mã mới, kiểm tra trạng thái',
      icon: <Key className="h-8 w-8 text-blue-600" />,
      href: '/activation-codes',
    },
    {
      title: 'Đơn hàng',
      description: 'Xem danh sách đơn hàng, cập nhật trạng thái đơn hàng',
      icon: <ShoppingCart className="h-8 w-8 text-green-600" />,
      href: '/orders',
    },
    {
      title: 'Khách hàng',
      description: 'Quản lý thông tin khách hàng, lịch sử mua hàng',
      icon: <Users className="h-8 w-8 text-amber-600" />,
      href: '/customers',
    },
    {
      title: 'Thống kê',
      description: 'Xem báo cáo, thống kê doanh thu, sản phẩm bán chạy',
      icon: <BarChart3 className="h-8 w-8 text-red-600" />,
      href: '/statistics',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {menuItems.map((item) => (
        <Link href={item.href} key={item.title}>
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
              {item.icon}
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{item.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default HomePage;
