'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Package, 
  Key, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Menu, 
  X,
  ChevronRight,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  submenu?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Sản phẩm',
    href: '/products',
    icon: <Package className="h-5 w-5" />,
  },
  {
    name: 'Mã kích hoạt',
    href: '/activation-codes',
    icon: <Key className="h-5 w-5" />,
  },
  {
    name: 'Đơn hàng',
    href: '/orders',
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    name: 'Khách hàng',
    href: '/customers',
    icon: <Users className="h-5 w-5" />,
  },
  {
    name: 'Thống kê',
    href: '/statistics',
    icon: <BarChart3 className="h-5 w-5" />,
  },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  // Tạo breadcrumb từ pathname
  const breadcrumbs = pathname.split('/').filter(Boolean);
  
  // Lấy tiêu đề trang từ breadcrumb cuối cùng
  const getPageTitle = (path: string) => {
    const titleMap: { [key: string]: string } = {
      'products': 'Sản Phẩm',
      'activation-codes': 'Mã Kích Hoạt',
      'orders': 'Đơn Hàng',
      'customers': 'Khách Hàng',
      'statistics': 'Thống Kê',
      'create': 'Thêm Mới',
      'edit': 'Chỉnh Sửa'
    };
    return titleMap[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  const pageTitle = breadcrumbs.length > 0 
    ? getPageTitle(breadcrumbs[breadcrumbs.length - 1])
    : 'Trang Chủ';

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-bold text-gray-800">Admin Console</span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive 
                          ? "bg-purple-100 text-purple-700" 
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                      {item.submenu && (
                        <ChevronRight className="ml-auto h-4 w-4" />
                      )}
                    </Link>
                    
                    {/* Submenu (nếu có) */}
                    {item.submenu && isActive && (
                      <ul className="mt-1 ml-6 space-y-1">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                              href={subItem.href}
                              className={cn(
                                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                pathname === subItem.href
                                  ? "bg-purple-100 text-purple-700"
                                  : "text-gray-700 hover:bg-gray-100"
                              )}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        sidebarOpen ? "lg:ml-64" : "ml-0"
      )}>
        {/* Top Bar */}
        <div className="h-16 bg-white shadow-sm flex items-center justify-between px-4">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Breadcrumb */}
            <div className="ml-4 flex items-center">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                <Home className="h-4 w-4" />
              </Link>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb}>
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                  <span className={cn(
                    "text-sm",
                    index === breadcrumbs.length - 1 
                      ? "text-gray-900 font-medium" 
                      : "text-gray-500"
                  )}>
                    {getPageTitle(crumb)}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* User Menu (placeholder) */}
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium">
              A
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 