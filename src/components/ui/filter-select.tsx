import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from '@/utils';
import { Skeleton } from "@/components/ui/skeleton";

interface FilterSelectProps<T> {
  data: T[];
  value: string | null;
  onChange: (value: T | null) => void;
  getLabel: (item: T) => React.ReactNode;
  getValue: (item: T) => string;
  placeholder?: string;
  allLabel?: React.ReactNode;
  showAll?: boolean;
  disabled?: boolean;
  loading?: boolean;
  filterOption?: (item: T, search: string) => boolean;
  className?: string; // Thêm cho button/select
  dropdownClassName?: string; // Thêm cho popover content
  itemClassName?: string; // Thêm cho từng item
}

function FilterSelect<T>({
  data,
  value,
  onChange,
  getLabel,
  getValue,
  placeholder = "Select...",
  allLabel = "All",
  showAll = true,
  disabled = false,
  loading = false,
  filterOption,
  className = "",
  dropdownClassName = "",
  itemClassName = "",
}: FilterSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setSearchTerm("");
  };

  const filtered = data.filter((item) =>
    filterOption
      ? filterOption(item, searchTerm)
      : true
  );

  const selectedItem = data.find((item) => getValue(item) === value) || null;
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-9 w-full flex justify-between", className)}
          disabled={disabled}
        >
          <span>
            {selectedItem ? getLabel(selectedItem) : placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-[220px] p-0 max-h-[300px]", dropdownClassName)} align="start">
        <Command className="max-h-[300px]">
          <div className="sticky top-0 border-b px-3 bg-background z-10">
            <CommandInput
              placeholder={`Search...`}
              className="h-9"
              value={searchTerm}
              onValueChange={setSearchTerm}
              disabled={loading}
            />
          </div>
          {loading ? (
            <div className="p-4 flex justify-center items-center">
              <Skeleton className="w-6 h-6 rounded-full mr-2" />
              <span className="text-muted-foreground text-sm">Loading...</span>
            </div>
          ) : (
            <>
              <CommandEmpty>No results found</CommandEmpty>
              <CommandGroup className="overflow-y-auto">
                {showAll && (
                  <CommandItem
                    className={itemClassName}
                    onSelect={() => {
                      onChange(null);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === null ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>{allLabel}</span>
                  </CommandItem>
                )}
                {filtered.map((item) => (
                  <CommandItem
                    key={getValue(item)}
                    className={itemClassName}
                    onSelect={() => {
                      onChange(item);
                      setOpen(false);
                    }}
                    value={getValue(item)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === getValue(item) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {getLabel(item)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default FilterSelect;