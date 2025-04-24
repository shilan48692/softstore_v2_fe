import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ImageOff, Edit, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
// Assuming you have a Product type definition in @/types or similar
// Adjust the import path if necessary
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-700 border-green-200 text-xs font-medium"
        >
          <CheckCircle className="mr-1 h-3 w-3" />
          Hoạt động
        </Badge>
      );
    case 'inactive':
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-700 border-gray-200 text-xs font-medium"
        >
          <XCircle className="mr-1 h-3 w-3" />
          Ngừng bán
        </Badge>
      );
     // Add other statuses if needed (e.g., 'draft', 'archived')
    default:
       // Fallback or handle unknown status
      return (
        <Badge variant="outline" className="text-xs font-medium">
          <Clock className="mr-1 h-3 w-3" />
          {status || 'Không rõ'}
        </Badge>
      );
  }
};

export function ProductCard({ product }: ProductCardProps) {
  // Determine image URL: Prioritize images array, fallback to imageUrl
  let imageUrl: string | null = null;
  if (product.images && product.images.length > 0 && product.images[0].url) {
      imageUrl = product.images[0].url;
  } else if (product.imageUrl) { // Check if imageUrl exists and is not empty
      imageUrl = product.imageUrl;
  }

  // Ensure promotional_price is considered only if it's lower than price and not null/undefined
  const hasPromotionalPrice =
    product.promotionPrice != null &&
    typeof product.originalPrice === 'number' && // Ensure originalPrice is a number
    product.promotionPrice < product.originalPrice;

  return (
    <TooltipProvider delayDuration={100}>
      <Card className="flex items-start gap-4 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out overflow-hidden">
        {/* Image Section */}
        <div className="w-24 flex-shrink-0">
          <AspectRatio ratio={4 / 3} className="bg-muted rounded-md overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name ?? 'Product image'} // Provide default alt text
                fill
                className="object-cover" // rounded-md applied to parent
                sizes="(max-width: 768px) 25vw, (max-width: 1024px) 15vw, 10vw" // More optimized sizes
                priority={false} // Only set priority=true for above-the-fold images
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50">
                <ImageOff className="h-8 w-8" />
              </div>
            )}
          </AspectRatio>
        </div>

        {/* Info Section */}
        <div className="flex-grow min-w-0"> {/* Added min-w-0 for text truncation */}
          <h3 className="text-base font-semibold text-gray-800 mb-1 leading-tight truncate" title={product.name}>
            {/* Use Link for product name to navigate to detail page if needed */}
            <Link href={`/products/${product.slug}`} className="hover:text-indigo-600 transition-colors">
                {product.name}
            </Link>
          </h3>
          {product.game_code && (
             <Badge variant="secondary" className="text-xs px-2 py-0.5 mb-2 font-normal">
               {product.game_code}
             </Badge>
          )}
          <div className="flex items-baseline gap-2 mb-1 flex-wrap"> {/* Added flex-wrap */}
            <span className="text-indigo-600 font-medium text-sm sm:text-base"> {/* Responsive text size */}
              {hasPromotionalPrice
                ? (typeof product.promotionPrice === 'number'
                  ? product.promotionPrice.toLocaleString('vi-VN', {
                     style: 'currency',
                     currency: 'VND',
                   })
                  : 'N/A') // Fallback for invalid promotional price
                : (typeof product.originalPrice === 'number' // Use originalPrice
                  ? product.originalPrice.toLocaleString('vi-VN', {
                     style: 'currency',
                     currency: 'VND',
                   })
                  : 'N/A') // Fallback for invalid price
              }
            </span>
            {hasPromotionalPrice && (
              <span className="line-through text-gray-400 text-xs sm:text-sm">
                {typeof product.originalPrice === 'number' // Use originalPrice
                 ? product.originalPrice.toLocaleString('vi-VN', {
                   style: 'currency',
                   currency: 'VND',
                 })
                 : '' // Don't show strike-through if base price is invalid
                }
              </span>
            )}
          </div>
           {/* Ensure stock exists before displaying */}
           {typeof product.quantity === 'number' && (
            <div className={cn(
                "text-sm font-medium",
                product.quantity > 0 ? "text-green-600" : "text-red-600"
             )}>
               {product.quantity > 0 ? `🟢 Còn: ${product.quantity}` : '🔴 Hết hàng'}
             </div>
           )}
        </div>

        {/* Status & Actions Section */}
        <div className="flex flex-col items-end justify-between flex-shrink-0 ml-auto space-y-2 min-h-[60px]"> {/* Added ml-auto */}
           {getStatusBadge(product.status)}
          <Tooltip>
            <TooltipTrigger asChild>
              {/* Ensure the edit link is correct, adjust if needed */}
              <Link href={`/products/edit/${product.slug}`} passHref legacyBehavior>
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-indigo-600">
                   <span className="sr-only">Chỉnh sửa</span>
                   <Edit className="h-4 w-4" />
                 </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Chỉnh sửa sản phẩm</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </Card>
    </TooltipProvider>
  );
} 