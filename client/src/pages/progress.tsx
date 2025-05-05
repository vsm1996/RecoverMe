import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Calendar, 
  TrendingUp, 
  Heart, 
  Bed, 
  Droplets, 
  Brain, 
  HeartPulse 
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { format, subDays } from 'date-fns';

const Progress: React.FC = () => {
  const userId = 1; // This would come from authentication
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  // Get recovery metrics history
  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: [`/api/users/${userId}/metrics`],
  });

  // Get chart data
  const { data: chartData, isLoading: isChartLoading } = useQuery({
    queryKey: [`/api/users/${userId}/chart-data`],
  });

  // Get movement assessments
  const { data: assessments, isLoading: isAssessmentsLoading } = useQuery({
    queryKey: [`/api/users/${userId}/assessments`],
  });

  // Generate dates for the past week or month
  const generateDateLabels = (range: 'week' | 'month' | 'year'): string[] => {
    const dates: string[] = [];
    const format_string = range === 'year' ? 'MMM' : 'MMM d';
    const days = range === 'week' ? 7 : range === 'month' ? 30 : 12;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      dates.push(format(date, format_string));
    }
    
    return dates;
  };

  // Prepare data for charts
  const prepareChartData = () => {
    if (!chartData || chartData.length === 0) {
      const dateLabels = generateDateLabels(timeRange);
      return dateLabels.map(date => ({
        name: date,
        recovery: 0,
        sleep: 0,
        activity: 0
      }));
    }
    
    const data = chartData[0];
    const dateLabels = generateDateLabels(timeRange);
    
    return dateLabels.map((date, index) => ({
      name: date,
      recovery: data.recoveryScores[index % data.recoveryScores.length] || 0,
      sleep: data.sleepScores[index % data.sleepScores.length] || 0,
      activity: data.activityScores[index % data.activityScores.length] || 0
    }));
  };

  // Prepare data for the health score radar chart
  const prepareSorenessData = () => {
    if (!metrics || metrics.length === 0) return [];
    
    const latestMetric = metrics[0];
    const sorenessData = latestMetric.soreness || {};
    
    return Object.entries(sorenessData).map(([area, level]) => ({
      subject: area.charAt(0).toUpperCase() + area.slice(1),
      score: 5 - level, // Convert soreness level (0-5) to a "wellness" score (5-0)
      fullMark: 5
    }));
  };

  // Generate sample sleep data
  const prepareSleepData = () => {
    if (!metrics || metrics.length === 0) return [];
    
    return metrics.slice(0, 7).map((metric, index) => {
      const date = subDays(new Date(), 6 - index);
      return {
        name: format(date, 'EEE'),
        light: metric.sleepQuality ? metric.sleepQuality * 0.4 / 100 * 8 : 3,
        deep: metric.sleepQuality ? metric.sleepQuality * 0.3 / 100 * 8 : 2,
        rem: metric.sleepQuality ? metric.sleepQuality * 0.3 / 100 * 8 : 2.5
      };
    });
  };

  // Get the average, min, and max of the recovery scores
  const getRecoveryStats = () => {
    if (!chartData || chartData.length === 0) {
      return { avg: 0, min: 0, max: 0 };
    }
    
    const scores = chartData[0].recoveryScores || [];
    if (scores.length === 0) return { avg: 0, min: 0, max: 0 };
    
    const sum = scores.reduce((a, b) => a + b, 0);
    return {
      avg: Math.round(sum / scores.length),
      min: Math.min(...scores),
      max: Math.max(...scores)
    };
  };

  const recoveryStats = getRecoveryStats();

  if (isMetricsLoading || isChartLoading || isAssessmentsLoading) {
    return (
      <div>
        <h2 className="font-nunito font-bold text-2xl mb-6">Progress Tracking</h2>
        
        <Card className="rounded-xl shadow-sm p-6 mb-8">
          <div className="animate-pulse">
            <div className="h-7 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="flex justify-between items-center mb-6">
              <div className="h-5 bg-gray-200 rounded w-1/4"></div>
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-200 rounded-full w-16"></div>
                <div className="h-8 bg-gray-200 rounded-full w-16"></div>
                <div className="h-8 bg-gray-200 rounded-full w-16"></div>
              </div>
            </div>
            <div className="h-64 bg-gray-200 rounded-xl mb-6"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-nunito font-bold text-2xl mb-6">Progress Tracking</h2>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#64B5F6] bg-opacity-10 flex items-center justify-center mr-4">
              <TrendingUp className="h-6 w-6 text-[#64B5F6]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Recovery</p>
              <p className="text-2xl font-bold">{recoveryStats.avg}%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#81C784] bg-opacity-10 flex items-center justify-center mr-4">
              <HeartPulse className="h-6 w-6 text-[#81C784]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Improved Readiness</p>
              <p className="text-2xl font-bold">+{recoveryStats.max - recoveryStats.avg}%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#FFB74D] bg-opacity-10 flex items-center justify-center mr-4">
              <Calendar className="h-6 w-6 text-[#FFB74D]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tracked Days</p>
              <p className="text-2xl font-bold">{metrics?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Progress Charts */}
      <Card className="rounded-xl shadow-sm p-6 mb-8">
        <h3 className="font-nunito font-semibold text-xl mb-3">Recovery Trends</h3>
        
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-600">Track your progress over time</p>
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
            <Button 
              variant={timeRange === 'year' ? 'default' : 'outline'}
              className={`rounded-full px-3 py-1 text-sm ${timeRange === 'year' ? 'bg-[#64B5F6] text-white' : 'bg-gray-200 text-[#424242]'}`}
              onClick={() => setTimeRange('year')}
            >
              Year
            </Button>
          </div>
        </div>
        
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={prepareChartData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="name" stroke="#424242" />
              <YAxis stroke="#424242" />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="recovery" 
                stroke="#64B5F6" 
                fillOpacity={0.2} 
                fill="#64B5F6" 
                name="Recovery Score"
              />
              <Area 
                type="monotone" 
                dataKey="sleep" 
                stroke="#81C784" 
                fillOpacity={0.2} 
                fill="#81C784" 
                name="Sleep Quality"
              />
              <Area 
                type="monotone" 
                dataKey="activity" 
                stroke="#FFB74D" 
                fillOpacity={0.2} 
                fill="#FFB74D" 
                name="Activity Level"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Detailed Metrics Tabs */}
      <Tabs defaultValue="recovery" className="mb-8">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="recovery" className="rounded-xl data-[state=active]:bg-[#64B5F6] data-[state=active]:text-white">
            <Activity className="h-4 w-4 mr-2" /> Recovery
          </TabsTrigger>
          <TabsTrigger value="sleep" className="rounded-xl data-[state=active]:bg-[#81C784] data-[state=active]:text-white">
            <Bed className="h-4 w-4 mr-2" /> Sleep
          </TabsTrigger>
          <TabsTrigger value="wellness" className="rounded-xl data-[state=active]:bg-[#FFB74D] data-[state=active]:text-white">
            <Heart className="h-4 w-4 mr-2" /> Wellness
          </TabsTrigger>
          <TabsTrigger value="assessments" className="rounded-xl data-[state=active]:bg-[#9575CD] data-[state=active]:text-white">
            <Brain className="h-4 w-4 mr-2" /> Assessments
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="recovery">
          <Card className="rounded-xl shadow-sm overflow-hidden">
            <div className="py-1 px-4 bg-[#64B5F6] text-white text-xs font-semibold">
              RECOVERY SCORE ANALYSIS
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-nunito font-semibold mb-4">Recovery Balance</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prepareChartData()} barGap={0}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                        <XAxis dataKey="name" stroke="#424242" />
                        <YAxis stroke="#424242" />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="recovery" 
                          fill="#64B5F6" 
                          name="Recovery Score" 
                        />
                        <Bar 
                          dataKey="sleep" 
                          fill="#81C784" 
                          name="Sleep Quality" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-nunito font-semibold mb-4">Recovery Insights</h4>
                  <div className="bg-[#F5F5F5] p-4 rounded-xl mb-4">
                    <div className="flex items-start">
                      <TrendingUp className="h-5 w-5 text-[#64B5F6] mt-1" />
                      <div className="ml-3">
                        <p className="font-nunito font-semibold">Improving Trend</p>
                        <p className="text-sm text-gray-600">
                          Your recovery scores are showing an upward trend over the past {timeRange}.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Heart Rate Variability</span>
                      <span className="text-sm">Excellent</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div 
                        className="h-full rounded-full bg-[#64B5F6]" 
                        style={{ width: '85%' }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Resting Heart Rate</span>
                      <span className="text-sm">Good</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div 
                        className="h-full rounded-full bg-[#64B5F6]" 
                        style={{ width: '72%' }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Sleep Recovery</span>
                      <span className="text-sm">Moderate</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div 
                        className="h-full rounded-full bg-[#64B5F6]" 
                        style={{ width: '65%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sleep">
          <Card className="rounded-xl shadow-sm overflow-hidden">
            <div className="py-1 px-4 bg-[#81C784] text-white text-xs font-semibold">
              SLEEP QUALITY ANALYSIS
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-nunito font-semibold mb-4">Sleep Patterns</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prepareSleepData()} barGap={0}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                        <XAxis dataKey="name" stroke="#424242" />
                        <YAxis stroke="#424242" />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="light" 
                          fill="#B3E5FC" 
                          name="Light Sleep (hrs)" 
                          stackId="a" 
                        />
                        <Bar 
                          dataKey="deep" 
                          fill="#4FC3F7" 
                          name="Deep Sleep (hrs)" 
                          stackId="a" 
                        />
                        <Bar 
                          dataKey="rem" 
                          fill="#0288D1" 
                          name="REM Sleep (hrs)" 
                          stackId="a" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-nunito font-semibold mb-4">Sleep Insights</h4>
                  <div className="bg-[#F5F5F5] p-4 rounded-xl mb-4">
                    <div className="flex items-start">
                      <Bed className="h-5 w-5 text-[#81C784] mt-1" />
                      <div className="ml-3">
                        <p className="font-nunito font-semibold">Sleep Consistency</p>
                        <p className="text-sm text-gray-600">
                          Your sleep consistency is good, but could be improved by going to bed at the same time each night.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Average Sleep Duration</span>
                      <span className="text-sm font-bold">7.5 hrs</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Sleep Efficiency</span>
                      <span className="text-sm font-bold">86%</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Optimal Bedtime</span>
                      <span className="text-sm font-bold">10:30 PM</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Optimal Wake Time</span>
                      <span className="text-sm font-bold">6:30 AM</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="wellness">
          <Card className="rounded-xl shadow-sm overflow-hidden">
            <div className="py-1 px-4 bg-[#FFB74D] text-white text-xs font-semibold">
              BODY WELLNESS STATUS
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-nunito font-semibold mb-4">Muscle Wellness</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={90} data={prepareSorenessData()}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis domain={[0, 5]} />
                        <Radar
                          name="Wellness Score" 
                          dataKey="score" 
                          stroke="#FFB74D" 
                          fill="#FFB74D" 
                          fillOpacity={0.5} 
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm text-center text-gray-600 mt-2">
                    Lower values indicate areas with more soreness/tension
                  </p>
                </div>
                
                <div>
                  <h4 className="font-nunito font-semibold mb-4">Wellness Insights</h4>
                  <div className="bg-[#F5F5F5] p-4 rounded-xl mb-4">
                    <div className="flex items-start">
                      <Heart className="h-5 w-5 text-[#FFB74D] mt-1" />
                      <div className="ml-3">
                        <p className="font-nunito font-semibold">Hydration Status</p>
                        <p className="text-sm text-gray-600">
                          Your hydration levels could be improved. Try to drink more water throughout the day, especially before and after workouts.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mt-6">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">Stress Level</span>
                        <span className="text-sm font-bold">Medium</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200 mt-1">
                        <div 
                          className="h-full rounded-full bg-[#FFB74D]" 
                          style={{ width: '60%' }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">Hydration</span>
                        <span className="text-sm font-bold">Good</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200 mt-1">
                        <div 
                          className="h-full rounded-full bg-[#FFB74D]" 
                          style={{ width: '75%' }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">Energy Levels</span>
                        <span className="text-sm font-bold">Moderate</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200 mt-1">
                        <div 
                          className="h-full rounded-full bg-[#FFB74D]" 
                          style={{ width: '65%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assessments">
          <Card className="rounded-xl shadow-sm overflow-hidden">
            <div className="py-1 px-4 bg-[#9575CD] text-white text-xs font-semibold">
              MOVEMENT ASSESSMENT HISTORY
            </div>
            <CardContent className="p-6">
              {assessments && assessments.length > 0 ? (
                <div className="space-y-4">
                  {assessments.slice(0, 3).map((assessment, index) => (
                    <div key={index} className="border rounded-xl p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 mr-3 flex-shrink-0">
                            {assessment.imageUrl && (
                              <img 
                                src={assessment.imageUrl} 
                                alt={`Assessment from ${format(new Date(assessment.date), 'MMM d, yyyy')}`}
                                className="w-full h-full object-cover" 
                              />
                            )}
                          </div>
                          <div>
                            <h5 className="font-nunito font-semibold">
                              Assessment on {format(new Date(assessment.date), 'MMMM d, yyyy')}
                            </h5>
                            <p className="text-sm text-gray-600">
                              Overall Score: {assessment.analysisResult.overallScore}/100
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline"
                          className="text-[#9575CD] border-[#9575CD]"
                        >
                          View Details
                        </Button>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {assessment.analysisResult.recommendations.map((rec, i) => (
                          <div key={i} className="bg-[#9575CD] bg-opacity-10 text-[#9575CD] px-3 py-1 rounded-full text-xs">
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="font-nunito font-semibold text-lg mb-1">No assessments yet</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Complete your first movement assessment to get insights on your mobility and form.
                  </p>
                  <Button className="bg-[#9575CD]">Start Assessment</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Progress;
