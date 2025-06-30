import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DailyUserData {
  date: string;
  users: number;
  sessions: number;
}

interface GeographicData {
  country: string;
  city: string | null;
  count: number;
  percentage: number;
}

interface ClickHeatmapData {
  element_type: string;
  count: number;
  avg_x: number;
  avg_y: number;
}

interface BrowserData {
  browser: string;
  count: number;
}

interface FormInsights {
  popularMunicipalities: Array<{ municipality: string; count: number }>;
  ageDistribution: Array<{ age_range: string; count: number }>;
  incomeRanges: Array<{ income_range: string; count: number }>;
  incomeTypes: Array<{ income_type: string; count: number }>;
  yearSelections: Array<{ year: number; count: number }>;
  vacationDaysDistribution: Array<{ vacation_days: number; count: number }>;
  avgAge: number;
  avgIncome: number;
  avgTaxableBenefit: number;
  avgVariableSalary: number;
  avgVacationDays: number;
  churchMembershipRate: number;
  collectiveAgreementRate: number;
  churchMembershipCount: number;
  churchMembershipTotal: number;
  collectiveAgreementCount: number;
  collectiveAgreementTotal: number;
}

interface CalculationData {
  id: string;
  created_at: string;
  municipality?: string;
  parish?: string;
  user_age?: number;
  monthly_income?: number;
  taxable_benefit?: number;
  income_type?: string;
  has_collective_agreement?: boolean;
  vacation_days?: number;
  variable_salary?: number;
  includes_swedish_church?: boolean;
  selected_year?: number;
}

interface EnhancedAnalyticsData {
  dailyUsers: DailyUserData[];
  geographicData: GeographicData[];
  clickHeatmap: ClickHeatmapData[];
  browserStats: BrowserData[];
  topCountries: Array<{ country: string; count: number }>;
  formInsights: FormInsights;
  allCalculations: CalculationData[];
}

export const useEnhancedAnalytics = () => {
  const [data, setData] = useState<EnhancedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEnhancedAnalytics();
  }, []);

  const loadEnhancedAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get daily user statistics for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: sessionsData } = await supabase
        .from('analytics_sessions')
        .select('*')
        .gte('session_start', thirtyDaysAgo.toISOString());

      // Get calculation events (form_data_submitted events) for form insights
      const { data: calculationEvents } = await supabase
        .from('analytics_events')
        .select('form_data, created_at, id')
        .eq('event_name', 'form_data_submitted')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      console.log('Calculation events found:', calculationEvents?.length);
      console.log('Sample calculation event:', calculationEvents?.[0]);

      // Process daily users data
      const dailyUsersMap = new Map<string, { users: Set<string>, sessions: number }>();
      
      sessionsData?.forEach((session) => {
        const date = new Date(session.session_start).toISOString().split('T')[0];
        if (!dailyUsersMap.has(date)) {
          dailyUsersMap.set(date, { users: new Set(), sessions: 0 });
        }
        const dayData = dailyUsersMap.get(date)!;
        if (session.user_id) {
          dayData.users.add(session.user_id);
        }
        dayData.sessions++;
      });

      const dailyUsers: DailyUserData[] = Array.from(dailyUsersMap.entries())
        .map(([date, data]) => ({
          date,
          users: data.users.size,
          sessions: data.sessions
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Process geographic data
      const geographicMap = new Map<string, number>();
      
      sessionsData?.forEach((session) => {
        const country = session.country || 'Unknown';
        geographicMap.set(country, (geographicMap.get(country) || 0) + 1);
      });

      const totalSessions = sessionsData?.length || 0;
      const geographicData: GeographicData[] = Array.from(geographicMap.entries())
        .map(([country, count]) => ({
          country,
          city: null,
          count,
          percentage: totalSessions > 0 ? (count / totalSessions) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count);

      const topCountries = geographicData.slice(0, 10).map(item => ({
        country: item.country,
        count: item.count
      }));

      // Get click heatmap data
      const { data: eventsData } = await supabase
        .from('analytics_events')
        .select('event_name, properties')
        .eq('event_type', 'click')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const clickMap = new Map<string, { count: number; x_coords: number[]; y_coords: number[] }>();
      
      eventsData?.forEach((event) => {
        const props = event.properties as any;
        if (props?.element_type) {
          const key = props.element_type;
          if (!clickMap.has(key)) {
            clickMap.set(key, { count: 0, x_coords: [], y_coords: [] });
          }
          const clickData = clickMap.get(key)!;
          clickData.count++;
          if (props.x_coordinate) clickData.x_coords.push(props.x_coordinate);
          if (props.y_coordinate) clickData.y_coords.push(props.y_coordinate);
        }
      });

      const clickHeatmap: ClickHeatmapData[] = Array.from(clickMap.entries())
        .map(([element_type, data]) => ({
          element_type,
          count: data.count,
          avg_x: data.x_coords.length > 0 ? data.x_coords.reduce((a, b) => a + b, 0) / data.x_coords.length : 0,
          avg_y: data.y_coords.length > 0 ? data.y_coords.reduce((a, b) => a + b, 0) / data.y_coords.length : 0
        }))
        .sort((a, b) => b.count - a.count);

      // Process browser statistics
      const browserMap = new Map<string, number>();
      sessionsData?.forEach((session) => {
        const browser = session.browser || 'Unknown';
        browserMap.set(browser, (browserMap.get(browser) || 0) + 1);
      });

      const browserStats: BrowserData[] = Array.from(browserMap.entries())
        .map(([browser, count]) => ({ browser, count }))
        .sort((a, b) => b.count - a.count);

      // Process form insights from calculation events
      const processFormInsights = (calculationEvents: any[]): FormInsights => {
        console.log('Processing form insights from', calculationEvents.length, 'calculation events');

        // Extract form data from calculation events
        const formDataList = calculationEvents.map(event => event.form_data).filter(data => data && Object.keys(data).length > 0);
        
        console.log('Valid form data entries:', formDataList.length);
        console.log('Sample form data:', formDataList[0]);

        // Popular municipalities
        const municipalityMap = new Map<string, number>();
        formDataList.forEach((formData) => {
          if (formData.municipality) {
            municipalityMap.set(formData.municipality, (municipalityMap.get(formData.municipality) || 0) + 1);
          }
        });
        const popularMunicipalities = Array.from(municipalityMap.entries())
          .map(([municipality, count]) => ({ municipality, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // Age distribution
        const ageMap = new Map<string, number>();
        formDataList.forEach((formData) => {
          if (formData.user_age) {
            const age = formData.user_age;
            const ageGroup = Math.floor(age / 5) * 5;
            const ageRange = `${ageGroup}-${ageGroup + 4}`;
            ageMap.set(ageRange, (ageMap.get(ageRange) || 0) + 1);
          }
        });
        
        const ageDistribution = Array.from(ageMap.entries())
          .map(([age_range, count]) => ({ age_range, count }))
          .sort((a, b) => {
            const aStart = parseInt(a.age_range.split('-')[0]);
            const bStart = parseInt(b.age_range.split('-')[0]);
            return aStart - bStart;
          });

        // Income ranges
        const incomeRangeLabels = [
          '0-5k', '5k-10k', '10k-15k', '15k-20k', '20k-25k', '25k-30k', 
          '30k-35k', '35k-40k', '40k-45k', '45k-50k', '50k-55k', '55k-60k',
          '60k-65k', '65k-70k', '70k-75k', '75k-80k', '80k-85k', '85k-90k',
          '90k-95k', '95k-100k', '100k-110k', '110k-120k', '120k-130k', 
          '130k-140k', '140k-150k', '150k+'
        ];
        const incomeRanges = incomeRangeLabels.map(range => ({ income_range: range, count: 0 }));
        
        formDataList.forEach((formData) => {
          if (formData.monthly_income) {
            const income = formData.monthly_income;
            if (income < 5000) incomeRanges[0].count++;
            else if (income < 10000) incomeRanges[1].count++;
            else if (income < 15000) incomeRanges[2].count++;
            else if (income < 20000) incomeRanges[3].count++;
            else if (income < 25000) incomeRanges[4].count++;
            else if (income < 30000) incomeRanges[5].count++;
            else if (income < 35000) incomeRanges[6].count++;
            else if (income < 40000) incomeRanges[7].count++;
            else if (income < 45000) incomeRanges[8].count++;
            else if (income < 50000) incomeRanges[9].count++;
            else if (income < 55000) incomeRanges[10].count++;
            else if (income < 60000) incomeRanges[11].count++;
            else if (income < 65000) incomeRanges[12].count++;
            else if (income < 70000) incomeRanges[13].count++;
            else if (income < 75000) incomeRanges[14].count++;
            else if (income < 80000) incomeRanges[15].count++;
            else if (income < 85000) incomeRanges[16].count++;
            else if (income < 90000) incomeRanges[17].count++;
            else if (income < 95000) incomeRanges[18].count++;
            else if (income < 100000) incomeRanges[19].count++;
            else if (income < 110000) incomeRanges[20].count++;
            else if (income < 120000) incomeRanges[21].count++;
            else if (income < 130000) incomeRanges[22].count++;
            else if (income < 140000) incomeRanges[23].count++;
            else if (income < 150000) incomeRanges[24].count++;
            else incomeRanges[25].count++;
          }
        });

        // Income types
        const incomeTypeMap = new Map<string, number>();
        formDataList.forEach((formData) => {
          if (formData.income_type) {
            incomeTypeMap.set(formData.income_type, (incomeTypeMap.get(formData.income_type) || 0) + 1);
          }
        });
        const incomeTypes = Array.from(incomeTypeMap.entries())
          .map(([income_type, count]) => ({ income_type, count }))
          .sort((a, b) => b.count - a.count);

        // Year selections
        const yearMap = new Map<number, number>();
        formDataList.forEach((formData) => {
          if (formData.selected_year) {
            yearMap.set(formData.selected_year, (yearMap.get(formData.selected_year) || 0) + 1);
          }
        });
        const yearSelections = Array.from(yearMap.entries())
          .map(([year, count]) => ({ year, count }))
          .sort((a, b) => b.year - a.year);

        // Vacation days distribution
        const vacationDaysMap = new Map<number, number>();
        formDataList.forEach((formData) => {
          if (formData.vacation_days !== null && formData.vacation_days !== undefined) {
            vacationDaysMap.set(formData.vacation_days, (vacationDaysMap.get(formData.vacation_days) || 0) + 1);
          }
        });
        const vacationDaysDistribution = Array.from(vacationDaysMap.entries())
          .map(([vacation_days, count]) => ({ vacation_days, count }))
          .sort((a, b) => a.vacation_days - b.vacation_days);

        // Calculate averages
        const validAges = formDataList.filter(d => d.user_age).map(d => d.user_age);
        const avgAge = validAges.length > 0 ? validAges.reduce((a, b) => a + b, 0) / validAges.length : 0;

        const validIncomes = formDataList.filter(d => d.monthly_income).map(d => d.monthly_income);
        const avgIncome = validIncomes.length > 0 ? validIncomes.reduce((a, b) => a + b, 0) / validIncomes.length : 0;

        const validTaxableBenefits = formDataList.filter(d => d.taxable_benefit && d.taxable_benefit > 0).map(d => d.taxable_benefit);
        const avgTaxableBenefit = validTaxableBenefits.length > 0 ? validTaxableBenefits.reduce((a, b) => a + b, 0) / validTaxableBenefits.length : 0;

        const validVariableSalaries = formDataList.filter(d => d.variable_salary && d.variable_salary > 0).map(d => d.variable_salary);
        const avgVariableSalary = validVariableSalaries.length > 0 ? validVariableSalaries.reduce((a, b) => a + b, 0) / validVariableSalaries.length : 0;

        const validVacationDays = formDataList.filter(d => d.vacation_days !== null && d.vacation_days !== undefined).map(d => d.vacation_days);
        const avgVacationDays = validVacationDays.length > 0 ? validVacationDays.reduce((a, b) => a + b, 0) / validVacationDays.length : 0;

        // Church membership: count all calculations (treating null/undefined as "No")
        const churchTotalCount = formDataList.length;
        const churchCheckedCount = formDataList.filter(d => d.includes_swedish_church === true).length;
        const churchMembershipRate = churchTotalCount > 0 ? (churchCheckedCount / churchTotalCount) * 100 : 0;

        console.log('Church calculations:', { 
          checked: churchCheckedCount, 
          total: churchTotalCount, 
          rate: churchMembershipRate 
        });

        // Collective agreement: count all calculations (treating null/undefined as "No")
        const collectiveTotalCount = formDataList.length;
        const collectiveCheckedCount = formDataList.filter(d => d.has_collective_agreement === true).length;
        const collectiveAgreementRate = collectiveTotalCount > 0 ? (collectiveCheckedCount / collectiveTotalCount) * 100 : 0;

        console.log('Collective calculations:', { 
          checked: collectiveCheckedCount, 
          total: collectiveTotalCount, 
          rate: collectiveAgreementRate 
        });

        return {
          popularMunicipalities,
          ageDistribution,
          incomeRanges,
          incomeTypes,
          yearSelections,
          vacationDaysDistribution,
          avgAge: Math.round(avgAge),
          avgIncome: Math.round(avgIncome),
          avgTaxableBenefit: Math.round(avgTaxableBenefit),
          avgVariableSalary: Math.round(avgVariableSalary),
          avgVacationDays: Math.round(avgVacationDays * 10) / 10,
          churchMembershipRate: Math.round(churchMembershipRate * 10) / 10,
          collectiveAgreementRate: Math.round(collectiveAgreementRate * 10) / 10,
          churchMembershipCount: churchCheckedCount,
          churchMembershipTotal: churchTotalCount,
          collectiveAgreementCount: collectiveCheckedCount,
          collectiveAgreementTotal: collectiveTotalCount
        };
      };

      // Process all calculations for the detailed list
      const allCalculations: CalculationData[] = calculationEvents?.map(event => ({
        id: event.id,
        created_at: event.created_at,
        // Only spread form_data if it exists and is an object
        ...(event.form_data && typeof event.form_data === 'object' ? event.form_data : {})
      })) || [];

      setData({
        dailyUsers,
        geographicData,
        clickHeatmap,
        browserStats,
        topCountries,
        formInsights: processFormInsights(calculationEvents || []),
        allCalculations
      });

    } catch (err) {
      console.error('Error loading enhanced analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: loadEnhancedAnalytics };
};
