import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, setHours, setMinutes } from "date-fns";
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
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value);

  React.useEffect(() => {
    setSelectedDate(value);
  }, [value]);

  const handleSelectDate = (date?: Date) => {
    if (!date) return;
    const hours = selectedDate?.getHours() ?? 0;
    const minutes = selectedDate?.getMinutes() ?? 0;
    const updated = setMinutes(setHours(date, hours), minutes);
    setSelectedDate(updated);
    onChange?.(updated);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedDate) return;
    const timeValue = parseInt(e.target.value, 10);
    let updated: Date;
    if (e.target.name === "hours") {
      updated = setHours(selectedDate, timeValue);
    } else {
      updated = setMinutes(selectedDate, timeValue);
    }
    setSelectedDate(updated);
    onChange?.(updated);
  };

  const hoursOptions = Array.from({ length: 24 }, (_, i) => i);
  const minutesOptions = Array.from({ length: 60 }, (_, i) => i);

  return (
    <Popover>
      <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[280px] pl-3 text-left font-normal justify-start",
              !selectedDate && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP p") : <span>{placeholder}</span>}
          </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 space-y-2" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelectDate}
          disabled={(date) =>!! ((maxDate && date > maxDate) || (minDate && date < minDate))}
          captionLayout="dropdown"
        />
        {selectedDate && (
          <div className="flex gap-2 items-center">
            <select
              name="hours"
              value={selectedDate?.getHours() ?? 0}
              onChange={handleTimeChange}
              className="border rounded px-2 py-1 bg-popover text-popover-foreground"
            >
              {hoursOptions.map((hour) => (
                <option key={hour} value={hour} className="bg-popover text-popover-foreground">
                  {hour.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
            <span className="text-popover-foreground">:</span>
            <select
              name="minutes"
              value={selectedDate?.getMinutes() ?? 0}
              onChange={handleTimeChange}
              className="border rounded px-2 py-1 bg-popover text-popover-foreground"
            >
              {minutesOptions.map((minute) => (
                <option key={minute} value={minute} className="bg-popover text-popover-foreground">
                  {minute.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};