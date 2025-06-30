
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Translations {
  [key: string]: {
    sv: string;
    en: string;
  };
}

const translations: Translations = {
  // Header
  appTitle: { sv: 'Min skatt', en: 'My Tax' },
  appSubtitle: { sv: 'Hitta din inkomstskatt enklare', en: 'Find your income tax the easy way' },
  infoText: { sv: 'Att hitta och förstå den skatt man som anställd i Sverige betalar på sin inkomst kan vara svårt och frustrerande. Denna applikation hjälper dig att snabbt och enkelt hitta exakt hur mycket du ska betala i skatt, så att du slipper leta fram det själv.', en: 'Finding and understanding the tax that you as an employee in Sweden pay on your income can be complicated and frustrating. This application helps you quickly and easily find exactly how much you should pay in tax, so you don\'t have to look it up yourself.' },
  
  // Form sections
  taxRate: { sv: 'Skattesats', en: 'Tax Rate' },
  personalInfo: { sv: 'Personuppgifter', en: 'Personal Information' },
  incomeInfo: { sv: 'Inkomstuppgifter', en: 'Income Information' },
  
  // Form fields
  incomeYear: { sv: 'Inkomstår', en: 'Income Year' },
  selectYear: { sv: 'Välj år', en: 'Select Year' },
  municipality: { sv: 'Kommun', en: 'Municipality' },
  searchMunicipality: { sv: 'Sök kommun...', en: 'Search municipality...' },
  selectYearFirst: { sv: 'Välj år först', en: 'Select year first' },
  parish: { sv: 'Församling', en: 'Parish' },
  selectParish: { sv: 'Välj församling', en: 'Select Parish' },
  birthDate: { sv: 'Födelsedatum', en: 'Birth Date' },
  selectBirthDate: { sv: 'Välj födelsedatum', en: 'Select birth date' },
  swedishChurchMember: { sv: 'Medlem i svenska kyrkan', en: 'Member of Swedish Church' },
  
  // Income fields
  monthlyIncome: { sv: 'Månadsinkomst (kr)', en: 'Monthly Income (SEK)' },
  enterMonthlyIncome: { sv: 'Ange månadsinkomst', en: 'Enter monthly income' },
  taxableBenefit: { sv: 'Skattepliktig förmån (kr)', en: 'Taxable Benefit (SEK)' },
  enterTaxableBenefit: { sv: 'Ange skattepliktig förmån', en: 'Enter taxable benefit' },
  incomeType: { sv: 'Typ av inkomst', en: 'Type of Income' },
  selectIncomeType: { sv: 'Välj inkomsttyp', en: 'Select income type' },
  
  // Income types
  salary: { sv: 'Lön, arvode och liknande ersättningar', en: 'Salary, fees and similar compensation' },
  pension: { sv: 'Pension och andra ersättningar', en: 'Pension and other benefits' },
  disability: { sv: 'Sjuk- och aktivitetsersättning', en: 'Sickness and activity compensation' },
  unemployment: { sv: 'Ersättning från arbetslöshetskassa', en: 'Unemployment benefits' },
  
  // Vacation pay
  vacationPay: { sv: 'Semestertillägg', en: 'Vacation Pay' },
  collectiveAgreement: { sv: 'Kollektivavtal', en: 'Collective Agreement' },
  vacationDays: { sv: 'Antal semesterdagar', en: 'Number of Vacation Days' },
  variableSalary: { sv: 'Rörlig lön per månad (kr)', en: 'Variable Salary per Month (SEK)' },
  variableMonthlySalary: { sv: 'Rörlig månadslön', en: 'Variable monthly salary' },
  
  // Tax calculation
  taxCalculation: { sv: 'Skatteberäkning', en: 'Tax Calculation' },
  taxRateFor: { sv: 'Skattesats för', en: 'Tax rate for' },
  municipalTax: { sv: 'Kommunal skatt:', en: 'Municipal tax:' },
  countyTax: { sv: 'Landstingsskatt:', en: 'County tax:' },
  churchFee: { sv: 'Kyrkoavgift:', en: 'Church fee:' },
  totalTaxRate: { sv: 'Total skattesats:', en: 'Total tax rate:' },
  taxTable: { sv: 'Skattetabell:', en: 'Tax table:' },
  
  // Tax calculation display
  totalTax: { sv: 'Total skatt', en: 'Total Tax' },
  taxCalculatedOn: { sv: 'Skatt beräknad på skattepliktig inkomst', en: 'Tax calculated on taxable income' },
  youPay: { sv: 'Du betalar', en: 'You pay' },
  inTax: { sv: 'i skatt', en: 'in tax' },
  marginalTax: { sv: 'Din marginalskatt är', en: 'Your marginal tax is' },
  
  // Pie chart
  netIncome: { sv: 'Nettoinkomst', en: 'Net Income' },
  tax: { sv: 'Skatt', en: 'Tax' },
  
  // Tax table
  incomeFrom: { sv: 'Inkomst från', en: 'Income From' },
  incomeTo: { sv: 'Inkomst till', en: 'Income To' },
  
  // Search and messages
  searchIncome: { sv: 'Sök efter inkomst...', en: 'Search for income...' },
  noDataFound: { sv: 'Ingen data hittad för den valda kombinationen.', en: 'No data found for the selected combination.' },
  enterMunicipality: { sv: 'Ange den kommun som du är bosatt i', en: 'Enter the municipality where you live' },
  enterIncomeToSee: { sv: 'Ange månadsinkomst (kr) för att se skatteberäkning', en: 'Enter monthly income (SEK) to see tax calculation' },
  calculatingTax: { sv: 'Beräknar skatt...', en: 'Calculating tax...' },
  
  // Language selector
  language: { sv: 'Språk', en: 'Language' },
  swedish: { sv: 'Svenska', en: 'Swedish' },
  english: { sv: 'Engelska', en: 'English' },
  
  // Tax table columns
  skatt: { sv: 'Skatt', en: 'Tax' },
  skattesats: { sv: 'Skattesats', en: 'Tax Rate' },
  marginalskatt: { sv: 'Marginalskatt', en: 'Marginal Tax' },
  
  // Engångsbeskattning
  engangsbeskattning: { sv: 'Beskattning på engångsbelopp', en: 'One-time Payment Taxation' },
  engangsbeskattningAmount: { sv: 'Engångsbelopp (kr)', en: 'One-time Amount (SEK)' },
  enterEngangsbeskattning: { sv: 'Ange engångsbelopp', en: 'Enter one-time amount' },
  additionalIncomeLabel: { sv: 'Övrig inkomst (kr)', en: 'Additional Income (SEK)' },
  enterAdditionalIncome: { sv: 'Ange övrig inkomst', en: 'Enter additional income' },
  adjustedSalaryLabel: { sv: 'Justera inkomst (kr)', en: 'Adjusted Income (SEK)' },
  enterAdjustedSalary: { sv: 'Ange justerad månadsinkomst', en: 'Enter adjusted monthly income' },
  adjustedMonthsLabel: { sv: 'Antal månader', en: 'Number of Months' },
  enterAdjustedMonths: { sv: 'Antal månader med justerad inkomst', en: 'Number of months with adjusted income' },
  calculating: { sv: 'Beräknar...', en: 'Calculating...' },
  errorFetchingData: { sv: 'Fel vid hämtning av data', en: 'Error fetching data' },
  payEngangsskatt: { sv: 'I engångsskatt', en: 'In one-time tax' },
  onOneTimeAmount: { sv: 'På ett engångsbelopp om', en: 'On a one-time amount of' },
  youPayInTax: { sv: 'betalar du', en: 'you pay' },
  basedOnTotalYearlyIncome: { sv: 'Baserat på total årsinkomst:', en: 'Based on total yearly income:' },
  yearlyIncomeIncludes: { sv: 'Årsinkomsten inkluderar:', en: 'Yearly income includes:' },
  adjustedIncome: { sv: 'Justerad inkomst:', en: 'Adjusted income:' },
  currentIncome: { sv: 'Nuvarande inkomst:', en: 'Current income:' },
  monthlyIncomeTotal: { sv: 'Månadsinkomst:', en: 'Monthly income:' },
  vacationPayTotal: { sv: 'Semestertillägg:', en: 'Vacation pay:' },
  additionalIncomeTotal: { sv: 'Övrig inkomst:', en: 'Additional income:' },
  engangsbeskattningTotal: { sv: 'Engångsbelopp:', en: 'One-time amount:' },
  totalYearlyIncome: { sv: 'Total årsinkomst:', en: 'Total yearly income:' },
  noDataAvailable: { sv: 'Ingen data tillgänglig för år', en: 'No data available for year' },
  
  // Tooltips
  birthDateTooltip: { sv: 'Denna information behövs för att korrekt kunna räkna ut den skatt du ska betala, vilket baseras på födelseår och ålder vid årets ingång', en: 'This information is needed to correctly calculate the tax you should pay, which is based on birth year and age at the beginning of the year' },
  swedishChurchTooltip: { sv: 'Ditt medlemskap i Svenska Kyrkan kan du hitta här: https://www.svenskakyrkan.se/medlem', en: 'You can find your membership in the Swedish Church here: https://www.svenskakyrkan.se/medlem' },
  monthlyIncomeTooltip: { sv: 'Din bruttoinkomst per månad före skatt och andra avdrag. Detta inkluderar grundlön, fasta tillägg och andra regelbundna ersättningar.', en: 'Your gross income per month before tax and other deductions. This includes base salary, fixed allowances and other regular compensation.' },
  taxableBenefitTooltip: { sv: 'Förmåner från arbetsgivaren som är skattepliktiga, såsom bilförmån, friskvårdsförmån över gränsvärdet, eller subventionerad mat. Dessa räknas som beskattningsbar inkomst.', en: 'Benefits from the employer that are taxable, such as car benefits, wellness benefits above the limit, or subsidized food. These count as taxable income.' },
  incomeTypeTooltip: { sv: 'Typ av inkomst påverkar vilken skattetabell som används. Lön och arvoden använder en tabell, pensioner en annan, och olika ersättningar har sina egna tabeller med olika skattesatser.', en: 'Type of income affects which tax table is used. Salary and fees use one table, pensions another, and different benefits have their own tables with different tax rates.' },
  collectiveAgreementTooltip: { sv: 'Med kollektivavtal: 0.8% för grundlön + 0.5% för rörlig lön\\nUtan kollektivavtal: 0.43% för grundlön + (12% / 25) för rörlig lön', en: 'With collective agreement: 0.8% for base salary + 0.5% for variable salary\\nWithout collective agreement: 0.43% for base salary + (12% / 25) for variable salary' },
  vacationDaysTooltip: { sv: 'Antalet betalda semesterdagar per år enligt din anställning. Standard är 25 dagar, men kan variera beroende på ålder, tjänstgöringstid eller kollektivavtal.', en: 'The number of paid vacation days per year according to your employment. Standard is 25 days, but may vary depending on age, length of service or collective agreement.' },
  variableSalaryTooltip: { sv: 'Genomsnittlig rörlig lön per månad såsom provision, bonus, övertidsersättning eller andra prestationsbaserade tillägg som inte ingår i grundlönen.', en: 'Average variable salary per month such as commission, bonus, overtime pay or other performance-based supplements not included in the base salary.' },
  parishTooltip: { sv: 'Alla som är skrivna i en svensk kommun tillhör en församling. Om du inte vet vilken församling du tillhör kan du hitta det här', en: 'Everyone registered in a Swedish municipality belongs to a parish. If you don\'t know which parish you belong to, you can find it here' }
};

interface LanguageContextType {
  language: 'sv' | 'en';
  setLanguage: (lang: 'sv' | 'en') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<'sv' | 'en'>('sv');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
