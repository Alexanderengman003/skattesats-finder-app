
import React, { useEffect } from 'react';
import { ExternalLink, Calculator, TrendingUp } from 'lucide-react';

interface AdBannerProps {
  className?: string;
  showFallback?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  className = '', 
  showFallback = true 
}) => {
  // Enable AdSense ads
  const showAd = true;

  useEffect(() => {
    if (showAd) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [showAd]);

  if (showAd) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 ${className}`}>
        <div className="flex items-center justify-center">
          <ins 
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-7512261773678420"
            data-ad-slot="2320949496"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    );
  }

  if (!showFallback) {
    return null;
  }

  // Fallback content with tax tips
  const taxTips = [
    {
      icon: <Calculator className="h-5 w-5 text-blue-600" />,
      title: "Skattetips",
      description: "Kom ihåg att spara kvitton för avdragsgilla kostnader under hela året."
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-green-600" />,
      title: "Pensionssparande",
      description: "Maximera ditt pensionssparande för bättre skatteavdrag nästa år."
    }
  ];

  const currentTip = taxTips[Math.floor(Math.random() * taxTips.length)];

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {currentTip.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">{currentTip.title}</h3>
          <p className="text-gray-700 text-sm mt-1">{currentTip.description}</p>
        </div>
        <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
      </div>
    </div>
  );
};
