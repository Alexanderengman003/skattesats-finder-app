export interface TaxRate {
  kommun: string;
  under18: number;
  age18to64: number;
  over65: number;
  year?: number;
}

export interface SkatteverketData {
  KommunKod: string;
  Kommun: string;
  Skattesats: number;
  År: number;
  Församling: string;
  FörsamlingsKod: string;
  KommunalSkatt: number;
  LandstingsSkatt: number;
  Kyrkoavgift: number;
  BegravningsAvgift: number;
  SummaInklKyrkoavgift: number;
}

export interface SkattetabellData {
  År: number;
  Tabell: number;
  InkomstFrån: number;
  InkomstTill: number;
  Skatt: number;
  AntalDagar?: number;
  Kolumn1?: string;
  Kolumn2?: string;
  Kolumn3?: string;
  Kolumn4?: string;
  Kolumn5?: string;
  Kolumn6?: string;
  Kolumn7?: string;
  [key: string]: any;
}

interface SkatteverketApiResponse {
  results: Array<{
    'kommun': string;
    'år': string;
    'summa, exkl. kyrkoavgift': string;
    'summa, inkl. kyrkoavgift': string;
    'församling': string;
    'församlings-kod': string;
    'kommunal-skatt': string;
    'landstings-skatt': string;
    'kyrkoavgift': string;
    'begravnings-avgift': string;
    [key: string]: string;
  }>;
  resultCount: number;
  offset: number;
  limit: number;
}

interface SkattetabellApiResponse {
  results: Array<{
    'år': string;
    'tabellnr': string;
    'inkomst fr.o.m.': string;
    'inkomst t.o.m.': string;
    'skatt': string;
    'antal dgr'?: string;
    'kolumn 1'?: string;
    'kolumn 2'?: string;
    'kolumn 3'?: string;
    'kolumn 4'?: string;
    'kolumn 5'?: string;
    'kolumn 6'?: string;
    'kolumn 7'?: string;
    [key: string]: string | undefined;
  }>;
  resultCount: number;
  offset: number;
  limit: number;
}

export const fetchTaxData = async (): Promise<{ data: SkatteverketData[], years: number[] }> => {
  try {
    let allData: SkatteverketData[] = [];
    let offset = 0;
    const limit = 500;
    let hasMoreData = true;

    console.log('Starting to fetch tax data with pagination...');

    while (hasMoreData) {
      const url = `https://skatteverket.entryscape.net/rowstore/dataset/c67b320b-ffee-4876-b073-dd9236cd2a99?_limit=${limit}&_offset=${offset}`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiResponse: SkatteverketApiResponse = await response.json();
      
      console.log(`Fetched batch: offset=${offset}, limit=${limit}, results=${apiResponse.results?.length}, total=${apiResponse.resultCount}`);
      
      if (!apiResponse.results || apiResponse.results.length === 0) {
        hasMoreData = false;
        break;
      }

      const batchData: SkatteverketData[] = apiResponse.results.map(item => ({
        KommunKod: item['församlings-kod']?.substring(0, 4) || '',
        Kommun: item.kommun.toUpperCase(),
        Skattesats: parseFloat(item['summa, exkl. kyrkoavgift']),
        År: parseInt(item.år),
        Församling: item.församling,
        FörsamlingsKod: item['församlings-kod'],
        KommunalSkatt: parseFloat(item['kommunal-skatt'] || '0'),
        LandstingsSkatt: parseFloat(item['landstings-skatt'] || '0'),
        Kyrkoavgift: parseFloat(item['kyrkoavgift'] || '0'),
        BegravningsAvgift: parseFloat(item['begravnings-avgift'] || '0'),
        SummaInklKyrkoavgift: parseFloat(item['summa, inkl. kyrkoavgift'] || '0')
      }));

      allData = [...allData, ...batchData];
      
      if (apiResponse.results.length < limit || offset + limit >= apiResponse.resultCount) {
        hasMoreData = false;
      } else {
        offset += limit;
      }
    }
    
    console.log(`Total data fetched: ${allData.length} records`);
    
    const allYears = allData.map(item => item.År);
    const years = [...new Set(allYears)].sort((a, b) => b - a);
    
    console.log('All unique years found:', years);
    
    return { data: allData, years };
  } catch (error) {
    console.error('Error fetching tax data:', error);
    return { data: [], years: [] };
  }
};

export const findTaxRateFromAPI = (
  data: SkatteverketData[], 
  kommun: string, 
  year: number,
  församling?: string
): SkatteverketData[] => {
  return data.filter(
    item => item.Kommun === kommun && item.År === year && 
    (församling ? item.Församling === församling : true)
  );
};

export const getAvailableMunicipalities = (data: SkatteverketData[], year: number): string[] => {
  return [...new Set(data
    .filter(item => item.År === year)
    .map(item => item.Kommun)
  )].sort();
};

export const getAvailableForsamlingar = (data: SkatteverketData[], kommun: string, year: number): string[] => {
  return [...new Set(data
    .filter(item => item.Kommun === kommun && item.År === year)
    .map(item => item.Församling)
  )].sort();
};

export const fetchSkattetabellData = async (year: number, tabell: number): Promise<SkattetabellData[]> => {
  try {
    let allData: SkattetabellData[] = [];
    let offset = 0;
    const limit = 500;
    let hasMoreData = true;

    console.log(`Starting to fetch skattetabell data for year ${year} and table ${tabell}...`);

    while (hasMoreData) {
      // Use the correct parameter names from the API documentation
      const url = `https://skatteverket.entryscape.net/rowstore/dataset/88320397-5c32-4c16-ae79-d36d95b17b95?_limit=${limit}&_offset=${offset}&år=${year}&tabellnr=${tabell}`;
      
      console.log(`Fetching skattetabell with URL: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiResponse: SkattetabellApiResponse = await response.json();
      
      console.log(`Fetched skattetabell batch: offset=${offset}, limit=${limit}, results=${apiResponse.results?.length}, total=${apiResponse.resultCount}`);
      
      if (!apiResponse.results || apiResponse.results.length === 0) {
        hasMoreData = false;
        break;
      }

      const batchData: SkattetabellData[] = apiResponse.results.map(item => ({
        År: parseInt(item.år),
        Tabell: parseInt(item.tabellnr),
        InkomstFrån: parseInt(item['inkomst fr.o.m.']),
        InkomstTill: parseInt(item['inkomst t.o.m.']),
        Skatt: parseInt(item.skatt),
        AntalDagar: item['antal dgr'] ? parseInt(item['antal dgr']) : undefined,
        Kolumn1: item['kolumn 1'] || undefined,
        Kolumn2: item['kolumn 2'] || undefined,
        Kolumn3: item['kolumn 3'] || undefined,
        Kolumn4: item['kolumn 4'] || undefined,
        Kolumn5: item['kolumn 5'] || undefined,
        Kolumn6: item['kolumn 6'] || undefined,
        Kolumn7: item['kolumn 7'] || undefined,
        ...Object.keys(item).reduce((acc, key) => {
          if (!['år', 'tabellnr', 'inkomst fr.o.m.', 'inkomst t.o.m.', 'skatt', 'antal dgr', 'kolumn 1', 'kolumn 2', 'kolumn 3', 'kolumn 4', 'kolumn 5', 'kolumn 6', 'kolumn 7'].includes(key)) {
            acc[key] = item[key];
          }
          return acc;
        }, {} as Record<string, any>)
      }));

      allData = [...allData, ...batchData];
      
      if (apiResponse.results.length < limit || offset + limit >= apiResponse.resultCount) {
        hasMoreData = false;
      } else {
        offset += limit;
      }
    }
    
    console.log(`Total skattetabell data fetched: ${allData.length} records`);
    return allData;
  } catch (error) {
    console.error('Error fetching skattetabell data:', error);
    return [];
  }
};

// Keep the existing static data as fallback
export const taxData: TaxRate[] = [
  { kommun: 'Stockholm', under18: 0, age18to64: 32.07, over65: 29.52 },
  { kommun: 'Göteborg', under18: 0, age18to64: 33.35, over65: 30.80 },
  { kommun: 'Malmö', under18: 0, age18to64: 34.19, over65: 31.64 },
  { kommun: 'Uppsala', under18: 0, age18to64: 33.25, over65: 30.70 },
  { kommun: 'Västerås', under18: 0, age18to64: 32.89, over65: 30.34 },
  { kommun: 'Örebro', under18: 0, age18to64: 33.56, over65: 31.01 },
  { kommun: 'Linköping', under18: 0, age18to64: 33.25, over65: 30.70 },
  { kommun: 'Helsingborg', under18: 0, age18to64: 33.01, over65: 30.46 },
  { kommun: 'Jönköping', under18: 0, age18to64: 32.80, over65: 30.25 },
  { kommun: 'Norrköping', under18: 0, age18to64: 33.45, over65: 30.90 },
  { kommun: 'Lund', under18: 0, age18to64: 33.19, over65: 30.64 },
  { kommun: 'Umeå', under18: 0, age18to64: 33.09, over65: 30.54 },
  { kommun: 'Gävle', under18: 0, age18to64: 33.78, over65: 31.23 },
  { kommun: 'Borås', under18: 0, age18to64: 32.67, over65: 30.12 },
  { kommun: 'Södertälje', under18: 0, age18to64: 32.45, over65: 29.90 },
  { kommun: 'Eskilstuna', under18: 0, age18to64: 33.56, over65: 31.01 },
  { kommun: 'Karlstad', under18: 0, age18to64: 33.12, over65: 30.57 },
  { kommun: 'Täby', under18: 0, age18to64: 30.89, over65: 28.34 },
  { kommun: 'Växjö', under18: 0, age18to64: 32.98, over65: 30.43 },
  { kommun: 'Halmstad', under18: 0, age18to64: 32.76, over65: 30.21 }
];

export const findTaxRate = (kommun: string, age: number): { rate: number; kategori: string } | null => {
  const municipalityData = taxData.find(
    item => item.kommun.toLowerCase() === kommun.toLowerCase()
  );

  if (!municipalityData) {
    return null;
  }

  if (age < 18) {
    return {
      rate: municipalityData.under18,
      kategori: 'Under 18 år'
    };
  } else if (age <= 64) {
    return {
      rate: municipalityData.age18to64,
      kategori: '18-64 år'
    };
  } else {
    return {
      rate: municipalityData.over65,
      kategori: 'Över 65 år'
    };
  }
};
