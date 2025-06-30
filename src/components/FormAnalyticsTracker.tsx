
import { useEffect } from 'react';
import { useAnalyticsContext } from '@/contexts/AnalyticsContext';

interface FormAnalyticsTrackerProps {
  municipality?: string;
  parish?: string;
  age?: number;
  monthlyIncome?: number;
  taxableBenefit?: number;
  incomeType?: string;
  hasCollectiveAgreement?: boolean;
  vacationDays?: number;
  variableSalary?: number;
  includesSvenskaKyrkan?: boolean;
  selectedYear?: number;
  triggerTracking?: boolean; // When calculate button is clicked
}

export const FormAnalyticsTracker: React.FC<FormAnalyticsTrackerProps> = ({
  municipality,
  parish,
  age,
  monthlyIncome,
  taxableBenefit,
  incomeType,
  hasCollectiveAgreement,
  vacationDays,
  variableSalary,
  includesSvenskaKyrkan,
  selectedYear,
  triggerTracking = false
}) => {
  const { trackFormData } = useAnalyticsContext();

  useEffect(() => {
    // Only track when calculate button is clicked (triggerTracking = true)
    if (triggerTracking) {
      console.log('Tracking calculation with data:', {
        municipality,
        parish,
        age,
        monthlyIncome,
        taxableBenefit,
        incomeType,
        hasCollectiveAgreement,
        vacationDays,
        variableSalary,
        includesSvenskaKyrkan,
        selectedYear
      });

      const calculationData = {
        municipality: municipality || undefined,
        parish: parish || undefined,
        user_age: age || undefined,
        monthly_income: monthlyIncome || undefined,
        taxable_benefit: taxableBenefit || undefined,
        income_type: incomeType || undefined,
        has_collective_agreement: hasCollectiveAgreement, // Keep boolean values (true/false/undefined)
        vacation_days: vacationDays || undefined,
        variable_salary: variableSalary || undefined,
        includes_swedish_church: includesSvenskaKyrkan, // Keep boolean values (true/false/undefined)
        selected_year: selectedYear || undefined
      };

      console.log('Sending calculation data:', calculationData);
      trackFormData(calculationData);
    }
  }, [
    triggerTracking, // Most important dependency - when this changes to true, track the calculation
    municipality,
    parish,
    age,
    monthlyIncome,
    taxableBenefit,
    incomeType,
    hasCollectiveAgreement,
    vacationDays,
    variableSalary,
    includesSvenskaKyrkan,
    selectedYear,
    trackFormData
  ]);

  return null; // This component doesn't render anything
};
