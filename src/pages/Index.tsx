
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calculator, MapPin, Calendar, Database } from 'lucide-react';
import TaxRateTable from '@/components/TaxRateTable';
import SkatteverketTable from '@/components/SkatteverketTable';
import { 
  taxData, 
  findTaxRate, 
  fetchTaxData, 
  findTaxRateFromAPI, 
  getAvailableMunicipalities,
  SkatteverketData 
} from '@/utils/taxData';

const Index = () => {
  const [kommun, setKommun] = useState('');
  const [age, setAge] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [result, setResult] = useState<{ rate: number; kategori?: string; kommun?: string; year?: number } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<SkatteverketData[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableMunicipalities, setAvailableMunicipalities] = useState<string[]>([]);
  const [useRealData, setUseRealData] = useState(false);

  useEffect(() => {
    const loadApiData = async () => {
      setLoading(true);
      try {
        const { data, years } = await fetchTaxData();
        setApiData(data);
        setAvailableYears(years);
        if (years.length > 0) {
          setSelectedYear(years[0]); // Set most recent year as default
        }
      } catch (error) {
        console.error('Failed to load API data:', error);
        setError('Kunde inte ladda data från Skatteverket API');
      } finally {
        setLoading(false);
      }
    };

    loadApiData();
  }, []);

  useEffect(() => {
    if (selectedYear && apiData.length > 0) {
      const municipalities = getAvailableMunicipalities(apiData, selectedYear);
      setAvailableMunicipalities(municipalities);
    }
  }, [selectedYear, apiData]);

  const handleLookup = () => {
    setError('');
    setResult(null);

    if (useRealData) {
      // Use real API data
      if (!kommun.trim() || !selectedYear) {
        setError('Vänligen välj både kommun och år');
        return;
      }

      const taxRate = findTaxRateFromAPI(apiData, kommun.trim(), selectedYear);
      if (taxRate) {
        setResult(taxRate);
      } else {
        setError('Kommun inte hittad för det valda året. Kontrollera stavningen och försök igen.');
      }
    } else {
      // Use static data (original functionality)
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
              <p className="text-gray-600">Hitta din kommuns skattesats med riktig data från Skatteverket</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Data Source Toggle */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Datakälla
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Button
                    variant={!useRealData ? "default" : "outline"}
                    onClick={() => setUseRealData(false)}
                    className="flex-1"
                  >
                    Statisk Data
                  </Button>
                  <Button
                    variant={useRealData ? "default" : "outline"}
                    onClick={() => setUseRealData(true)}
                    className="flex-1"
                    disabled={loading || apiData.length === 0}
                  >
                    Skatteverket API
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Sök Skattesats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {useRealData ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="year" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        År
                      </Label>
                      <Select onValueChange={(value) => setSelectedYear(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Välj år" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableYears.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="kommun" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Kommun
                      </Label>
                      <Select onValueChange={(value) => setKommun(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Välj kommun" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMunicipalities.map((municipality) => (
                            <SelectItem key={municipality} value={municipality}>
                              {municipality}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}

                <Button 
                  onClick={handleLookup} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                  size="lg"
                  disabled={loading}
                >
                  <Search className="mr-2 h-5 w-5" />
                  {loading ? 'Laddar...' : 'Sök Skattesats'}
                </Button>

                {/* Results */}
                {result && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-green-800 mb-2">
                        Skattesats för {result.kommun || kommun}
                        {result.year && ` (${result.year})`}
                      </h3>
                      <div className="text-3xl font-bold text-green-700 mb-2">
                        {result.rate}%
                      </div>
                      {result.kategori && (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {result.kategori}
                        </Badge>
                      )}
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
                <CardTitle>
                  {useRealData ? 'Skatteverkets Data' : 'Skattesatser per Kommun och Ålder'}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {useRealData 
                    ? `Officiell data från Skatteverket ${selectedYear ? `för år ${selectedYear}` : ''}`
                    : 'Komplett lista över alla kommuners skattesatser'
                  }
                </p>
              </CardHeader>
              <CardContent className="p-0">
                {useRealData ? (
                  selectedYear ? (
                    <SkatteverketTable data={apiData} selectedYear={selectedYear} />
                  ) : (
                    <div className="p-4 text-center text-gray-500">Välj ett år för att se data</div>
                  )
                ) : (
                  <TaxRateTable data={taxData} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
