//changes made to the file

"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { useDataFetch, EVData } from '@/hooks/useDataFetch';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

function DashboardContent() {
  const searchParams = useSearchParams();
  const { data, loading, error } = useDataFetch();
  const [filteredData, setFilteredData] = useState<EVData[]>([]);
  const [makeDistribution, setMakeDistribution] = useState<any[]>([]);
  const [evTypeDistribution, setEVTypeDistribution] = useState<any[]>([]);
  const [yearlyTrend, setYearlyTrend] = useState<any[]>([]);
  const [rangeDistribution, setRangeDistribution] = useState<any[]>([]);
  const [countyDistribution, setCountyDistribution] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const COLORS = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', 
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
    '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5'
  ];

  useEffect(() => {
    if (!loading && data.length > 0) {
      const filters: Record<string, string> = {};
      for (const [key, value] of searchParams.entries()) {
        const originalKey = key
          .split('_')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
        
        filters[originalKey] = value;
      }
      
      setActiveFilters(filters);

      let result = [...data];
      
      Object.entries(filters).forEach(([key, value]) => {
        if (key === "Electric Range") {
          const rangeFilter = (item: EVData) => {
            const range = item["Electric Range"];
            if (value === "0-100") return range >= 0 && range <= 100;
            if (value === "101-200") return range > 100 && range <= 200;
            if (value === "201-300") return range > 200 && range <= 300;
            if (value === "301-400") return range > 300 && range <= 400;
            if (value === "400+") return range > 400;
            return true;
          };
          result = result.filter(rangeFilter);
        } else if (key === "Base MSRP") {
          const priceFilter = (item: EVData) => {
            const price = item["Base MSRP"];
            if (value === "Under $30k") return price < 30000;
            if (value === "$30k-$50k") return price >= 30000 && price <= 50000;
            if (value === "$50k-$75k") return price > 50000 && price <= 75000;
            if (value === "$75k-$100k") return price > 75000 && price <= 100000;
            if (value === "Over $100k") return price > 100000;
            return true;
          };
          result = result.filter(priceFilter);
        } else {
          result = result.filter(item => item[key] == value);
        }
      });
      
      setFilteredData(result);

      prepareChartData(result);
    }
  }, [data, loading, searchParams]);

  const prepareChartData = (filteredData: EVData[]) => {
    const makeCount: Record<string, number> = {};
    filteredData.forEach(item => {
      const make = item.Make || 'Unknown';
      makeCount[make] = (makeCount[make] || 0) + 1;
    });
    
    const sortedMakes = Object.entries(makeCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    const topMakes = sortedMakes.slice(0, 10);
    const otherMakes = sortedMakes.slice(10);
    
    if (otherMakes.length > 0) {
      const otherTotal = otherMakes.reduce((sum, item) => sum + item.value, 0);
      topMakes.push({ name: "Others", value: otherTotal });
    }
    
    setMakeDistribution(topMakes);

    const evTypeCount: Record<string, number> = {};
    filteredData.forEach(item => {
      const type = item["Electric Vehicle Type"] || 'Unknown';
      evTypeCount[type] = (evTypeCount[type] || 0) + 1;
    });
    
    const evTypeData = Object.entries(evTypeCount)
      .map(([name, value]) => ({ name, value }));
    
    setEVTypeDistribution(evTypeData);

    const yearCount: Record<string, number> = {};
    filteredData.forEach(item => {
      const year = item["Model Year"] ? item["Model Year"].toString() : 'Unknown';
      yearCount[year] = (yearCount[year] || 0) + 1;
    });
    
    const yearData = Object.entries(yearCount)
      .filter(([year]) => year !== 'Unknown')
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => Number(a.name) - Number(b.name));
    
    setYearlyTrend(yearData);

    const rangeGroups = {
      '0-100': 0,
      '101-200': 0,
      '201-300': 0,
      '301-400': 0,
      '400+': 0
    };
    
    filteredData.forEach(item => {
      const range = item["Electric Range"];
      if (range === null || range === undefined) return;
      
      if (range <= 100) rangeGroups['0-100']++;
      else if (range <= 200) rangeGroups['101-200']++;
      else if (range <= 300) rangeGroups['201-300']++;
      else if (range <= 400) rangeGroups['301-400']++;
      else rangeGroups['400+']++;
    });
    
    const rangeData = Object.entries(rangeGroups)
      .map(([name, value]) => ({ name, value }));
    
    setRangeDistribution(rangeData);

    const countyCount: Record<string, number> = {};
    filteredData.forEach(item => {
      const county = item.County || 'Unknown';
      countyCount[county] = (countyCount[county] || 0) + 1;
    });
    
    const sortedCounties = Object.entries(countyCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    const topCounties = sortedCounties.slice(0, 10);
    const otherCounties = sortedCounties.slice(10);
    
    if (otherCounties.length > 0) {
      const otherTotal = otherCounties.reduce((sum, item) => sum + item.value, 0);
      topCounties.push({ name: "Others", value: otherTotal });
    }
    
    setCountyDistribution(topCounties);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p className="font-bold">Error</p>
          <p>Failed to load data: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <ArrowLeft className="mr-2" size={20} />
          <span>Back to Filter</span>
        </Link>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">EV Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Showing {filteredData.length} vehicles {Object.keys(activeFilters).length > 0 ? 'with applied filters' : ''}
          </p>
        </div>
        
        <div className="w-24"></div> 
      </div>
      
      {Object.keys(activeFilters).length > 0 && (
        <div className="mb-8 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            <Info size={18} className="mr-2 text-blue-600" />
            Applied Filters
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([key, value]) => (
              <div key={key} className="bg-white dark:bg-gray-700 px-3 py-1 rounded-full shadow-sm">
                <span className="font-medium">{key}:</span> {value}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Make Distribution</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={makeDistribution}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Number of Vehicles" fill="#1f77b4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">EV Type Distribution</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={evTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {evTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} vehicles`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Model Year Trend</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={yearlyTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name="Number of Vehicles" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Electric Range Distribution</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rangeDistribution}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="value" 
                  name="Number of Vehicles" 
                  fill="#82ca9d" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow col-span-1 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">County Distribution</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={countyDistribution}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Number of Vehicles" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {filteredData.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm uppercase">Total Vehicles</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{filteredData.length}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm uppercase">Top Make</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">
              {makeDistribution.length > 0 && makeDistribution[0].name !== "Others" ? makeDistribution[0].name : "N/A"}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm uppercase">Avg Electric Range</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">
              {filteredData.length > 0 
                ? Math.round(filteredData.reduce((sum, item) => sum + (item["Electric Range"] || 0), 0) / filteredData.length) 
                : 0} mi
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm uppercase">Most Common Year</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">
              {yearlyTrend.length > 0 
                ? yearlyTrend.reduce((max, curr) => curr.value > max.value ? curr : max, { value: 0 }).name 
                : "N/A"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardFallback() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </div>
  );
}

const Dashboard = () => {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent />
    </Suspense>
  );
};

export default Dashboard;