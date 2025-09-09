import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

export default function MessageTooltip({ message }: { message: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <InfoIcon className="w-4 h-4" />
      </TooltipTrigger>
      <TooltipContent side="right">
        <p className="text-sm whitespace-pre-wrap max-w-xs">{message}</p>
      </TooltipContent>
    </Tooltip>
  );
}
