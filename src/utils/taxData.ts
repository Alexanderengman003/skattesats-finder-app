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
}

export const fetchTaxData = async (): Promise<{ data: SkatteverketData[], years: number[] }> => {
  try {
    const response = await fetch('https://skatteverket.entryscape.net/rowstore/dataset/c67b320b-ffee-4876-b073-dd9236cd2a99');
    const data: SkatteverketData[] = await response.json();
    
    // Get unique years from the data
    const years = [...new Set(data.map(item => item.År))].sort((a, b) => b - a);
    
    return { data, years };
  } catch (error) {
    console.error('Error fetching tax data:', error);
    return { data: [], years: [] };
  }
};

export const findTaxRateFromAPI = (
  data: SkatteverketData[], 
  kommun: string, 
  year: number
): SkatteverketData | null => {
  const municipalityData = data.find(
    item => item.Kommun === kommun && item.År === year
  );

  return municipalityData || null;
};

export const getAvailableMunicipalities = (data: SkatteverketData[], year: number): string[] => {
  return [...new Set(data
    .filter(item => item.År === year)
    .map(item => item.Kommun)
  )].sort();
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
