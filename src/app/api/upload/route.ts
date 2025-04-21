import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // Tạo tên file duy nhất để tránh trùng lặp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalFilename = file.name.split('.').slice(0, -1).join('.'); // Lấy tên gốc không có extension
    const fileExtension = path.extname(file.name); // Lấy extension
    const filename = `${originalFilename}-${uniqueSuffix}${fileExtension}`;

    // Đường dẫn thư mục lưu trữ (trong thư mục public)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, filename);

    // Đảm bảo thư mục uploads tồn tại
    try {
      await mkdir(uploadDir, { recursive: true });
      console.log(`Directory created or already exists: ${uploadDir}`);
    } catch (mkdirError) {
      console.error('Error creating directory:', mkdirError);
      return NextResponse.json({ error: "Could not create upload directory." }, { status: 500 });
    }

    // Đọc buffer từ file
    const buffer = Buffer.from(await file.arrayBuffer());

    // Ghi file vào hệ thống
    await writeFile(filePath, buffer);
    console.log(`File saved to: ${filePath}`);

    // Tạo URL công khai để trả về
    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({ url: publicUrl });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
  }
} 