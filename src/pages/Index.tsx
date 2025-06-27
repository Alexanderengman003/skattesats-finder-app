
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Calculator, MapPin, Calendar } from 'lucide-react';
import TaxRateTable from '@/components/TaxRateTable';
import { taxData, findTaxRate } from '@/utils/taxData';

const Index = () => {
  const [kommun, setKommun] = useState('');
  const [age, setAge] = useState('');
  const [result, setResult] = useState<{ rate: number; kategori: string } | null>(null);
  const [error, setError] = useState('');

  const handleLookup = () => {
    setError('');
    setResult(null);

    if (!kommun.trim() || !age.trim()) {
      setError('Vänligen fyll i både kommun och ålder');
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      setError('Vänligen ange en giltig ålder mellan 0 och 120');
      return;
    }

    const taxRate = findTaxRate(kommun.trim(), ageNum);
    if (taxRate) {
      setResult(taxRate);
    } else {
      setError('Kommun inte hittad. Kontrollera stavningen och försök igen.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Calculator className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Skattesats Lookup</h1>
              <p className="text-gray-600">Hitta din kommuns skattesats baserat på ålder</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Sök Skattesats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kommun" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Kommun
                  </Label>
                  <Input
                    id="kommun"
                    placeholder="T.ex. Stockholm, Göteborg, Malmö..."
                    value={kommun}
                    onChange={(e) => setKommun(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ålder
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Ange din ålder"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    onKeyPress={handleKeyPress}
                    min="0"
                    max="120"
                    className="text-lg"
                  />
                </div>

                <Button 
                  onClick={handleLookup} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                  size="lg"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Sök Skattesats
                </Button>

                {/* Results */}
                {result && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-green-800 mb-2">
                        Skattesats för {kommun}
                      </h3>
                      <div className="text-3xl font-bold text-green-700 mb-2">
                        {result.rate}%
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {result.kategori}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Table Section */}
          <div>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Skattesatser per Kommun och Ålder</CardTitle>
                <p className="text-sm text-gray-600">
                  Komplett lista över alla kommuners skattesatser
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <TaxRateTable data={taxData} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
