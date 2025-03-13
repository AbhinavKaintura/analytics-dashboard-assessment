"use client";
import { useState, useEffect } from 'react';
import HeroSection from '@/components/HeroSection/page';
import StatsSection from '@/components/StatsSection/page';
import { useDataFetch } from '@/hooks/useDataFetch';
import FilterSection from '@/components/FilterSection/page';
import { EVData } from '@/hooks/useDataFetch';

export default function EVDashboardClient() {
  const { data, loading } = useDataFetch();
  const [filteredData, setFilteredData] = useState<EVData[]>([]);
 
 
  useEffect(() => {
    if (data.length) {
      setFilteredData(data);
    }
  }, [data]);
 
  const totalEVs = filteredData.length;
 
  const cityCounts = filteredData.reduce((acc, ev) => {
    const city = ev.City;
    if (city) {
      acc[city] = (acc[city] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
 
  const topCity = Object.entries(cityCounts).length > 0
    ? Object.entries(cityCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([city, count]) => ({ city, count }))[0]
    : { city: 'Seattle', count: 10427 };
 
  const manufacturerCounts = filteredData.reduce((acc, ev) => {
    const make = ev.Make;
    if (make) {
      acc[make] = (acc[make] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
 
  const topManufacturer = Object.entries(manufacturerCounts).length > 0
    ? Object.entries(manufacturerCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([make, count]) => ({ make, count }))[0]
    : { make: 'TESLA', count: 23127 };

  return (
    <div className="min-h-screen">
      <HeroSection />
     
      <StatsSection
        totalEVs={loading ? 0 : totalEVs}
        topCity={topCity}
        topManufacturer={topManufacturer}
        isLoading={loading}
      />
      <FilterSection />
    </div>
  );
}
