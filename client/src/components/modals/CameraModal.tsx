import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';
import useCamera from '@/hooks/use-camera';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { initTensorFlow, loadPoseNetModel, detectPose, analyzePoseQuality } from '@/lib/tensorflow';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose }) => {
  const { isCameraReady, videoRef, startCamera, stopCamera, captureImage } = useCamera();
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setIsRecording(false);
      setCountdown(null);
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    }
  }, [isOpen, startCamera, stopCamera]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setCountdown(3);
    
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          captureAndAnalyze();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const captureAndAnalyze = async () => {
    try {
      const imageData = captureImage();
      if (!imageData) {
        throw new Error('Failed to capture image');
      }

      // Create an image element from the captured data
      const img = new Image();
      img.src = imageData;
      
      // Wait for the image to load
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      // Initialize TensorFlow and load PoseNet model
      await initTensorFlow();
      const model = await loadPoseNetModel();
      
      // Detect pose from the image
      const pose = await detectPose(model, img);
      
      // Analyze the pose quality (neutral stance assessment)
      const poseQualityResults = analyzePoseQuality(pose, 'neutral');
      
      // Create feedback items based on pose analysis results
      const feedbackItems = poseQualityResults.feedback.map(message => {
        return { type: 'improvement', message };
      });
      
      // Add a positive feedback if overall score is good
      if (poseQualityResults.score >= 70) {
        feedbackItems.unshift({ type: 'positive', message: 'Good overall posture detected' });
      }
      
      // Create analysis result from pose data
      const analysisResult = {
        overallScore: Math.round(poseQualityResults.score),
        shoulderMobility: Math.round(poseQualityResults.jointScores.shoulders),
        hipMobility: Math.round(poseQualityResults.jointScores.hips),
        ankleMobility: Math.round(poseQualityResults.jointScores.ankles),
        recommendations: poseQualityResults.feedback
      };
      
      // Send the assessment to the server
      await apiRequest('POST', '/api/assessments', {
        userId: 1, // This would be the actual user ID
        imageUrl: imageData, // In a real app, you'd upload this to storage and store the URL
        feedback: feedbackItems,
        analysisResult
      });
      
      // Invalidate the assessments query to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/assessments/latest'] });
      
      toast({
        title: "Assessment complete",
        description: "Your movement has been analyzed successfully.",
      });
      
      onClose();
    } catch (error) {
      console.error('Assessment error:', error);
      toast({
        title: "Assessment failed",
        description: "There was an error analyzing your movement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRecording(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative max-w-lg mx-auto mt-10 bg-white rounded-xl overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-nunito font-semibold text-xl">Movement Assessment</h3>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="bg-gray-200 h-72 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
            {isCameraReady ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-center">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Camera initializing...</p>
              </div>
            )}
            
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="text-white text-6xl font-bold">{countdown}</div>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <h4 className="font-nunito font-semibold mb-2">Instructions:</h4>
            <ol className="text-sm space-y-2 pl-5 list-decimal">
              <li>Stand 6-8 feet from the camera</li>
              <li>Ensure your full body is visible</li>
              <li>Perform the movement slowly as instructed</li>
              <li>Hold end positions for 2 seconds</li>
            </ol>
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline"
              className="bg-gray-200 text-[#424242]"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              className="bg-[#64B5F6]"
              onClick={handleStartRecording}
              disabled={!isCameraReady || isRecording}
            >
              {isRecording ? 'Processing...' : 'Start Assessment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
