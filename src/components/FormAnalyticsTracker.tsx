
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
  triggerTracking?: boolean; // New prop to control when to track
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
    // Only track if explicitly triggered and we have meaningful data
    if (triggerTracking && (municipality || parish || age || monthlyIncome || selectedYear)) {
      const formData = {
        municipality: municipality || undefined,
        parish: parish || undefined,
        user_age: age || undefined,
        monthly_income: monthlyIncome || undefined,
        taxable_benefit: taxableBenefit || undefined,
        income_type: incomeType || undefined,
        has_collective_agreement: hasCollectiveAgreement || undefined,
        vacation_days: vacationDays || undefined,
        variable_salary: variableSalary || undefined,
        includes_swedish_church: includesSvenskaKyrkan || undefined,
        selected_year: selectedYear || undefined
      };

      // Only send non-undefined values
      const cleanedFormData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== undefined)
      );

      if (Object.keys(cleanedFormData).length > 0) {
        trackFormData(cleanedFormData);
      }
    }
  }, [
    triggerTracking, // Add this as the first dependency
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
