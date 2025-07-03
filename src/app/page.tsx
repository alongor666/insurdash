"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

import Header from '@/components/dashboard/header';
import GlobalFilters from '@/components/dashboard/global-filters';
import KpiCardGrid from '@/components/dashboard/kpi-card-grid';
import ChartsSection from '@/components/dashboard/charts-section';
import DataTable from '@/components/dashboard/data-table';
import { Loader2 } from 'lucide-react';

import { getFilterOptions, getDashboardData } from '@/lib/data';
import type { Period, BusinessLine, BusinessLineData } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [periods, setPeriods] = useState<Period[]>([]);
  const [businessLines, setBusinessLines] = useState<BusinessLine[]>([]);
  const [currentPeriodData, setCurrentPeriodData] = useState<BusinessLineData[]>([]);
  const [comparePeriodData, setComparePeriodData] = useState<BusinessLineData[]>([]);

  const currentPeriodId = searchParams.get('cp');
  const comparePeriodId = searchParams.get('pp');
  const selectedBusinessLines = searchParams.get('bl')?.split(',');

  useEffect(() => {
    if (!supabase) return;

    const checkUserAndFetchData = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      
      try {
        const { periods: fetchedPeriods, businessLines: fetchedBusinessLines } = await getFilterOptions();

        setPeriods(fetchedPeriods);
        setBusinessLines(fetchedBusinessLines);

        const params = new URLSearchParams(searchParams.toString());
        let needsRedirect = false;

        if (!params.has('cp') && fetchedPeriods.length > 0) {
          params.set('cp', fetchedPeriods[0].id);
          needsRedirect = true;
        }
        if (!params.has('pp') && fetchedPeriods.length > 1) {
          params.set('pp', fetchedPeriods[1].id);
          needsRedirect = true;
        }
        if (!params.has('bl') && fetchedBusinessLines.length > 0) {
          params.set('bl', fetchedBusinessLines.map(bl => bl.id).join(','));
          needsRedirect = true;
        }

        if (needsRedirect) {
          router.replace(`?${params.toString()}`, { scroll: false });
          // Data fetching will be triggered by the next run of this effect due to searchParams change
        } else {
          const dataCp = params.get('cp');
          const dataPp = params.get('pp');
          if (dataCp && dataPp) {
              const [currentData, compareData] = await Promise.all([
                  getDashboardData(dataCp),
                  getDashboardData(dataPp)
              ]);
              setCurrentPeriodData(currentData);
              setComparePeriodData(compareData);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setLoading(false);
      }
    };
    
    checkUserAndFetchData();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filteredData = useMemo(() => {
    if (!selectedBusinessLines) return [];
    return currentPeriodData.filter(d => selectedBusinessLines.includes(d.id));
  }, [currentPeriodData, selectedBusinessLines]);

  const compareData = useMemo(() => {
    if (!selectedBusinessLines) return [];
    return comparePeriodData.filter(d => selectedBusinessLines.includes(d.id));
  }, [comparePeriodData, selectedBusinessLines]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header user={user} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <GlobalFilters periods={periods} businessLines={businessLines} />
        <KpiCardGrid currentData={filteredData} compareData={compareData} />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <div className="lg:col-span-2 xl:col-span-3">
                <ChartsSection data={filteredData} />
            </div>
        </div>
        <DataTable data={filteredData} />
      </main>
    </div>
  );
}
