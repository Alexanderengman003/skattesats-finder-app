import { useState } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { FormAnalyticsTracker } from "@/components/FormAnalyticsTracker";
import { LanguageSelector } from "@/components/LanguageSelector";
import { KommunSearch } from "@/components/KommunSearch";
import { ForsamlingSelect } from "@/components/ForsamlingSelect";
import { TaxRateDisplay } from "@/components/TaxRateDisplay";
import { TaxCalculationDisplay } from "@/components/TaxCalculationDisplay";
import { VacationPayCard } from "@/components/VacationPayCard";
import { EngangsbeskattningCard } from "@/components/EngangsbeskattningCard";
import { CollapsibleCard } from "@/components/CollapsibleCard";
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
  const { t } = useTranslation();
  const { trackEvent } = useAnalytics();
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

  const handleKommunSelect = (kommun: Kommun) => {
    setSelectedKommun(kommun);
    setSelectedForsamling(null); // Reset forsamling when kommun changes
    trackEvent('select_municipality', { municipality: kommun.namn });
  };

  const handleForsamlingSelect = (forsamling: Forsamling) => {
    setSelectedForsamling(forsamling);
    trackEvent('select_congregation', { congregation: forsamling.namn, taxRate: forsamling.tax_rate });
  };

  const calculateTax = () => {
    if (!selectedForsamling) {
      toast.error(t.no_congregation_selected);
      return;
    }

    if (!age || !monthlyIncome) {
      toast.error(t.missing_age_income);
      return;
    }

    const ageValue = parseInt(age);
    const incomeValue = parseFloat(monthlyIncome);
		const vacationDaysValue = parseInt(vacationDays);
    const taxableBenefitValue = parseFloat(taxableBenefit);
    const variableSalaryValue = parseFloat(variableSalary);
		const selectedYearValue = parseInt(selectedYear);

    if (isNaN(ageValue) || isNaN(incomeValue)) {
      toast.error(t.invalid_age_income);
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
    trackEvent('calculate_tax', { age: ageValue, income: incomeValue, taxRate: selectedForsamling.tax_rate });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <FormAnalyticsTracker 
        formData={{
          municipality: selectedKommun?.namn || '',
          age: parseInt(age) || 0,
          income: parseFloat(monthlyIncome) || 0,
          incomeType,
          year: parseInt(selectedYear),
          vacationDays: parseInt(vacationDays) || 0,
          taxableBenefit: parseFloat(taxableBenefit) || 0,
          variableSalary: parseFloat(variableSalary) || 0,
          churchMember,
          collectiveAgreement
        }}
      />
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Analytics Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t.title}
            </h1>
            <p className="text-gray-600 text-lg">
              {t.subtitle}
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
            <CardTitle>{t.tax_calculator}</CardTitle>
            <CardDescription>{t.tax_description}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <KommunSearch onKommunSelect={handleKommunSelect} />
            {selectedKommun && (
              <ForsamlingSelect
                kommunId={selectedKommun.id}
                onForsamlingSelect={handleForsamlingSelect}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">{t.age}</Label>
                <Input
                  type="number"
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="monthlyIncome">{t.monthly_income}</Label>
                <Input
                  type="number"
                  id="monthlyIncome"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="incomeType">{t.income_type}</Label>
              <Select value={incomeType} onValueChange={setIncomeType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t.select_income_type} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">{t.salary}</SelectItem>
                  <SelectItem value="pension">{t.pension}</SelectItem>
                  <SelectItem value="other">{t.other}</SelectItem>
                </SelectContent>
              </Select>
            </div>

						<div>
              <Label htmlFor="selectedYear">{t.tax_year}</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t.select_tax_year} />
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
                <Label htmlFor="vacationDays">{t.vacation_days}</Label>
                <Input
                  type="number"
                  id="vacationDays"
                  value={vacationDays}
                  onChange={(e) => setVacationDays(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="taxableBenefit">{t.taxable_benefit}</Label>
                <Input
                  type="number"
                  id="taxableBenefit"
                  value={taxableBenefit}
                  onChange={(e) => setTaxableBenefit(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="variableSalary">{t.variable_salary}</Label>
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
                onCheckedChange={(checked) => setChurchMember(checked || false)}
              />
              <Label htmlFor="churchMember">{t.church_member}</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="collectiveAgreement"
                checked={collectiveAgreement}
                onCheckedChange={(checked) => setCollectiveAgreement(checked || false)}
              />
              <Label htmlFor="collectiveAgreement">{t.collective_agreement}</Label>
            </div>

            <Button onClick={calculateTax}>{t.calculate_tax}</Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {taxCalculation !== null && (
          <TaxCalculationDisplay taxCalculation={taxCalculation} />
        )}

        <VacationPayCard monthlyIncome={parseFloat(monthlyIncome) || 0} />

        <EngangsbeskattningCard />

        <CollapsibleCard title={t.tax_rates_by_municipality}>
          {selectedKommun ? (
            <TaxRateDisplay
              kommunNamn={selectedKommun.namn}
              forsamlingNamn={selectedForsamling?.namn || ""}
              taxRate={selectedForsamling?.tax_rate || 0}
            />
          ) : (
            <p>{t.select_municipality_to_view_tax_rate}</p>
          )}
        </CollapsibleCard>
      </div>
    </div>
  );
};

export default Index;
