import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface RecoveryPlanCategory {
  name: string;
  color: string;
  bgColor: string;
  description: string;
  icon: React.ReactNode;
}

const categories: Record<string, RecoveryPlanCategory> = {
  strength: {
    name: 'Strength Recovery',
    color: '#64B5F6',
    bgColor: 'rgba(100, 181, 246, 0.2)',
    description: 'Focused exercises to restore muscular strength',
    icon: <Dumbbell className="h-5 w-5" />
  },
  mobility: {
    name: 'Mobility',
    color: '#64B5F6',
    bgColor: 'rgba(100, 181, 246, 0.2)',
    description: 'Improve range of motion and joint health',
    icon: <Activity className="h-5 w-5" />
  },
  nutrition: {
    name: 'Nutrition & Hydration',
    color: '#81C784',
    bgColor: 'rgba(129, 199, 132, 0.2)',
    description: 'Optimal fueling for recovery',
    icon: <Droplets className="h-5 w-5" />
  },
  sleep: {
    name: 'Sleep Optimization',
    color: '#FFB74D',
    bgColor: 'rgba(255, 183, 77, 0.2)',
    description: 'Improve sleep quality and duration',
    icon: <Bed className="h-5 w-5" />
  },
  mental: {
    name: 'Mental Recovery',
    color: '#9575CD',
    bgColor: 'rgba(149, 117, 205, 0.2)',
    description: 'Mind recovery techniques',
    icon: <Brain className="h-5 w-5" />
  }
};

import { 
  Dumbbell, 
  Droplets, 
  Bed, 
  Brain, 
  Activity, 
  MenuIcon, 
  ArrowRight, 
  PlusCircle 
} from 'lucide-react';

const RecoveryPlan: React.FC = () => {
  const { toast } = useToast();
  const userId = 1; // This would come from authentication
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Get current recovery plan with tasks
  const { data: plan, isLoading: isPlanLoading } = useQuery({
    queryKey: [`/api/users/${userId}/plans/current`],
  });

  // Get user data
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, progress, isCompleted }: { id: number, progress?: number, isCompleted?: boolean }) => {
      return apiRequest('PATCH', `/api/tasks/${id}`, { progress, isCompleted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/plans/current`] });
      toast({
        title: "Task updated",
        description: "Your recovery task has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "There was an error updating your task. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCompleteTask = (taskId: number) => {
    updateTaskMutation.mutate({ id: taskId, isCompleted: true });
  };

  const handleUpdateProgress = (taskId: number, progress: number) => {
    updateTaskMutation.mutate({ id: taskId, progress });
  };

  const filteredTasks = plan?.tasks ? 
    (activeCategory 
      ? plan.tasks.filter(task => task.category === activeCategory)
      : plan.tasks
    ) : [];

  if (isPlanLoading || isUserLoading) {
    return (
      <div>
        <h2 className="font-nunito font-bold text-2xl mb-6">Recovery Plan</h2>
        
        <Card className="rounded-xl shadow-sm p-6 mb-8">
          <div className="animate-pulse">
            <div className="h-7 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-16 bg-gray-200 rounded-xl mb-6"></div>
          </div>
        </Card>
        
        <div className="flex overflow-x-auto pb-4 mb-6 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const today = new Date();

  return (
    <div>
      <h2 className="font-nunito font-bold text-2xl mb-6">Your Recovery Plan</h2>
      
      {/* Overview Card */}
      <Card className="rounded-xl shadow-sm p-6 mb-8">
        <h3 className="font-nunito font-semibold text-xl mb-3">Today's Focus</h3>
        
        <div className="bg-[#F5F5F5] p-4 rounded-xl mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 text-[#64B5F6] text-xl mt-1">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="font-nunito font-semibold">
                {format(today, 'EEEE, MMMM d')}
              </p>
              <p className="text-sm text-gray-600">
                {plan?.tasks?.filter(t => t.isCompleted).length || 0} of {plan?.tasks?.length || 0} tasks completed
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-gray-700">
          {plan?.aiRecommendation || "No personalized recommendations available. Complete your assessment to get tailored recovery advice."}
        </p>
      </Card>
      
      {/* Category Filters */}
      <div className="flex overflow-x-auto pb-4 mb-6 gap-3">
        <button 
          className={`flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-xl transition-all ${
            activeCategory === null 
              ? 'bg-[#64B5F6] text-white' 
              : 'bg-[#F5F5F5] text-[#424242] hover:bg-gray-200'
          }`}
          onClick={() => setActiveCategory(null)}
        >
          <MenuIcon className="h-6 w-6 mb-1" />
          <span className="text-xs font-semibold">All Tasks</span>
        </button>
        
        {Object.entries(categories).map(([key, category]) => (
          <button 
            key={key}
            className={`flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-xl transition-all ${
              activeCategory === key 
                ? `bg-[${category.color}] text-white` 
                : `bg-[${category.bgColor}] text-[${category.color}] hover:bg-opacity-30`
            }`}
            onClick={() => setActiveCategory(activeCategory === key ? null : key)}
            style={{
              backgroundColor: activeCategory === key ? category.color : category.bgColor,
              color: activeCategory === key ? 'white' : category.color
            }}
          >
            {category.icon}
            <span className="text-xs font-semibold mt-1">{category.name}</span>
          </button>
        ))}
      </div>
      
      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-10 bg-[#F5F5F5] rounded-xl">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-nunito font-semibold text-lg mb-1">No tasks available</h3>
          <p className="text-sm text-gray-600">
            {activeCategory 
              ? `No ${activeCategory} tasks in your current plan.` 
              : "Your recovery plan is empty. Update your profile to get personalized tasks."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const category = categories[task.category] || categories.strength;
            return (
              <Card key={task.id} className="rounded-xl overflow-hidden">
                <div 
                  className="py-1 px-4 text-white text-xs font-semibold"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center" 
                      style={{ backgroundColor: category.bgColor }}
                    >
                      {category.icon}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-nunito font-semibold">{task.title}</h4>
                          <p className="text-sm text-gray-600">{task.description}</p>
                        </div>
                        <div className="flex items-center">
                          {task.time && (
                            <div className="mr-3 flex items-center text-sm text-gray-600">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{task.time}</span>
                            </div>
                          )}
                          {task.duration > 0 && (
                            <div className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                              {task.duration} min
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {task.progress > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-200">
                            <div 
                              className="h-full rounded-full" 
                              style={{ 
                                width: `${task.progress}%`, 
                                backgroundColor: category.color 
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 flex justify-between">
                        {task.isCompleted ? (
                          <div className="text-[#81C784] flex items-center">
                            <Check className="h-4 w-4 mr-1" />
                            <span className="text-sm font-semibold">Completed</span>
                          </div>
                        ) : (
                          <Button 
                            variant="outline"
                            className="rounded-xl text-sm py-1 h-8 border-gray-300"
                            onClick={() => handleUpdateProgress(task.id, Math.min(100, task.progress + 25))}
                            disabled={task.progress >= 100}
                          >
                            {task.progress === 0 ? 'Start' : 'Continue'}
                          </Button>
                        )}
                        
                        <Button 
                          className="rounded-xl py-1 h-8"
                          style={{ backgroundColor: category.color }}
                          onClick={() => handleCompleteTask(task.id)}
                          disabled={task.isCompleted}
                        >
                          {task.isCompleted ? 'Done' : 'Mark Complete'} <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Add Custom Task Button */}
      <div className="mt-8 text-center">
        <Button 
          variant="outline"
          className="rounded-xl py-6 w-full border-dashed border-gray-300 text-gray-500"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Add Custom Recovery Task
        </Button>
      </div>
    </div>
  );
};

export default RecoveryPlan;
