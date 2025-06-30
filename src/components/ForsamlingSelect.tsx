
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Church, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();

  return (
    <div className="space-y-2">
      <label htmlFor="forsamling" className="flex items-center gap-2 text-sm font-medium">
        <Church className="h-4 w-4" />
        {t('parish')}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                {t('parishTooltip')}{' '}
                <a 
                  href="https://www.svenskakyrkan.se/sokforsamling" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800 transition-colors"
                >
                  här
                </a>
              </p>
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
          <SelectValue placeholder={t('selectParish')} />
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
