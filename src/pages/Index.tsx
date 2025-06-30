
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import { FormAnalyticsTracker } from "@/components/FormAnalyticsTracker";
import LanguageSelector from "@/components/LanguageSelector";
import KommunSearch from "@/components/KommunSearch";
import ForsamlingSelect from "@/components/ForsamlingSelect";
import TaxRateDisplay from "@/components/TaxRateDisplay";
import TaxCalculationDisplay from "@/components/TaxCalculationDisplay";
import VacationPayCard from "@/components/VacationPayCard";
import EngangsbeskattningCard from "@/components/EngangsbeskattningCard";
import CollapsibleCard from "@/components/CollapsibleCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

interface Kommun {
  id: number;
  namn: string;
  forsamlingar: Forsamling[];
}

interface Forsamling {
  id: number;
  namn: string;
  tax_rate: number;
}

const Index = () => {
  const { t } = useLanguage();
  const { trackEvent } = useAnalyticsContext();
  const [selectedKommun, setSelectedKommun] = useState<Kommun | null>(null);
  const [selectedForsamling, setSelectedForsamling] = useState<Forsamling | null>(null);
  const [age, setAge] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [incomeType, setIncomeType] = useState("salary");
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [vacationDays, setVacationDays] = useState("");
  const [taxableBenefit, setTaxableBenefit] = useState("");
  const [variableSalary, setVariableSalary] = useState("");
  const [churchMember, setChurchMember] = useState(false);
  const [collectiveAgreement, setCollectiveAgreement] = useState(false);
  const [taxCalculation, setTaxCalculation] = useState<number | null>(null);
  const [engangsbeskattningAmount, setEngangsbeskattningAmount] = useState("");
  const [additionalIncome, setAdditionalIncome] = useState("");

  const handleKommunSelect = (kommun: Kommun) => {
    setSelectedKommun(kommun);
    setSelectedForsamling(null); // Reset forsamling when kommun changes
    trackEvent('select_municipality', 'municipality_selected', { municipality: kommun.namn });
  };

  const handleForsamlingSelect = (forsamling: Forsamling) => {
    setSelectedForsamling(forsamling);
    trackEvent('select_congregation', 'congregation_selected', { congregation: forsamling.namn, taxRate: forsamling.tax_rate });
  };

  const calculateTax = () => {
    if (!selectedForsamling) {
      toast.error(t('no_congregation_selected'));
      return;
    }

    if (!age || !monthlyIncome) {
      toast.error(t('missing_age_income'));
      return;
    }

    const ageValue = parseInt(age);
    const incomeValue = parseFloat(monthlyIncome);
		const vacationDaysValue = parseInt(vacationDays);
    const taxableBenefitValue = parseFloat(taxableBenefit);
    const variableSalaryValue = parseFloat(variableSalary);
		const selectedYearValue = parseInt(selectedYear);

    if (isNaN(ageValue) || isNaN(incomeValue)) {
      toast.error(t('invalid_age_income'));
      return;
    }

    // Basic tax calculation logic
    const taxRate = selectedForsamling.tax_rate / 100;
    let calculatedTax = incomeValue * taxRate;

    // Adjust tax based on age
    if (ageValue >= 65) {
      calculatedTax *= 0.9; // 10% reduction for seniors
    }

		// Adjust tax based on vacation days
		calculatedTax += (incomeValue / 21) * vacationDaysValue * taxRate;

    // Adjust tax based on taxable benefit
    calculatedTax += taxableBenefitValue * taxRate;

    // Adjust tax based on variable salary
    calculatedTax += variableSalaryValue * taxRate;

    setTaxCalculation(calculatedTax);
    trackEvent('calculate_tax', 'tax_calculation', { age: ageValue, income: incomeValue, taxRate: selectedForsamling.tax_rate });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <FormAnalyticsTracker 
        municipality={selectedKommun?.namn}
        age={parseInt(age) || undefined}
        monthlyIncome={parseFloat(monthlyIncome) || undefined}
        incomeType={incomeType}
        selectedYear={parseInt(selectedYear)}
        vacationDays={parseInt(vacationDays) || undefined}
        taxableBenefit={parseFloat(taxableBenefit) || undefined}
        variableSalary={parseFloat(variableSalary) || undefined}
        includesSvenskaKyrkan={churchMember}
        hasCollectiveAgreement={collectiveAgreement}
        triggerTracking={taxCalculation !== null}
      />
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Analytics Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('appTitle')}
            </h1>
            <p className="text-gray-600 text-lg">
              {t('appSubtitle')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/analytics">
              <Button variant="outline" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
            </Link>
            <LanguageSelector />
          </div>
        </div>

        {/* Main Tax Calculator Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t('taxCalculation')}</CardTitle>
            <CardDescription>{t('appSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <KommunSearch onSelect={handleKommunSelect} />
            {selectedKommun && (
              <ForsamlingSelect
                kommun={selectedKommun}
                onSelect={handleForsamlingSelect}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">{t('age')}</Label>
                <Input
                  type="number"
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="monthlyIncome">{t('monthlyIncome')}</Label>
                <Input
                  type="number"
                  id="monthlyIncome"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="incomeType">{t('incomeType')}</Label>
              <Select value={incomeType} onValueChange={setIncomeType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('selectIncomeType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">{t('salary')}</SelectItem>
                  <SelectItem value="pension">{t('pension')}</SelectItem>
                  <SelectItem value="other">{t('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

						<div>
              <Label htmlFor="selectedYear">{t('incomeYear')}</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('selectYear')} />
                </SelectTrigger>
                <SelectContent>
									{Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
										<SelectItem key={year} value={year.toString()}>{year}</SelectItem>
									))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vacationDays">{t('vacationDays')}</Label>
                <Input
                  type="number"
                  id="vacationDays"
                  value={vacationDays}
                  onChange={(e) => setVacationDays(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="taxableBenefit">{t('taxableBenefit')}</Label>
                <Input
                  type="number"
                  id="taxableBenefit"
                  value={taxableBenefit}
                  onChange={(e) => setTaxableBenefit(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="variableSalary">{t('variableSalary')}</Label>
              <Input
                type="number"
                id="variableSalary"
                value={variableSalary}
                onChange={(e) => setVariableSalary(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="churchMember"
                checked={churchMember}
                onCheckedChange={(checked) => setChurchMember(checked === true)}
              />
              <Label htmlFor="churchMember">{t('swedishChurchMember')}</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="collectiveAgreement"
                checked={collectiveAgreement}
                onCheckedChange={(checked) => setCollectiveAgreement(checked === true)}
              />
              <Label htmlFor="collectiveAgreement">{t('collectiveAgreement')}</Label>
            </div>

            <Button onClick={calculateTax}>{t('taxCalculation')}</Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {taxCalculation !== null && (
          <TaxCalculationDisplay 
            totalIncome={parseFloat(monthlyIncome) || 0}
            actualTaxAmount={taxCalculation}
            taxPercentage={selectedForsamling ? selectedForsamling.tax_rate.toString() : "0"}
            marginalTaxRate={selectedForsamling ? selectedForsamling.tax_rate.toString() : "0"}
          />
        )}

        <VacationPayCard 
          hasCollectiveAgreement={collectiveAgreement}
          onHasCollectiveAgreementChange={setCollectiveAgreement}
          vacationDays={parseInt(vacationDays) || 0}
          onVacationDaysChange={(days) => setVacationDays(days.toString())}
          variableSalary={parseFloat(variableSalary) || 0}
          onVariableSalaryChange={(salary) => setVariableSalary(salary.toString())}
          vacationPayAmount={0}
          monthlyIncome={parseFloat(monthlyIncome) || 0}
        />

        <EngangsbeskattningCard 
          engangsbeskattningAmount={parseFloat(engangsbeskattningAmount) || 0}
          onEngangsbeskattningAmountChange={(amount) => setEngangsbeskattningAmount(amount.toString())}
          additionalIncome={parseFloat(additionalIncome) || 0}
          onAdditionalIncomeChange={(income) => setAdditionalIncome(income.toString())}
          taxRate={selectedForsamling ? selectedForsamling.tax_rate : 0}
          onTaxRateChange={() => {}}
          grossAmount={0}
          onGrossAmountChange={() => {}}
          netAmount={0}
          onNetAmountChange={() => {}}
          taxAmount={0}
          onTaxAmountChange={() => {}}
          preliminaryTax={0}
          onPreliminaryTaxChange={() => {}}
          finalTax={0}
          onFinalTaxChange={() => {}}
          taxDifference={0}
          onTaxDifferenceChange={() => {}}
          isRefund={false}
          onIsRefundChange={() => {}}
          paymentDate=""
          onPaymentDateChange={() => {}}
          taxYear={new Date().getFullYear()}
          onTaxYearChange={() => {}}
          comments=""
          onCommentsChange={() => {}}
          municipality={selectedKommun?.namn || ""}
          onMunicipalityChange={() => {}}
        />

        <CollapsibleCard title={t('taxRateFor')}>
          {selectedKommun ? (
            <TaxRateDisplay
              result={[]}
              includeSvenskaKyrkan={churchMember}
              getSkattetabell={() => 1}
            />
          ) : (
            <p>{t('enterMunicipality')}</p>
          )}
        </CollapsibleCard>
      </div>
    </div>
  );
};

export default Index;
