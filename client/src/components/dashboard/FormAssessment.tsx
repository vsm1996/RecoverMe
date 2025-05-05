import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Play, AlertCircle, Check } from 'lucide-react';
import { MovementAssessment } from '@shared/schema';
import CameraModal from '@/components/modals/CameraModal';
import { format } from 'date-fns';

interface FormAssessmentProps {
  assessment: MovementAssessment | null;
  isLoading: boolean;
}

const FormAssessment: React.FC<FormAssessmentProps> = ({ assessment, isLoading }) => {
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const openCameraModal = () => setIsCameraModalOpen(true);
  const closeCameraModal = () => setIsCameraModalOpen(false);

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-sm p-6 mb-8">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-6">
            <div className="h-7 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded-xl w-40"></div>
          </div>
          <div className="h-16 bg-gray-200 rounded-xl mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl shadow-sm p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-nunito font-semibold text-xl">Movement Assessment</h3>
        <Button 
          className="rounded-xl bg-[#64B5F6]"
          onClick={openCameraModal}
        >
          <Camera className="mr-2 h-4 w-4" /> New Assessment
        </Button>
      </div>
      
      <div className="bg-[#F5F5F5] p-4 rounded-xl mb-4">
        <p className="text-sm">Our computer vision technology can analyze your movement patterns to identify potential areas of improvement in your recovery routine.</p>
      </div>
      
      {!assessment ? (
        <div className="text-center py-6">
          <p className="text-gray-500">No assessment data available. Start your first assessment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-nunito font-semibold mb-3">Last Assessment</h4>
            <div className="relative rounded-xl overflow-hidden bg-gray-200 h-48">
              <img 
                src={assessment.imageUrl} 
                alt="Movement assessment preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button className="bg-white bg-opacity-90 text-[#64B5F6]">
                  <Play className="mr-2 h-4 w-4" /> View Analysis
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Assessed {format(new Date(assessment.date), 'MMM d, yyyy')}
            </p>
          </div>
          
          <div>
            <h4 className="font-nunito font-semibold mb-3">AI Feedback</h4>
            <div className="space-y-3">
              {assessment.feedback.map((item, index) => (
                <div key={index} className="flex items-start">
                  <div 
                    className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.type === 'positive' 
                        ? 'bg-[#81C784] bg-opacity-20'
                        : 'bg-[#FFB74D] bg-opacity-20'
                    }`}
                  >
                    {item.type === 'positive' ? (
                      <Check className={`h-3 w-3 ${item.type === 'positive' ? 'text-[#81C784]' : 'text-[#FFB74D]'}`} />
                    ) : (
                      <AlertCircle className={`h-3 w-3 ${item.type === 'positive' ? 'text-[#81C784]' : 'text-[#FFB74D]'}`} />
                    )}
                  </div>
                  <p className="ml-3 text-sm">{item.message}</p>
                </div>
              ))}
            </div>
            
            <Button 
              className="w-full mt-4 bg-[#81C784]"
            >
              View Detailed Analysis
            </Button>
          </div>
        </div>
      )}

      <CameraModal isOpen={isCameraModalOpen} onClose={closeCameraModal} />
    </Card>
  );
};

export default FormAssessment;
