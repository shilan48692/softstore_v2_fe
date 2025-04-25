'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { productApi, Product } from '@/services/api';
import { useDebounce } from '@/app/(admin)/products/create/components/sections/useDebounce'; // Adjust path if necessary

interface ProductSearchInputProps {
  value: string | null | undefined; // Currently selected Product ID (remains ID for form state)
  onChange: (value: ProductOption | undefined) => void; // Callback with selected ProductOption or undefined
  initialProductName?: string | null; // Optional: Initial display name for edit mode
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export type ProductOption = Pick<Product, 'id' | 'name'>;

export const ProductSearchInput: React.FC<ProductSearchInputProps> = ({
  value,
  onChange,
  initialProductName,
  placeholder = "Tìm sản phẩm...",
  disabled = false,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms debounce delay
  const [searchResults, setSearchResults] = useState<ProductOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState<string | null>(initialProductName ?? null);

  const popoverTriggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Effect to update display name when initialProductName or value changes
  useEffect(() => {
    if (initialProductName) {
      setSelectedProductName(initialProductName);
    } else if (!value) { // Clear name if value becomes null/undefined
      setSelectedProductName(null);
    } else {
      // If value exists but no initial name, we might not have the name readily available
      // Keep existing name if available, otherwise, it might show ID or be null initially
      // This logic depends on whether the parent component can provide initialProductName reliably
    }
  }, [value, initialProductName]);

  // Effect to focus input when popover opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Effect to search when debounced term changes
  useEffect(() => {
    let isMounted = true;
    const searchProducts = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.trim().length < 1) {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const results = await productApi.searchByName(debouncedSearchTerm);
        if (isMounted) {
          setSearchResults(results || []);
        }
      } catch (error) {
        console.error("Error searching products:", error);
        if (isMounted) {
          setSearchResults([]); // Clear results on error
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    searchProducts();

    return () => {
      isMounted = false;
    };
    // Depend on the debounced search term
  }, [debouncedSearchTerm]);

  const handleSelect = (selectedId: string) => {
    const selectedProduct = searchResults.find(p => p.id === selectedId);
    if (selectedProduct) {
      onChange(selectedProduct);
      setSelectedProductName(selectedProduct.name);
    } else {
      // Handle case where selectedId isn't found (shouldn't happen)
      onChange(undefined);
      setSelectedProductName(null);
    }
    setOpen(false);
    setSearchTerm(''); // Clear search term after selection
    setSearchResults([]); // Clear results after selection
  };

  const handleClear = (e?: React.MouseEvent<SVGSVGElement>) => {
      e?.stopPropagation(); // Prevent popover trigger if inside button
      onChange(undefined);
      setSelectedProductName(null);
      setSearchTerm('');
      setSearchResults([]);
      setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled} ref={popoverTriggerRef}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", !selectedProductName && "text-muted-foreground", className)}
          onClick={() => setOpen(!open)}
        >
          {selectedProductName ? (
             <span className="truncate">{selectedProductName}</span>
          ) : (
            placeholder
          )}
          {selectedProductName && !disabled ? (
                <X className="ml-2 h-4 w-4 shrink-0 opacity-50" onClick={(e) => handleClear(e)} />
            ) : (
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
         className="w-full p-0" 
         style={{ width: popoverTriggerRef.current?.offsetWidth ? `${popoverTriggerRef.current.offsetWidth}px` : 'auto' }}
         align="start"
         onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}> {/* Disable default filtering */} 
          <CommandInput
            ref={inputRef}
            placeholder={placeholder}
            value={searchTerm}
            onValueChange={setSearchTerm}
            disabled={disabled}
          />
          <CommandList>
            {isLoading && (
                <div className="p-2 flex items-center justify-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tìm...
                </div>
            )}
            {!isLoading && searchResults.length === 0 && searchTerm && (
              <CommandEmpty>Không tìm thấy sản phẩm.</CommandEmpty>
            )}
             {!isLoading && searchResults.length === 0 && !searchTerm && (
                 <CommandEmpty>Gõ để tìm kiếm sản phẩm.</CommandEmpty>
             )}   
            {!isLoading && searchResults.length > 0 && (
              <CommandGroup>
                {searchResults.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.id} // Use ID for value to match selection
                    onSelect={() => handleSelect(product.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === product.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {product.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}; 