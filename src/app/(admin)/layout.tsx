import AdminLayout from "@/components/layouts/AdminLayout";

// Layout này sẽ áp dụng cho tất cả các trang trong route group (admin)
export default function AdminPagesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AdminLayout>{children}</AdminLayout>
    );
} 