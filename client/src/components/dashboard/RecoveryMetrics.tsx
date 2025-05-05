import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Bed, Activity } from 'lucide-react';
import { ChartData } from '@shared/schema';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface RecoveryMetricsProps {
  chartData: ChartData | null;
  heartRate: number;
  sleepQuality: number;
  activityLevel: string;
  isLoading: boolean;
}

const RecoveryMetrics: React.FC<RecoveryMetricsProps> = ({
  chartData,
  heartRate,
  sleepQuality,
  activityLevel,
  isLoading
}) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  // Prepare data for the chart
  const prepareChartData = () => {
    if (!chartData) return [];
    
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return chartData.recoveryScores.map((score, index) => ({
      name: daysOfWeek[index % 7],
      recovery: score,
      sleep: chartData.sleepScores[index],
      activity: chartData.activityScores[index],
    }));
  };

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-sm p-6 mb-8">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-6">
            <div className="h-7 bg-gray-200 rounded w-1/3"></div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-200 rounded-full w-16"></div>
              <div className="h-8 bg-gray-200 rounded-full w-16"></div>
            </div>
          </div>
          <div className="h-64 bg-gray-200 rounded-xl mb-6"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl shadow-sm p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-nunito font-semibold text-xl">Recovery Metrics</h3>
        <div className="flex space-x-2">
          <Button 
            variant={timeRange === 'week' ? 'default' : 'outline'}
            className={`rounded-full px-3 py-1 text-sm ${timeRange === 'week' ? 'bg-[#64B5F6] text-white' : 'bg-gray-200 text-[#424242]'}`}
            onClick={() => setTimeRange('week')}
          >
            Week
          </Button>
          <Button 
            variant={timeRange === 'month' ? 'default' : 'outline'}
            className={`rounded-full px-3 py-1 text-sm ${timeRange === 'month' ? 'bg-[#64B5F6] text-white' : 'bg-gray-200 text-[#424242]'}`}
            onClick={() => setTimeRange('month')}
          >
            Month
          </Button>
        </div>
      </div>
      
      <div className="h-64 relative mb-6">
        {!chartData ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F5F5F5] rounded-xl">
            <p className="text-gray-500">No chart data available</p>
          </div>
        ) : (
          <div className="absolute inset-0 bg-[#F5F5F5] rounded-xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prepareChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="name" stroke="#424242" />
                <YAxis stroke="#424242" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="recovery"
                  stroke="#64B5F6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="sleep"
                  stroke="#81C784"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="activity"
                  stroke="#FFB74D"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-[#64B5F6] flex justify-center">
            <Heart className="h-5 w-5" />
          </div>
          <h4 className="font-nunito font-semibold text-sm">Heart Rate</h4>
          <p className="text-[#424242] font-bold">{heartRate} bpm</p>
        </div>
        
        <div className="text-center">
          <div className="text-[#81C784] flex justify-center">
            <Bed className="h-5 w-5" />
          </div>
          <h4 className="font-nunito font-semibold text-sm">Sleep Quality</h4>
          <p className="text-[#424242] font-bold">{sleepQuality}%</p>
        </div>
        
        <div className="text-center">
          <div className="text-[#FFB74D] flex justify-center">
            <Activity className="h-5 w-5" />
          </div>
          <h4 className="font-nunito font-semibold text-sm">Activity Level</h4>
          <p className="text-[#424242] font-bold">{activityLevel}</p>
        </div>
      </div>
    </Card>
  );
};

export default RecoveryMetrics;
