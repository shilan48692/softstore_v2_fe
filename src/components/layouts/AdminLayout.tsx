'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Package, 
  Key, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Menu, 
  X,
  ChevronRight,
  Home,
  LogOut
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import apiClient from '@/services/api';
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

interface AdminInfo {
  fullName?: string;
  email?: string;
}

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin');
    if (storedAdmin) {
      try {
        setAdminInfo(JSON.parse(storedAdmin));
      } catch (e) {
        console.error("Failed to parse admin info from localStorage", e);
        localStorage.removeItem('admin');
      }
    }
  }, []);

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

  const handleSignOut = async () => {
    try {
      await apiClient.post('/admin/auth/logout');
      
      localStorage.removeItem('admin');
      setAdminInfo(null);
      
      router.push('/login');
      
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  const getInitials = (name?: string) => {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

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
          
          {/* User Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {adminInfo ? getInitials(adminInfo.fullName) : 'A'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {adminInfo?.fullName || 'Admin'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {adminInfo?.email || 'admin@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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