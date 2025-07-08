import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/utils";
import React from "react";

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
  minDate,
  maxDate,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] pl-3 text-left font-normal",
              !value && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            {value ? format(value, "PPP") : <span>{placeholder}</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={(date) =>!! ((maxDate && date > maxDate) || (minDate && date < minDate))}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
};