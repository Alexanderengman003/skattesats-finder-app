import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'sv' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  sv: {
    appTitle: 'Skatteberäkning',
    appSubtitle: 'Beräkna din skatt enkelt och snabbt',
    taxRate: 'Skattesats',
    personalInfo: 'Personlig information',
    incomeYear: 'Inkomstår',
    selectYear: 'Välj år',
    municipality: 'Kommun',
    searchMunicipality: 'Sök kommun',
    selectYearFirst: 'Välj år först',
    birthDate: 'Födelsedatum',
    birthDateTooltip: 'Används för att beräkna korrekt skattetabell.',
    swedishChurchMember: 'Medlem i Svenska kyrkan',
    swedishChurchTooltip: 'Påverkar den totala skattesatsen.',
    incomeInfo: 'Inkomstinformation',
    monthlyIncome: 'Månadslön',
    enterMonthlyIncome: 'Ange månadslön',
    monthlyIncomeTooltip: 'Din totala månadslön före skatt.',
    taxableBenefit: 'Skattepliktig förmån',
    enterTaxableBenefit: 'Ange skattepliktig förmån',
    taxableBenefitTooltip: 'Exempelvis bilförmån eller annan förmån från din arbetsgivare.',
    incomeType: 'Inkomsttyp',
    selectIncomeType: 'Välj inkomsttyp',
    salary: 'Lön',
    pension: 'Pension',
    disability: 'Sjukersättning',
    unemployment: 'Arbetslöshetsersättning',
    noDataFound: 'Ingen data hittades för den valda kommunen och året.',
    taxCalculation: 'Skatteberäkning',
    enterMunicipality: 'Vänligen ange en kommun för att se skatteberäkningen.',
    enterIncomeToSee: 'Vänligen ange en inkomst för att se skatteberäkningen.',
    calculatingTax: 'Beräknar skatt...',
    swedish: 'Svenska',
    english: 'Engelska',
    collectiveAgreement: 'Kollektivavtal',
    collectiveAgreementTooltip: 'Indikerar om du omfattas av kollektivavtal.',
    vacationPay: 'Semestertillägg',
    vacationDays: 'Antal semesterdagar',
    vacationDaysTooltip: 'Antal betalda semesterdagar du har rätt till.',
    variableSalary: 'Rörlig lön',
    variableMonthlySalary: 'Ange rörlig månadslön',
    variableSalaryTooltip: 'Eventuell rörlig del av din lön, t.ex. provision eller bonus.',
    taxBreakdown: 'Skattefördelning',
  },
  en: {
    appTitle: 'Tax Calculation',
    appSubtitle: 'Calculate your tax easily and quickly',
    taxRate: 'Tax Rate',
    personalInfo: 'Personal Information',
    incomeYear: 'Income Year',
    selectYear: 'Select Year',
    municipality: 'Municipality',
    searchMunicipality: 'Search Municipality',
    selectYearFirst: 'Select Year First',
    birthDate: 'Date of Birth',
    birthDateTooltip: 'Used to calculate the correct tax table.',
    swedishChurchMember: 'Member of the Church of Sweden',
    swedishChurchTooltip: 'Affects the total tax rate.',
    incomeInfo: 'Income Information',
    monthlyIncome: 'Monthly Income',
    enterMonthlyIncome: 'Enter Monthly Income',
    monthlyIncomeTooltip: 'Your total monthly income before tax.',
    taxableBenefit: 'Taxable Benefit',
    enterTaxableBenefit: 'Enter Taxable Benefit',
    taxableBenefitTooltip: 'For example, company car benefit or other benefit from your employer.',
    incomeType: 'Income Type',
    selectIncomeType: 'Select Income Type',
    salary: 'Salary',
    pension: 'Pension',
    disability: 'Disability compensation',
    unemployment: 'Unemployment benefit',
    noDataFound: 'No data found for the selected municipality and year.',
    taxCalculation: 'Tax Calculation',
    enterMunicipality: 'Please enter a municipality to see the tax calculation.',
    enterIncomeToSee: 'Please enter an income to see the tax calculation.',
    calculatingTax: 'Calculating tax...',
    swedish: 'Swedish',
    english: 'English',
    collectiveAgreement: 'Collective Agreement',
    collectiveAgreementTooltip: 'Indicates whether you are covered by a collective agreement.',
    vacationPay: 'Vacation Pay',
    vacationDays: 'Number of vacation days',
    vacationDaysTooltip: 'Number of paid vacation days you are entitled to.',
    variableSalary: 'Variable Salary',
    variableMonthlySalary: 'Enter variable monthly salary',
    variableSalaryTooltip: 'Any variable part of your salary, e.g. commission or bonus.',
    taxBreakdown: 'Tax Breakdown',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('sv');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['sv']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
