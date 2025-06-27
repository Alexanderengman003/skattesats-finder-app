import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calculator, MapPin, Calendar, Database } from 'lucide-react';
import TaxRateTable from '@/components/TaxRateTable';
import SkatteverketTable from '@/components/SkatteverketTable';
import KommunSearch from '@/components/KommunSearch';
import ForsamlingSelect from '@/components/ForsamlingSelect';
import { 
  taxData, 
  fetchTaxData, 
  findTaxRateFromAPI, 
  getAvailableMunicipalities,
  getAvailableForsamlingar,
  SkatteverketData 
} from '@/utils/taxData';

const Index = () => {
  const [kommun, setKommun] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [forsamling, setForsamling] = useState('');
  const [result, setResult] = useState<SkatteverketData[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<SkatteverketData[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableMunicipalities, setAvailableMunicipalities] = useState<string[]>([]);
  const [availableForsamlingar, setAvailableForsamlingar] = useState<string[]>([]);

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
      setKommun('');
      setForsamling('');
      setResult([]);
    }
  }, [selectedYear, apiData]);

  useEffect(() => {
    if (kommun && selectedYear && apiData.length > 0) {
      const forsamlingar = getAvailableForsamlingar(apiData, kommun, selectedYear);
      setAvailableForsamlingar(forsamlingar);
      setForsamling('');
      setResult([]);
    }
  }, [kommun, selectedYear, apiData]);

  const handleLookup = () => {
    setError('');
    setResult([]);

    if (!kommun.trim() || !selectedYear) {
      setError('Vänligen välj både kommun och år');
      return;
    }

    if (availableForsamlingar.length > 1 && !forsamling) {
      setError('Denna kommun har flera församlingar. Vänligen välj en församling eller "Vet inte - visa alla"');
      return;
    }

    const selectedForsamling = forsamling === 'unknown' ? undefined : forsamling;
    const taxData = findTaxRateFromAPI(apiData, kommun.trim(), selectedYear, selectedForsamling);
    
    if (taxData.length > 0) {
      setResult(taxData);
    } else {
      setError('Ingen data hittad för den valda kombinationen.');
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
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Sök Skattesats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="year" className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    År
                  </label>
                  <Select 
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                    value={selectedYear?.toString() || ''}
                  >
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
                  <label htmlFor="kommun" className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="h-4 w-4" />
                    Kommun
                  </label>
                  <KommunSearch
                    municipalities={availableMunicipalities}
                    value={kommun}
                    onValueChange={setKommun}
                    disabled={!selectedYear}
                    placeholder={selectedYear ? "Sök kommun..." : "Välj år först"}
                  />
                </div>

                {availableForsamlingar.length > 1 && (
                  <ForsamlingSelect
                    forsamlingar={availableForsamlingar}
                    value={forsamling}
                    onValueChange={setForsamling}
                    disabled={!kommun}
                  />
                )}

                <Button 
                  onClick={handleLookup} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                  size="lg"
                  disabled={loading || !kommun || !selectedYear}
                >
                  <Search className="mr-2 h-5 w-5" />
                  {loading ? 'Laddar...' : 'Sök Skattesats'}
                </Button>

                {/* Results */}
                {result.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {result.map((item, index) => (
                      <div key={index} className="p-6 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="text-lg font-semibold text-green-800 mb-4 text-center">
                          {item.Kommun} - {item.Församling} ({item.År})
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Kommun:</span>
                            <div className="text-lg font-bold text-green-700">{item.Kommun}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Församling:</span>
                            <div className="text-lg font-bold text-green-700">{item.Församling}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Kommunkod:</span>
                            <div className="text-lg font-bold text-green-700">{item.KommunKod}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Församlingskod:</span>
                            <div className="text-lg font-bold text-green-700">{item.FörsamlingsKod}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Total skatt (exkl. kyrka):</span>
                            <div className="text-2xl font-bold text-green-700">{item.Skattesats}%</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Total skatt (inkl. kyrka):</span>
                            <div className="text-2xl font-bold text-green-700">{item.SummaInklKyrkoavgift}%</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Kommunal skatt:</span>
                            <div className="text-lg font-bold text-blue-700">{item.KommunalSkatt}%</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Landstingsskatt:</span>
                            <div className="text-lg font-bold text-blue-700">{item.LandstingsSkatt}%</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Kyrkoavgift:</span>
                            <div className="text-lg font-bold text-purple-700">{item.Kyrkoavgift}%</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Begravningsavgift:</span>
                            <div className="text-lg font-bold text-purple-700">{item.BegravningsAvgift}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
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
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Skatteverkets Data
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Officiell data från Skatteverket {selectedYear ? `för år ${selectedYear}` : ''}
                </p>
              </CardHeader>
              <CardContent className="p-0">
                {selectedYear ? (
                  <SkatteverketTable data={apiData} selectedYear={selectedYear} />
                ) : (
                  <div className="p-4 text-center text-gray-500">Välj ett år för att se data</div>
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
