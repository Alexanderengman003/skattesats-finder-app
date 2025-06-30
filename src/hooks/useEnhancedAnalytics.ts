
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

interface EnhancedAnalyticsData {
  dailyUsers: DailyUserData[];
  geographicData: GeographicData[];
  clickHeatmap: ClickHeatmapData[];
  browserStats: BrowserData[];
  topCountries: Array<{ country: string; count: number }>;
  formInsights: FormInsights;
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

      // Get calculation events for form insights
      const { data: calculationEvents } = await supabase
        .from('analytics_events')
        .select('properties')
        .eq('event_name', 'calculation_performed')
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Process form insights from calculation events
      const formInsights = processFormInsights(calculationEvents || []);

      setData({
        dailyUsers,
        geographicData,
        clickHeatmap,
        browserStats,
        topCountries,
        formInsights
      });

    } catch (err) {
      console.error('Error loading enhanced analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processFormInsights = (calculationEvents: any[]): FormInsights => {
    // Extract properties from calculation events
    const calculations = calculationEvents.map(event => event.properties || {});

    // Popular municipalities
    const municipalityMap = new Map<string, number>();
    calculations.forEach((calc) => {
      if (calc.municipality) {
        municipalityMap.set(calc.municipality, (municipalityMap.get(calc.municipality) || 0) + 1);
      }
    });
    const popularMunicipalities = Array.from(municipalityMap.entries())
      .map(([municipality, count]) => ({ municipality, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Age distribution - Fixed to use 5-year increments with no upper bound
    const ageMap = new Map<string, number>();
    calculations.forEach((calc) => {
      if (calc.user_age) {
        const age = calc.user_age;
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

    // Updated income ranges - 5k increments starting from 0 with no upper bound
    const incomeRangeLabels = [
      '0-5k', '5k-10k', '10k-15k', '15k-20k', '20k-25k', '25k-30k', 
      '30k-35k', '35k-40k', '40k-45k', '45k-50k', '50k-55k', '55k-60k',
      '60k-65k', '65k-70k', '70k-75k', '75k-80k', '80k-85k', '85k-90k',
      '90k-95k', '95k-100k', '100k-110k', '110k-120k', '120k-130k', 
      '130k-140k', '140k-150k', '150k+'
    ];
    const incomeRanges = incomeRangeLabels.map(range => ({ income_range: range, count: 0 }));
    
    calculations.forEach((calc) => {
      if (calc.monthly_income) {
        const income = calc.monthly_income;
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
    calculations.forEach((calc) => {
      if (calc.income_type) {
        incomeTypeMap.set(calc.income_type, (incomeTypeMap.get(calc.income_type) || 0) + 1);
      }
    });
    const incomeTypes = Array.from(incomeTypeMap.entries())
      .map(([income_type, count]) => ({ income_type, count }))
      .sort((a, b) => b.count - a.count);

    // Year selections
    const yearMap = new Map<number, number>();
    calculations.forEach((calc) => {
      if (calc.selected_year) {
        yearMap.set(calc.selected_year, (yearMap.get(calc.selected_year) || 0) + 1);
      }
    });
    const yearSelections = Array.from(yearMap.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => b.year - a.year);

    // Vacation days distribution
    const vacationDaysMap = new Map<number, number>();
    calculations.forEach((calc) => {
      if (calc.vacation_days !== null && calc.vacation_days !== undefined) {
        vacationDaysMap.set(calc.vacation_days, (vacationDaysMap.get(calc.vacation_days) || 0) + 1);
      }
    });
    const vacationDaysDistribution = Array.from(vacationDaysMap.entries())
      .map(([vacation_days, count]) => ({ vacation_days, count }))
      .sort((a, b) => a.vacation_days - b.vacation_days);

    // Calculate averages and rates
    const validAges = calculations.filter(c => c.user_age).map(c => c.user_age);
    const avgAge = validAges.length > 0 ? validAges.reduce((a, b) => a + b, 0) / validAges.length : 0;

    const validIncomes = calculations.filter(c => c.monthly_income).map(c => c.monthly_income);
    const avgIncome = validIncomes.length > 0 ? validIncomes.reduce((a, b) => a + b, 0) / validIncomes.length : 0;

    const validTaxableBenefits = calculations.filter(c => c.taxable_benefit && c.taxable_benefit > 0).map(c => c.taxable_benefit);
    const avgTaxableBenefit = validTaxableBenefits.length > 0 ? validTaxableBenefits.reduce((a, b) => a + b, 0) / validTaxableBenefits.length : 0;

    const validVariableSalaries = calculations.filter(c => c.variable_salary && c.variable_salary > 0).map(c => c.variable_salary);
    const avgVariableSalary = validVariableSalaries.length > 0 ? validVariableSalaries.reduce((a, b) => a + b, 0) / validVariableSalaries.length : 0;

    const validVacationDays = calculations.filter(c => c.vacation_days !== null && c.vacation_days !== undefined).map(c => c.vacation_days);
    const avgVacationDays = validVacationDays.length > 0 ? validVacationDays.reduce((a, b) => a + b, 0) / validVacationDays.length : 0;

    // Church membership calculations - count checkbox states per calculation
    const churchCheckedCount = calculations.filter(c => c.includes_swedish_church === true).length;
    const totalCalculationsWithChurchData = calculations.filter(c => typeof c.includes_swedish_church === 'boolean').length;
    const churchMembershipRate = totalCalculationsWithChurchData > 0 ? (churchCheckedCount / totalCalculationsWithChurchData) * 100 : 0;

    // Collective agreement calculations - count checkbox states per calculation
    const collectiveCheckedCount = calculations.filter(c => c.has_collective_agreement === true).length;
    const totalCalculationsWithCollectiveData = calculations.filter(c => typeof c.has_collective_agreement === 'boolean').length;
    const collectiveAgreementRate = totalCalculationsWithCollectiveData > 0 ? (collectiveCheckedCount / totalCalculationsWithCollectiveData) * 100 : 0;

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
      churchMembershipTotal: totalCalculationsWithChurchData,
      collectiveAgreementCount: collectiveCheckedCount,
      collectiveAgreementTotal: totalCalculationsWithCollectiveData
    };
  };

  return { data, loading, error, refetch: loadEnhancedAnalytics };
};
