import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Check, ArrowLeft, Clock, Target, ChevronRight, ChevronLeft, Award, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FeedbackForm } from './FeedbackForm';

// Types for recovery exercises
export type Exercise = {
  id: string;
  name: string;
  duration: number; // in seconds
  description: string;
  instruction: string;
  equipment?: string[];
  imageUrl?: string; // URL to pose image
};

// Types for the recovery session
export type RecoverySession = {
  id: string;
  title: string;
  exercises: Exercise[];
  totalTime: number; // in seconds
  intensity: 'light' | 'moderate' | 'intense';
  focusAreas: string[];
  equipment: string[];
};

// Type for session feedback
export type SessionFeedback = {
  sessionId: string;
  userId: number;
  rating: number;
  effectiveness: number;
  difficulty: number;
  enjoyment: number;
  feedback: string;
  completedAt: Date;
  exerciseFeedback?: ExerciseFeedback[];
};

// Type for individual exercise feedback
export type ExerciseFeedback = {
  exerciseId: string;
  exerciseName: string;
  rating: number;
  difficulty: number;
  effectiveness: number;
  feedback?: string;
};

// Interface for component props
interface RecoveryFlowSessionProps {
  session: RecoverySession | null;
  onComplete: () => void;
  onBack: () => void;
}

const RecoveryFlowSession: React.FC<RecoveryFlowSessionProps> = ({
  session,
  onComplete,
  onBack
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const { toast } = useToast();

  // Current exercise
  const currentExercise = session?.exercises[currentExerciseIndex];
  
  // Calculate overall progress percentage
  const overallProgress = session ? (totalElapsedTime / session.totalTime) * 100 : 0;
  
  // Exercise progress percentage
  const exerciseProgress = currentExercise ? 
    ((currentExercise.duration - timeRemaining) / currentExercise.duration) * 100 : 0;

  // Initialize timeRemaining when currentExercise changes
  useEffect(() => {
    if (currentExercise) {
      setTimeRemaining(currentExercise.duration);
    }
  }, [currentExercise]);

  // Timer effect
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    
    if (isPlaying && timeRemaining > 0) {
      timerId = setInterval(() => {
        setTimeRemaining(prevTime => {
          const newTime = prevTime - 1;
          setTotalElapsedTime(prev => prev + 1);
          return newTime;
        });
      }, 1000);
    } else if (isPlaying && timeRemaining === 0) {
      // Move to next exercise or complete session
      if (session && currentExerciseIndex < session.exercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setSessionComplete(true);
      }
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isPlaying, timeRemaining, currentExerciseIndex, session]);

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <div className="text-amber-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">No Recovery Flow Available</h2>
          <p className="text-gray-600 mb-6">We couldn't find the session data. Please return to the dashboard and create a new recovery flow.</p>
          <Button onClick={onBack} className="w-full">Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < session.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      setSessionComplete(true);
    }
  };
  
  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentExerciseIndex(0);
    setIsPlaying(false);
    setSessionComplete(false);
    setTotalElapsedTime(0);
  };


  
  // Toggle feedback form display
  const toggleFeedbackForm = () => {
    setShowFeedbackForm(!showFeedbackForm);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };
  
  const getIntensityIcon = (intensity: string) => {
    switch(intensity) {
      case 'light':
        return <div className="bg-blue-100 p-2 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M17 11v6"></path><path d="M5 7v12"></path><path d="M11 3v18"></path></svg></div>;
      case 'moderate':
        return <div className="bg-blue-100 p-2 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M17 7v11"></path><path d="M11 3v18"></path><path d="M5 7v11"></path></svg></div>;
      case 'intense':
        return <div className="bg-blue-100 p-2 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M5 3v11"></path><path d="M11 3v18"></path><path d="M17 3v11"></path></svg></div>;
      default:
        return null;
    }
  };

  // Render completion screen if session is complete
  if (sessionComplete) {
    return (
      <div className="h-screen max-w-5xl mx-auto p-4 py-12 bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6 shadow-xl">
            <Check className="h-16 w-16 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold mb-2 text-gray-800">Recovery Complete!</h1>
          <p className="text-xl text-gray-600 mb-10">Excellent work! Your body will thank you for the care and attention.</p>
          
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600">{session.exercises.length}</div>
                <div className="text-sm text-gray-500 mt-1">Exercises Completed</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600">{Math.round(session.totalTime / 60)}</div>
                <div className="text-sm text-gray-500 mt-1">Minutes of Recovery</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600">{session.focusAreas.length}</div>
                <div className="text-sm text-gray-500 mt-1">Target Areas</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4 text-left">Recovery Session Details</h3>
            <div className="text-left grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-sm text-gray-500">Session Title</p>
                <p className="font-medium">{session.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Intensity Level</p>
                <p className="font-medium capitalize">{session.intensity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Focus Areas</p>
                <p className="font-medium">
                  {session.focusAreas.map(area => area.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')).join(', ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Equipment Used</p>
                <p className="font-medium">
                  {session.equipment.length === 1 && session.equipment[0] === 'none' 
                    ? 'No Equipment' 
                    : session.equipment.map(eq => eq.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')).join(', ')}
                </p>
              </div>
            </div>
          </div>
          
          {/* Feedback form */}
          {!showFeedbackForm ? (
            <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-100 mb-8">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Help us improve your recovery experience</h3>
              </div>
              <p className="text-gray-600 mb-4">Your feedback helps our AI model learn and provide more personalized recommendations just for you.</p>
              <Button 
                onClick={toggleFeedbackForm} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Share Your Feedback
              </Button>
            </div>
          ) : (
            <div className="mb-8">
              <FeedbackForm 
                sessionId={session.id} 
                userId={1} // Default user for now
                exercises={session.exercises} 
                onSubmitComplete={() => {
                  setShowFeedbackForm(false);
                  toast({
                    title: "Feedback Submitted",
                    description: "Thank you for your feedback! Your input helps improve future recovery sessions.",
                  });
                }}
                onCancel={() => setShowFeedbackForm(false)}
              />
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={onBack} className="px-8">
              Return to Dashboard
            </Button>
            <Button onClick={handleReset} className="px-8 bg-blue-600 hover:bg-blue-700">
              Start New Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="ghost" onClick={onBack} className="flex items-center text-gray-600">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
        
        <div className="flex items-center space-x-2">
          {getIntensityIcon(session.intensity)}
          <span className="text-sm font-medium capitalize">{session.intensity} Intensity</span>
        </div>
      </div>

      <Card className="w-full overflow-hidden bg-white shadow-lg border-0 rounded-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 relative">
          <div className="absolute top-0 right-0 w-full h-full bg-pattern opacity-10" 
               style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjZmZmIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDIwQzAgOC45NTQgOC45NTQgMCAyMCAwczIwIDguOTU0IDIwIDIwLTguOTU0IDIwLTIwIDIwUzAgMzEuMDQ2IDAgMjB6bTQgMGMwIDguODM3IDcuMTYzIDE2IDE2IDE2czE2LTcuMTYzIDE2LTE2UzI4LjgzNyA0IDIwIDQgNCAxMS4xNjMgNCAyMHoiLz48L2c+PC9zdmc+Cg==')" }}>
          </div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-blue-100 text-sm flex items-center space-x-2 mb-2">
                  <span className="px-2 py-0.5 bg-white/20 rounded-full">Exercise {currentExerciseIndex + 1} of {session.exercises.length}</span>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full">{formatTime(Math.floor(session.totalTime - totalElapsedTime))} remaining</span>
                </div>
                <CardTitle className="text-3xl font-bold mb-1">{session.title}</CardTitle>
                <p className="text-blue-100 mb-4">
                  Focus areas: {session.focusAreas.map(area => area.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')).join(', ')}
                </p>
              </div>
              
              <div className="hidden md:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <Progress value={overallProgress} className="h-3 w-48 bg-white/30" />
                  <p className="text-center text-sm text-white mt-1">{Math.round(overallProgress)}% Complete</p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 relative">
          <div className="bg-gray-50 w-full h-1 md:hidden">
            <div 
              className="bg-blue-500 h-1" 
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
            
          <div className="p-8">
            <div className="mb-8">
              {/* Timeline */}
              <div className="relative flex justify-between mb-2">
                {session.exercises.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-4 h-4 rounded-full border-2 ${idx <= currentExerciseIndex ? 'bg-blue-500 border-blue-500' : 'bg-gray-200 border-gray-300'}`}
                  ></div>
                ))}
                <div className="absolute top-1.5 h-0.5 bg-gray-200 w-full -z-10"></div>
                <div 
                  className="absolute top-1.5 h-0.5 bg-blue-500 -z-10" 
                  style={{ width: `${(currentExerciseIndex / (session.exercises.length - 1)) * 100}%` }}
                ></div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{currentExercise?.name}</h2>
                    <p className="text-gray-600">{currentExercise?.description}</p>
                  </div>
                  <div className="bg-blue-50 rounded-full h-20 w-20 flex flex-col items-center justify-center border-4 border-blue-100">
                    <span className="text-2xl font-bold text-blue-600">{Math.ceil(timeRemaining / 60)}</span>
                    <span className="text-xs text-blue-500">minutes</span>
                  </div>
                </div>
                
                {/* Pose Image Display */}
                {currentExercise?.imageUrl && (
                  <div className="bg-gray-50 p-4 rounded-xl mt-4 border border-gray-100">
                    <h4 className="text-gray-700 font-medium mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      Reference Pose
                    </h4>
                    <div className="flex justify-center">
                      <img 
                        src={currentExercise.imageUrl} 
                        alt={`${currentExercise.name} pose reference`} 
                        className="rounded-lg max-h-80 object-contain border border-gray-200 bg-white p-2 shadow-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6">
                <h3 className="font-semibold mb-3 flex items-center text-blue-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  Instructions
                </h3>
                <p className="text-blue-700">{currentExercise?.instruction}</p>
              </div>
              
              {currentExercise?.equipment && currentExercise.equipment.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Equipment Needed:</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentExercise.equipment.map(item => (
                      <span key={item} className="bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-700 border border-gray-200">
                        {item.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center bg-gray-50 rounded-lg p-4 mb-6">
              <span className="text-gray-600 text-sm font-medium">Time remaining</span>
              <span className="font-bold text-blue-600">{formatTime(timeRemaining)}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center p-6 bg-gray-50 border-t border-gray-100">
          <Button 
            onClick={handlePrevExercise} 
            variant="outline" 
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
            disabled={currentExerciseIndex === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="rounded-lg"
            >
              <RotateCcw className="h-4 w-4 mr-1" /> Reset
            </Button>
            
            <Button 
              onClick={handleTogglePlay}
              className={`rounded-full w-14 h-14 flex items-center justify-center shadow-lg ${isPlaying ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
            </Button>
          </div>
          
          <Button 
            onClick={handleNextExercise}
            variant="outline" 
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
            disabled={currentExerciseIndex === session.exercises.length - 1}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RecoveryFlowSession;