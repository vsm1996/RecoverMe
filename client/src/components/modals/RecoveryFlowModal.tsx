import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Clock, Dumbbell, Target, Activity, Zap, Heart, RotateCcw, Waves, BookOpen, Feather, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';

interface RecoveryPreferences {
  equipment: string[];
  time: number;
  focuses: string[];
  intensity: string;
}

interface RecoveryFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFlow: (preferences: RecoveryPreferences) => void;
  currentSoreness?: Record<string, number> | null;
}

const EQUIPMENT_OPTIONS = [
  { id: 'none', label: 'No Equipment', icon: <Feather className="h-5 w-5 text-blue-600" /> },
  { id: 'foam_roller', label: 'Foam Roller', icon: <RotateCcw className="h-5 w-5 text-blue-600" /> },
  { id: 'massage_ball', label: 'Massage Ball', icon: <Waves className="h-5 w-5 text-blue-600" /> },
  { id: 'resistance_band', label: 'Resistance Band', icon: <BookOpen className="h-5 w-5 text-blue-600" /> },
  { id: 'yoga_block', label: 'Yoga Block', icon: <div className="h-5 w-5 bg-blue-600 rounded-sm" /> },
  { id: 'yoga_strap', label: 'Yoga Strap', icon: <div className="h-5 w-5 border-2 border-blue-600 rounded-full" /> }
];

const FOCUS_OPTIONS = [
  { id: 'full_body', label: 'Full Body', icon: <Target className="h-5 w-5 text-blue-600" /> },
  { id: 'upper_body', label: 'Upper Body', icon: <Dumbbell className="h-5 w-5 text-blue-600" /> },
  { id: 'lower_body', label: 'Lower Body', icon: <div className="flex justify-center"><span className="text-blue-600 font-bold">L</span></div> },
  { id: 'back', label: 'Back', icon: <Activity className="h-5 w-5 text-blue-600" /> },
  { id: 'shoulders', label: 'Shoulders', icon: <div className="flex justify-center"><span className="text-blue-600 font-bold">S</span></div> },
  { id: 'hips', label: 'Hips', icon: <Heart className="h-5 w-5 text-blue-600" /> },
  { id: 'legs', label: 'Legs', icon: <div className="flex justify-center"><span className="text-blue-600 font-bold">L</span></div> }
];

const INTENSITY_OPTIONS = [
  { id: 'light', label: 'Light', description: 'Gentle, minimal effort', icon: <div className="flex items-center"><Zap className="h-4 w-4 text-blue-600 mr-1 opacity-50" /></div>, value: 1 },
  { id: 'moderate', label: 'Moderate', description: 'Balanced intensity', icon: <div className="flex items-center"><Zap className="h-4 w-4 text-blue-600 mr-1" /><Zap className="h-4 w-4 text-blue-600" /></div>, value: 2 },
  { id: 'intense', label: 'Intense', description: 'Challenging recovery', icon: <div className="flex items-center"><Zap className="h-4 w-4 text-blue-600 mr-1" /><Zap className="h-4 w-4 text-blue-600 mr-1" /><Zap className="h-4 w-4 text-blue-600" /></div>, value: 3 }
];

const RecoveryFlowModal: React.FC<RecoveryFlowModalProps> = ({
  isOpen,
  onClose,
  onStartFlow,
  currentSoreness
}) => {
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(['none']);
  const [selectedFocuses, setSelectedFocuses] = useState<string[]>(['full_body']);
  const [intensity, setIntensity] = useState<string>('moderate');
  const [intensityValue, setIntensityValue] = useState<number>(2);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [time, setTime] = useState<number>(15);
  
  const handleEquipmentToggle = (id: string) => {
    if (id === 'none') {
      // If "none" is selected, deselect all other equipment
      setSelectedEquipment(['none']);
    } else {
      // If any other equipment is selected, remove "none"
      setSelectedEquipment(prev => {
        const newSelection = prev.filter(item => item !== 'none');
        
        // Toggle the current selection
        if (newSelection.includes(id)) {
          newSelection.splice(newSelection.indexOf(id), 1);
        } else {
          newSelection.push(id);
        }
        
        // If no equipment is selected, set back to "none"
        return newSelection.length ? newSelection : ['none'];
      });
    }
  };
  
  const handleFocusToggle = (id: string) => {
    if (id === 'full_body') {
      // If "full_body" is selected, deselect all other focuses
      setSelectedFocuses(['full_body']);
    } else {
      // If any other focus is selected, remove "full_body"
      setSelectedFocuses(prev => {
        const newSelection = prev.filter(item => item !== 'full_body');
        
        // Toggle the current selection
        if (newSelection.includes(id)) {
          newSelection.splice(newSelection.indexOf(id), 1);
        } else {
          newSelection.push(id);
        }
        
        // If no focus is selected, set back to "full_body"
        return newSelection.length ? newSelection : ['full_body'];
      });
    }
  };

  const handleSubmit = () => {
    const preferences = {
      equipment: selectedEquipment,
      time,
      focuses: selectedFocuses,
      intensity
    };
    onStartFlow(preferences);
  };
  
  const getTimeLabel = (value: number) => {
    if (value === 5) return '5 min (Quick)';
    if (value === 15) return '15 min';
    if (value === 30) return '30 min';
    if (value === 45) return '45 min';
    if (value === 60) return '60 min (Full)';
    return `${value} min`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-t-xl text-white relative">
          <div className="absolute top-0 right-0 w-full h-full bg-pattern opacity-10" 
               style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjZmZmIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDIwQzAgOC45NTQgOC45NTQgMCAyMCAwczIwIDguOTU0IDIwIDIwLTguOTU0IDIwLTIwIDIwUzAgMzEuMDQ2IDAgMjB6bTQgMGMwIDguODM3IDcuMTYzIDE2IDE2IDE2czE2LTcuMTYzIDE2LTE2UzI4LjgzNyA0IDIwIDQgNCAxMS4xNjMgNCAyMHoiLz48L2c+PC9zdmc+Cg==')" }}>
          </div>
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-3xl font-bold text-center">
              Create Your Recovery Flow
            </DialogTitle>
            <p className="text-center text-blue-100 mt-3 text-lg">Personalize your recovery session in 4 simple steps</p>
          </DialogHeader>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[70vh] bg-gray-50">
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-6 sticky top-0 z-10 bg-white py-3 px-1 border-b border-gray-100 shadow-sm rounded-lg">
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>

          {/* Duration Section */}
          <section className="mb-12">
            <div className="flex items-center mb-3 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-500 shadow-sm text-white mr-3">
                <Clock className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-xl text-blue-800">Recovery Session Duration</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6 ml-12">Choose how long you would like your recovery session to be</p>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm">
              <div className="mb-6">
                <div className="relative pt-6">
                  {/* Time markers */}
                  <div className="absolute w-full -mt-4 flex justify-between">
                    {[5, 15, 30, 45, 60].map(value => (
                      <button 
                        key={value}
                        onClick={() => setTime(value)} 
                        className={`h-10 w-10 rounded-full ${time === value ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-300'} flex items-center justify-center text-sm font-medium transition-all hover:scale-110 focus:outline-none`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  
                  {/* The actual slider */}
                  <Slider
                    value={[time]}
                    onValueChange={(values) => setTime(values[0])}
                    min={5}
                    max={60}
                    step={5}
                    className="mb-4 mt-4"
                  />
                </div>
                
                {/* Time labels */}
                <div className="flex justify-between text-xs text-gray-500 px-1 mt-4">
                  <div className="text-center flex flex-col items-center">
                    <Clock className="h-4 w-4 mb-1 text-blue-600" />
                    <span>Quick</span>
                  </div>
                  <div className="text-center flex flex-col items-center">
                    <Clock className="h-4 w-4 mb-1 text-blue-600" />
                    <span>Standard</span>
                  </div>
                  <div className="text-center flex flex-col items-center">
                    <Clock className="h-4 w-4 mb-1 text-blue-600" />
                    <span>Extended</span>
                  </div>
                  <div className="text-center flex flex-col items-center">
                    <Clock className="h-4 w-4 mb-1 text-blue-600" />
                    <span>Complete</span>
                  </div>
                  <div className="text-center flex flex-col items-center">
                    <Clock className="h-4 w-4 mb-1 text-blue-600" />
                    <span>Full</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="text-center bg-white rounded-full h-24 w-24 flex flex-col items-center justify-center shadow-xl border-4 border-blue-100">
                  <span className="font-bold text-4xl text-blue-600">{time}</span>
                  <p className="text-sm text-gray-500 mt-1">minutes</p>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-blue-800">
                  {time < 15 && "Quick session - perfect for a busy day"}
                  {time >= 15 && time < 30 && "Standard session - balanced recovery time"}
                  {time >= 30 && time < 45 && "Extended session - deep recovery focus"}
                  {time >= 45 && time < 60 && "Complete session - comprehensive recovery"}
                  {time >= 60 && "Full session - maximum recovery benefits"}
                </p>
              </div>
            </div>
          </section>
          
          {/* Focus Section */}
          <section className="mb-12">
            <div className="flex items-center mb-3 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-500 shadow-sm text-white mr-3">
                <Target className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-xl text-blue-800">Target Areas</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6 ml-12">Select the body regions you want to focus on during your recovery</p>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {FOCUS_OPTIONS.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => handleFocusToggle(option.id)}
                    className={cn(
                      "relative overflow-hidden rounded-xl cursor-pointer transition-all hover:shadow-md",
                      selectedFocuses.includes(option.id)
                        ? "ring-2 ring-blue-500 shadow-md"
                        : "border border-gray-200 hover:border-blue-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center",
                      selectedFocuses.includes(option.id) 
                        ? "bg-blue-500" 
                        : "bg-gray-200"
                    )}>
                      {selectedFocuses.includes(option.id) && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      )}
                    </div>
                    <div className={cn(
                      "flex flex-col items-center text-center p-4",
                      selectedFocuses.includes(option.id)
                        ? "bg-gradient-to-b from-blue-50 to-white"
                        : "bg-white"
                    )}>
                      <div className="mb-2 p-3 rounded-full bg-blue-100 w-14 h-14 flex items-center justify-center">
                        {option.icon}
                      </div>
                      <span className={cn(
                        "font-medium",
                        selectedFocuses.includes(option.id) ? "text-blue-700" : "text-gray-700"
                      )}>
                        {option.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {currentSoreness && Object.keys(currentSoreness).length > 0 && (
                <div className="mt-8 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-yellow-200 shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="bg-amber-100 p-2 rounded-full mr-3 text-amber-700">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    </div>
                    <h4 className="font-semibold text-amber-800">Smart Recommendations</h4>
                  </div>
                  
                  <p className="text-amber-700 text-sm mb-3 pl-9">
                    Based on your reported soreness levels, we recommend focusing on:
                  </p>
                  
                  <div className="pl-9">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(currentSoreness)
                        .filter(([_, value]) => value > 5)
                        .map(([area, value]) => (
                          <div key={area} className="bg-white/50 border border-amber-200 px-3 py-1.5 rounded-full">
                            <span className="font-medium text-sm text-amber-800">{area.replace('_', ' ')}</span>
                            <span className="ml-1 text-xs text-amber-600">(level: {value}/10)</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
          
          {/* Equipment Section */}
          <section className="mb-12">
            <div className="flex items-center mb-3 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-500 shadow-sm text-white mr-3">
                <Dumbbell className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-xl text-blue-800">Recovery Tools</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6 ml-12">Select what equipment you have available for your session</p>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {EQUIPMENT_OPTIONS.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => handleEquipmentToggle(option.id)}
                    className={cn(
                      "relative overflow-hidden rounded-xl cursor-pointer transition-all hover:shadow-md",
                      selectedEquipment.includes(option.id)
                        ? "ring-2 ring-blue-500 shadow-md"
                        : "border border-gray-200 hover:border-blue-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center",
                      selectedEquipment.includes(option.id) 
                        ? "bg-blue-500" 
                        : "bg-gray-200"
                    )}>
                      {selectedEquipment.includes(option.id) && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      )}
                    </div>
                    <div className={cn(
                      "flex flex-col items-center text-center p-4",
                      selectedEquipment.includes(option.id)
                        ? "bg-gradient-to-b from-blue-50 to-white"
                        : "bg-white"
                    )}>
                      <div className="mb-2 p-3 rounded-full bg-blue-100 w-14 h-14 flex items-center justify-center">
                        {option.icon}
                      </div>
                      <span className={cn(
                        "font-medium",
                        selectedEquipment.includes(option.id) ? "text-blue-700" : "text-gray-700"
                      )}>
                        {option.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {/* Intensity Section */}
          <section className="mb-8">
            <div className="flex items-center mb-3 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-500 shadow-sm text-white mr-3">
                <Activity className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-xl text-blue-800">Recovery Intensity</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6 ml-12">Select how challenging you want your recovery session to be</p>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm">
              <div className="mb-10">
                <div className="relative">
                  {/* Slider track and labels */}
                  <div className="h-20 pt-10 pb-4 px-4 relative">
                    {/* Custom slider track background */}
                    <div className="absolute inset-x-0 top-10 h-6 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-400 rounded-full"></div>
                    
                    {/* Custom interactive slider */}
                    <div
                      className="relative h-6 mx-4"
                      onMouseDown={(e) => {
                        // Calculate which part of the track was clicked
                        const rect = e.currentTarget.getBoundingClientRect();
                        const handleSliderMove = (clientX: number) => {
                          const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
                          const percentage = x / rect.width;
                          
                          // Set intensity based on which third of the slider was clicked
                          if (percentage <= 0.33) {
                            setIntensityValue(1);
                            setIntensity('light');
                          } else if (percentage <= 0.66) {
                            setIntensityValue(2);
                            setIntensity('moderate');
                          } else {
                            setIntensityValue(3);
                            setIntensity('intense');
                          }
                        };
                        
                        // Handle initial click
                        handleSliderMove(e.clientX);
                        setIsDragging(true);
                        
                        // Add mousemove and mouseup event listeners
                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          if (isDragging) {
                            handleSliderMove(moveEvent.clientX);
                          }
                        };
                        
                        const handleMouseUp = () => {
                          setIsDragging(false);
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const handleSliderMove = (clientX: number) => {
                          const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
                          const percentage = x / rect.width;
                          
                          if (percentage <= 0.33) {
                            setIntensityValue(1);
                            setIntensity('light');
                          } else if (percentage <= 0.66) {
                            setIntensityValue(2);
                            setIntensity('moderate');
                          } else {
                            setIntensityValue(3);
                            setIntensity('intense');
                          }
                        };
                        
                        // Handle initial touch
                        handleSliderMove(e.touches[0].clientX);
                        setIsDragging(true);
                        
                        // Add touch event listeners
                        const handleTouchMove = (moveEvent: TouchEvent) => {
                          if (isDragging) {
                            handleSliderMove(moveEvent.touches[0].clientX);
                          }
                        };
                        
                        const handleTouchEnd = () => {
                          setIsDragging(false);
                          document.removeEventListener('touchmove', handleTouchMove);
                          document.removeEventListener('touchend', handleTouchEnd);
                        };
                        
                        document.addEventListener('touchmove', handleTouchMove);
                        document.addEventListener('touchend', handleTouchEnd);
                      }}
                    >
                      {/* Colored track with a fill effect based on current value */}
                      <div className="absolute inset-0 rounded-full overflow-hidden cursor-pointer">
                        {/* Visual indicator lines */}
                        <div className="absolute inset-y-0 left-1/3 w-0.5 bg-white opacity-50"></div>
                        <div className="absolute inset-y-0 left-2/3 w-0.5 bg-white opacity-50"></div>
                        
                        {/* Fill effect that grows as the slider moves */}
                        <div 
                          className="absolute inset-y-0 left-0 bg-blue-500 rounded-full"
                          style={{ width: `${intensityValue === 1 ? 33.33 : intensityValue === 2 ? 66.66 : 100}%` }}
                        ></div>
                      </div>
                      
                      {/* Draggable slider thumb */}
                      <div 
                        className={`absolute top-1/2 transform -translate-y-1/2 -ml-4 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} z-10`}
                        style={{ 
                          left: `${intensityValue === 1 ? 33.33 : intensityValue === 2 ? 66.66 : 100}%`,
                          transition: isDragging ? 'none' : 'left 0.2s ease'
                        }}
                      >
                        <div className="w-8 h-8 rounded-full bg-white shadow-lg border-2 border-blue-400 flex items-center justify-center">
                          {intensityValue === 1 && <Zap className="h-4 w-4 text-blue-500 opacity-80" />}
                          {intensityValue === 2 && <div className="flex"><Zap className="h-4 w-4 text-blue-500" /><Zap className="h-4 w-4 text-blue-500" /></div>}
                          {intensityValue === 3 && <div className="flex"><Zap className="h-4 w-4 text-blue-500" /><Zap className="h-4 w-4 text-blue-500" /><Zap className="h-4 w-4 text-blue-500" /></div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Intensity labels */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className={`text-center p-4 rounded-lg border-2 transition-colors ${intensityValue === 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <div className="flex justify-center items-center mb-2">
                      <Zap className="h-5 w-5 text-blue-500 opacity-70" />
                    </div>
                    <p className="font-medium text-blue-800">Light</p>
                    <p className="text-sm text-gray-600 mt-1">Gentle, minimal effort recovery</p>
                  </div>
                  
                  <div className={`text-center p-4 rounded-lg border-2 transition-colors ${intensityValue === 2 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <div className="flex justify-center items-center mb-2">
                      <Zap className="h-5 w-5 mr-1 text-blue-500" />
                      <Zap className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="font-medium text-blue-800">Moderate</p>
                    <p className="text-sm text-gray-600 mt-1">Balanced intensity for recovery</p>
                  </div>
                  
                  <div className={`text-center p-4 rounded-lg border-2 transition-colors ${intensityValue === 3 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <div className="flex justify-center items-center mb-2">
                      <Zap className="h-5 w-5 mr-1 text-blue-500" />
                      <Zap className="h-5 w-5 mr-1 text-blue-500" />
                      <Zap className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="font-medium text-blue-800">Intense</p>
                    <p className="text-sm text-gray-600 mt-1">Challenging recovery session</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center mb-6">
                <div className="text-center bg-white rounded-xl px-6 py-4 shadow-lg border border-blue-100 max-w-md">
                  <h4 className="font-medium text-blue-700 mb-2">Selected Intensity:</h4>
                  <div className="flex items-center justify-center mb-2">
                    {intensity === 'light' && <Zap className="h-6 w-6 text-blue-500 opacity-70" />}
                    {intensity === 'moderate' && (
                      <>
                        <Zap className="h-6 w-6 mr-1 text-blue-500" />
                        <Zap className="h-6 w-6 text-blue-500" />
                      </>
                    )}
                    {intensity === 'intense' && (
                      <>
                        <Zap className="h-6 w-6 mr-1 text-blue-500" />
                        <Zap className="h-6 w-6 mr-1 text-blue-500" />
                        <Zap className="h-6 w-6 text-blue-500" />
                      </>
                    )}
                  </div>
                  <p className="font-bold text-2xl text-blue-600 mb-1">
                    {INTENSITY_OPTIONS.find(opt => opt.id === intensity)?.label}
                  </p>
                  <p className="text-sm text-gray-600">
                    {INTENSITY_OPTIONS.find(opt => opt.id === intensity)?.description}
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex">
                  <div className="bg-blue-100 p-2 rounded-full shrink-0 mr-3 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5"></path></svg>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-800 mb-1">Intensity Guide</h5>
                    <p className="text-sm text-blue-700">
                      Choose based on your current recovery needs. Light intensity is best for active recovery days, while moderate and intense are better when you're feeling ready for more challenging movements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Create Flow Button */}
          <div className="mt-8 flex justify-center sticky bottom-0 bg-white py-4 border-t border-gray-100 shadow-lg z-20">
            <Button 
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex items-center justify-center py-6 text-lg font-medium text-white shadow-md"
            >
              Create Recovery Flow
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-b-xl border-t border-gray-200">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-5">
            <h4 className="font-medium text-sm text-gray-500 mb-3">Your recovery session summary:</h4>
            
            <div className="flex flex-wrap gap-2 mb-1">
              <div className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full flex items-center font-medium">
                <Clock className="h-3 w-3 mr-1.5" /> {getTimeLabel(time)}
              </div>
              <div className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full flex items-center font-medium">
                <Activity className="h-3 w-3 mr-1.5" /> {INTENSITY_OPTIONS.find(i => i.id === intensity)?.label || 'Moderate'} intensity
              </div>
              <div className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full flex items-center font-medium">
                <Target className="h-3 w-3 mr-1.5" /> {selectedFocuses.length > 1 ? `${selectedFocuses.length} target areas` : FOCUS_OPTIONS.find(f => f.id === selectedFocuses[0])?.label || 'Full Body'}
              </div>
              <div className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full flex items-center font-medium">
                <Dumbbell className="h-3 w-3 mr-1.5" /> {selectedEquipment[0] !== 'none' ? `${selectedEquipment.length} equipment items` : 'No equipment'}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center gap-3">
            <Button variant="outline" onClick={onClose} className="border-gray-300 text-gray-600 font-normal px-4">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1 py-6 text-base font-medium shadow-lg shadow-blue-200"
            >
              Start Recovery Flow
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecoveryFlowModal;