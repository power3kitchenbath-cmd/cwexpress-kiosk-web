import { useState } from "react";
import { format, subDays, startOfMonth } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DesignGalleryDateFilterProps {
  onDateChange: (dateFrom: string | undefined, dateTo: string | undefined) => void;
}

export function DesignGalleryDateFilter({ onDateChange }: DesignGalleryDateFilterProps) {
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [preset, setPreset] = useState<string>("all");
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetChange = (value: string) => {
    setPreset(value);
    const today = new Date();
    
    switch (value) {
      case "last7":
        const from7 = subDays(today, 7);
        setDateRange({ from: from7, to: today });
        onDateChange(from7.toISOString(), today.toISOString());
        break;
      case "last30":
        const from30 = subDays(today, 30);
        setDateRange({ from: from30, to: today });
        onDateChange(from30.toISOString(), today.toISOString());
        break;
      case "thisMonth":
        const fromMonth = startOfMonth(today);
        setDateRange({ from: fromMonth, to: today });
        onDateChange(fromMonth.toISOString(), today.toISOString());
        break;
      case "custom":
        // Keep existing custom range or clear
        if (!dateRange.from) {
          setDateRange({ from: undefined, to: undefined });
          onDateChange(undefined, undefined);
        }
        break;
      case "all":
      default:
        setDateRange({ from: undefined, to: undefined });
        onDateChange(undefined, undefined);
        break;
    }
  };

  const handleCustomDateChange = (range: DateRange | undefined) => {
    if (!range) {
      setDateRange({ from: undefined, to: undefined });
      onDateChange(undefined, undefined);
      return;
    }

    setDateRange(range);
    setPreset("custom");
    
    if (range.from && range.to) {
      onDateChange(range.from.toISOString(), range.to.toISOString());
    } else if (range.from) {
      onDateChange(range.from.toISOString(), undefined);
    } else {
      onDateChange(undefined, undefined);
    }
  };

  const clearFilter = () => {
    setDateRange({ from: undefined, to: undefined });
    setPreset("all");
    onDateChange(undefined, undefined);
  };

  const hasActiveFilter = preset !== "all" || dateRange.from || dateRange.to;

  return (
    <div className="flex items-center gap-2">
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Filter by date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="last7">Last 7 Days</SelectItem>
          <SelectItem value="last30">Last 30 Days</SelectItem>
          <SelectItem value="thisMonth">This Month</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {preset === "custom" && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !dateRange.from && "text-muted-foreground"
              )}
            >
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "MMM d, yyyy")} -{" "}
                    {format(dateRange.to, "MMM d, yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "MMM d, yyyy")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleCustomDateChange}
              numberOfMonths={2}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      )}

      {hasActiveFilter && (
        <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={clearFilter}>
          <span className="text-xs">
            {preset === "last7" && "Last 7 Days"}
            {preset === "last30" && "Last 30 Days"}
            {preset === "thisMonth" && "This Month"}
            {preset === "custom" && dateRange.from && (
              <>
                {dateRange.to
                  ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
                  : format(dateRange.from, "MMM d, yyyy")}
              </>
            )}
          </span>
          <X className="h-3 w-3" />
        </Badge>
      )}
    </div>
  );
}
