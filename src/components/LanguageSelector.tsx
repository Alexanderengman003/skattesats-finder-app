
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Languages className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 flex-shrink-0" />
      <Select value={language} onValueChange={(value: 'sv' | 'en') => setLanguage(value)}>
        <SelectTrigger className="w-20 sm:w-32 h-8 sm:h-10 text-xs sm:text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="min-w-[80px] sm:min-w-[128px]">
          <SelectItem value="sv" className="text-xs sm:text-sm">{t('swedish')}</SelectItem>
          <SelectItem value="en" className="text-xs sm:text-sm">{t('english')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
