
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Church, HelpCircle } from 'lucide-react';

interface ForsamlingSelectProps {
  forsamlingar: string[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const ForsamlingSelect = ({ 
  forsamlingar, 
  value, 
  onValueChange, 
  disabled = false 
}: ForsamlingSelectProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor="forsamling" className="flex items-center gap-2 text-sm font-medium">
        <Church className="h-4 w-4" />
        Församling
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Alla som är skrivna i en svensk kommun tillhör en församling. Om du inte vet vilken församling du tillhör kan du hitta det här https://www.svenskakyrkan.se/sokforsamling</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </label>
      <Select 
        onValueChange={onValueChange}
        value={value}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Välj församling" />
        </SelectTrigger>
        <SelectContent>
          {forsamlingar.map((forsamling) => (
            <SelectItem key={forsamling} value={forsamling}>
              {forsamling}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ForsamlingSelect;
