
import React, { useState } from 'react';
import { Languages, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (newLanguage: 'sv' | 'en') => {
    setLanguage(newLanguage);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <Languages className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-32 p-2">
        <div className="space-y-1">
          <Button
            variant={language === 'sv' ? 'default' : 'ghost'}
            size="sm"
            className="w-full justify-start text-sm"
            onClick={() => handleLanguageChange('sv')}
          >
            {t('swedish')}
          </Button>
          <Button
            variant={language === 'en' ? 'default' : 'ghost'}
            size="sm"
            className="w-full justify-start text-sm"
            onClick={() => handleLanguageChange('en')}
          >
            {t('english')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LanguageSelector;
