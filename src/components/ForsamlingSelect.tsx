
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Church } from 'lucide-react';

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
          <SelectItem value="unknown">Vet inte - visa alla</SelectItem>
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
