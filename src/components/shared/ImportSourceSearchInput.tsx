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
// Import the new API function and types
import { importSourceApi, ImportSource } from '@/services/api'; 
// Assuming useDebounce is globally accessible or adjust path
import { useDebounce } from '@/app/(admin)/products/create/components/sections/useDebounce'; 

// Define the props for the new component
interface ImportSourceSearchInputProps {
  // value prop can now be the object or undefined/null
  value: ImportSourceOption | null | undefined; 
  // onChange now returns the selected object or undefined
  onChange: (value: ImportSourceOption | undefined) => void; 
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Define the option type based on API response
// Ensure this is exported if needed elsewhere
export type ImportSourceOption = Pick<ImportSource, 'id' | 'name'>;

// Rename the component
export const ImportSourceSearchInput: React.FC<ImportSourceSearchInputProps> = ({
  value, // value is now ImportSourceOption | null | undefined
  onChange,
  placeholder = "Tìm hoặc nhập nguồn nhập...",
  disabled = false,
  className,
}) => {
  const [open, setOpen] = useState(false);
  // Initialize searchTerm with the current value's name if provided
  const [searchTerm, setSearchTerm] = useState(value?.name ?? ''); 
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms debounce delay
  const [searchResults, setSearchResults] = useState<ImportSourceOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Selected state holds the full object or null
  const [selectedSource, setSelectedSource] = useState<ImportSourceOption | null>(value ?? null);

  const popoverTriggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Effect to update internal state when the external value changes
  useEffect(() => {
      setSelectedSource(value ?? null);
      // Update searchTerm to reflect the external value's name when popover is closed
      if (!open) {
          setSearchTerm(value?.name ?? '');
      }
  }, [value, open]);


  // Effect to focus input when popover opens
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      // Start searching immediately if there's an initial value
      if (value?.name && searchResults.length === 0) {
          setSearchTerm(value.name); // Trigger search via debounced term
      }
    }
  }, [open, value]); // value dependency remains


  // Effect to search when debounced term changes
  useEffect(() => {
    let isMounted = true;
    const searchImportSources = async () => {
      // Do not search if the term is exactly the currently selected source name
      // UNLESS the search results are empty (e.g., user cleared selection and typed the same name again)
      if (debouncedSearchTerm === selectedSource?.name && searchResults.length > 0) {
          setIsLoading(false);
          return;
      }
      
      if (!debouncedSearchTerm || debouncedSearchTerm.trim().length < 1) {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await importSourceApi.search({ name: debouncedSearchTerm, limit: 15 });
        if (isMounted) {
          setSearchResults(response.data || []); 
        }
      } catch (error) {
        console.error("Error searching import sources:", error);
        if (isMounted) {
          setSearchResults([]); 
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    searchImportSources();

    return () => {
      isMounted = false;
    };
  // Depend also on selectedSource to avoid redundant search if name matches
  }, [debouncedSearchTerm, selectedSource]); 

  const handleSelect = (selectedOption: ImportSourceOption) => {
    onChange(selectedOption); // Pass the full object back
    setSelectedSource(selectedOption);
    setSearchTerm(selectedOption.name); // Update input field to selected name
    setOpen(false);
    setSearchResults([]); // Clear results after selection
  };

  // Handles direct input change - NOW IT CLEARS THE SELECTION
  // because typing means it's no longer a selected source from the list
  const handleInputChange = (term: string) => {
      setSearchTerm(term);
      // If user types, deselect any previously selected source ID
      if (selectedSource) {
          setSelectedSource(null);
          onChange(undefined); // Signal that the selection is cleared
      }
      // We don't call onChange(term) here because the value is an object or undefined
      // The parent component should decide what to do if the text doesn't match a selection
      // For KeyDialog, we might want to prevent saving if no valid source is selected.
  };

  // Clear selection
  const handleClear = (e?: React.MouseEvent<SVGSVGElement>) => {
      e?.stopPropagation(); 
      onChange(undefined);
      setSelectedSource(null);
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
          // Display the selected source's name or placeholder
          className={cn("w-full justify-between", !selectedSource?.name && "text-muted-foreground", className)}
          onClick={() => setOpen(!open)}
        >
          {selectedSource?.name ? (
             <span className="truncate">{selectedSource.name}</span>
          ) : (
             // Show search term if user was typing but didn't select
             searchTerm || placeholder
          )}
          {/* Show clear button only if there's a selected source */}
          {selectedSource && !disabled ? (
                <X className="ml-2 h-4 w-4 shrink-0 opacity-50 cursor-pointer" onClick={handleClear} />
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
        <Command shouldFilter={false}> 
          <CommandInput
            ref={inputRef}
            placeholder={placeholder}
            value={searchTerm} // Input always shows searchTerm
            onValueChange={handleInputChange} // Use handleInputChange here
            disabled={disabled}
          />
          <CommandList>
            {isLoading && (
                <div className="p-2 flex items-center justify-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tìm...
                </div>
            )}
            {/* Modify empty state messages - Emphasize selection */}
            {!isLoading && searchResults.length === 0 && searchTerm && (
              <CommandEmpty>Không tìm thấy nguồn nhập. Vui lòng chọn từ danh sách.</CommandEmpty>
            )}
             {!isLoading && searchResults.length === 0 && !searchTerm && (
                 <CommandEmpty>Gõ để tìm nguồn nhập.</CommandEmpty>
             )}   
            {!isLoading && searchResults.length > 0 && (
              <CommandGroup>
                {searchResults.map((source) => (
                  <CommandItem
                    key={source.id}
                    value={source.name} // Still use name for CommandItem value
                    onSelect={() => handleSelect(source)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        // Check ID against selectedSource's ID
                        selectedSource?.id === source.id ? "opacity-100" : "opacity-0" 
                      )}
                    />
                    {source.name}
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