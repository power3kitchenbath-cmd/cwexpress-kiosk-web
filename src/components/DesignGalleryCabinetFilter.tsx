import { useState } from "react";
import { Package, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface CabinetRange {
  min: number | undefined;
  max: number | undefined;
}

interface DesignGalleryCabinetFilterProps {
  onRangeChange: (min: number | undefined, max: number | undefined) => void;
}

export function DesignGalleryCabinetFilter({ onRangeChange }: DesignGalleryCabinetFilterProps) {
  const [selectedRange, setSelectedRange] = useState<string>("all");

  const handleRangeChange = (value: string) => {
    setSelectedRange(value);
    
    switch (value) {
      case "1-10":
        onRangeChange(1, 10);
        break;
      case "11-20":
        onRangeChange(11, 20);
        break;
      case "21-50":
        onRangeChange(21, 50);
        break;
      case "50+":
        onRangeChange(51, undefined);
        break;
      case "all":
      default:
        onRangeChange(undefined, undefined);
        break;
    }
  };

  const clearFilter = () => {
    setSelectedRange("all");
    onRangeChange(undefined, undefined);
  };

  const hasActiveFilter = selectedRange !== "all";

  const getRangeLabel = () => {
    switch (selectedRange) {
      case "1-10":
        return "1-10 Cabinets";
      case "11-20":
        return "11-20 Cabinets";
      case "21-50":
        return "21-50 Cabinets";
      case "50+":
        return "50+ Cabinets";
      default:
        return "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedRange} onValueChange={handleRangeChange}>
        <SelectTrigger className="w-[180px]">
          <Package className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Cabinet count" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Counts</SelectItem>
          <SelectItem value="1-10">1-10 Cabinets</SelectItem>
          <SelectItem value="11-20">11-20 Cabinets</SelectItem>
          <SelectItem value="21-50">21-50 Cabinets</SelectItem>
          <SelectItem value="50+">50+ Cabinets</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilter && (
        <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={clearFilter}>
          <span className="text-xs">{getRangeLabel()}</span>
          <X className="h-3 w-3" />
        </Badge>
      )}
    </div>
  );
}
