
import React, { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface KommunSearchProps {
  municipalities: string[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const KommunSearch = ({ 
  municipalities, 
  value, 
  onValueChange, 
  disabled = false, 
  placeholder = "Sök kommun..." 
}: KommunSearchProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value ? value : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-white" align="start">
        <Command>
          <CommandInput 
            placeholder="Sök kommun..." 
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>Ingen kommun hittades.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {municipalities.map((municipality) => (
                <CommandItem
                  key={municipality}
                  value={municipality}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === municipality ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {municipality}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default KommunSearch;
