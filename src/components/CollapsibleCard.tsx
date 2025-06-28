
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CollapsibleCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  headerClassName?: string;
  contentClassName?: string;
}

const CollapsibleCard = ({ 
  title, 
  icon, 
  children, 
  defaultOpen = true,
  headerClassName = "bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-t-xl",
  contentClassName = "p-6 bg-blue-50 rounded-b-xl"
}: CollapsibleCardProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="shadow-lg rounded-xl">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className={`${headerClassName} cursor-pointer hover:opacity-90 transition-opacity`}>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {icon}
                {title}
              </div>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 p-1 h-6 w-6">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className={contentClassName}>
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CollapsibleCard;
