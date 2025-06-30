
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Shield, Calculator, PiggyBank } from 'lucide-react';

interface AdCardProps {
  className?: string;
  showFallback?: boolean;
}

export const AdCard: React.FC<AdCardProps> = ({ 
  className = '', 
  showFallback = true 
}) => {
  // For now, we'll show fallback content. Later you can integrate with AdSense
  const showAd = false; // Set to true when you have ads to display

  if (showAd) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center min-h-[200px] bg-gray-50 rounded">
            <p className="text-gray-500 text-sm">Advertisement Space</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!showFallback) {
    return null;
  }

  // Fallback content with financial services promotion
  const promotions = [
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: "Skatterevisionsförsäkring",
      description: "Skydda dig mot oväntade skatterevisioner med vår försäkring.",
      badge: "Rekommenderat",
      badgeColor: "bg-blue-100 text-blue-800"
    },
    {
      icon: <Calculator className="h-6 w-6 text-green-600" />,
      title: "Professionell Skattehjälp",
      description: "Låt experter hantera din deklaration för maximala avdrag.",
      badge: "Populärt",
      badgeColor: "bg-green-100 text-green-800"
    },
    {
      icon: <PiggyBank className="h-6 w-6 text-purple-600" />,
      title: "ISK vs Kapitalförsäkring",
      description: "Jämför dina investeringsalternativ för bästa skattestrategi.",
      badge: "Nytt",
      badgeColor: "bg-purple-100 text-purple-800"
    }
  ];

  const currentPromotion = promotions[Math.floor(Math.random() * promotions.length)];

  return (
    <Card className={`border-l-4 border-l-blue-500 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {currentPromotion.icon}
            <Badge className={currentPromotion.badgeColor}>
              {currentPromotion.badge}
            </Badge>
          </div>
          <ExternalLink className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">{currentPromotion.title}</h3>
        <p className="text-gray-600 text-sm mb-3">{currentPromotion.description}</p>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors">
          Läs mer
        </button>
      </CardContent>
    </Card>
  );
};
