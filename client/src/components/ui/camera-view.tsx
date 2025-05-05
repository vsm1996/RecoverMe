import React, { useRef, useState, useEffect } from 'react';
import useCamera from '@/hooks/use-camera';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { analyzeMovement } from '@/lib/openai';
import { initTensorFlow, loadPoseNetModel, detectPose, drawPose, analyzePoseQuality } from '@/lib/tensorflow';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Camera, CheckCircle2, AlertCircle } from 'lucide-react';

interface CameraViewProps {
  userId: number;
  onAnalysisComplete?: (result: any) => void;
}

export function CameraView({ userId, onAnalysisComplete }: CameraViewProps) {
  const { videoRef, startCamera, stopCamera, captureImage, isCameraReady, isSupported, error } = useCamera();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [tfInitialized, setTfInitialized] = useState<boolean>(false);
  const [model, setModel] = useState<any>(null);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);

  // Initialize TensorFlow when component mounts
  useEffect(() => {
    async function initialize() {
      try {
        const initialized = await initTensorFlow();
        setTfInitialized(initialized);
        if (initialized) {
          const loadedModel = await loadPoseNetModel();
          setModel(loadedModel);
        }
      } catch (error) {
        console.error('Error initializing TensorFlow:', error);
        toast({
          title: 'Error',
          description: 'Could not initialize pose detection. Please try again later.',
          variant: 'destructive',
        });
      }
    }
    
    initialize();
    
    return () => {
      stopCamera();
    };
  }, []);

  const handleOpenCamera = async () => {
    setShowDialog(true);
    // Start camera with a slight delay to ensure dialog is visible
    setTimeout(async () => {
      try {
        await startCamera();
      } catch (err) {
        toast({
          title: 'Camera Error',
          description: 'Could not access your camera. Please check permissions.',
          variant: 'destructive',
        });
      }
    }, 300);
  };

  const handleCloseCamera = () => {
    stopCamera();
    setShowDialog(false);
    setCapturedImage(null);
    setAnalysisResult(null);
    setIsCapturing(false);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
  };

  const handleCapture = async () => {
    setIsCapturing(true);
    
    try {
      // Capture image from video stream
      const imageData = captureImage();
      
      if (!imageData) {
        throw new Error('Failed to capture image');
      }
      
      setCapturedImage(imageData);
      
      // Perform local pose analysis with TensorFlow
      if (tfInitialized && model && videoRef.current) {
        setAnalysisProgress(25);
        const pose = await detectPose(model, videoRef.current);
        setAnalysisProgress(50);
        
        // Draw pose on canvas
        if (canvasRef.current && pose) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            drawPose(pose, ctx, videoRef.current.videoWidth, videoRef.current.videoHeight);
          }
        }
        
        // Analyze pose quality
        const quality = analyzePoseQuality(pose);
        setAnalysisProgress(75);
        
        // Send to backend for AI analysis
        setIsAnalyzing(true);
        const result = await analyzeMovement(userId, imageData.split(',')[1]);
        setAnalysisResult(result);
        
        if (onAnalysisComplete) {
          onAnalysisComplete(result);
        }
        
        setAnalysisProgress(100);
      }
    } catch (error) {
      console.error('Error during capture/analysis:', error);
      toast({
        title: 'Analysis Error',
        description: 'There was a problem analyzing your movement. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCapturing(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <Button onClick={handleOpenCamera} className="w-full" disabled={!isSupported}>
        <Camera className="mr-2 h-4 w-4" />
        {isSupported ? 'Start Movement Assessment' : 'Camera Not Available'}
      </Button>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Movement Assessment</DialogTitle>
            <DialogDescription>
              Position yourself so your entire body is visible and perform the movement naturally.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4">
            <div className="relative w-full h-[400px] bg-black rounded-md overflow-hidden">
              {/* Video preview */}
              {!capturedImage && (
                <video 
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-contain"
                  autoPlay
                  playsInline
                  muted
                />
              )}
              
              {/* Captured image */}
              {capturedImage && (
                <img 
                  src={capturedImage}
                  className="absolute inset-0 w-full h-full object-contain"
                  alt="Captured movement"
                />
              )}
              
              {/* Canvas overlay for pose visualization */}
              <canvas 
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />
              
              {/* Loading overlay */}
              {(isCapturing || isAnalyzing) && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <div className="text-sm">
                    {isCapturing ? 'Capturing your movement...' : 'Analyzing your movement...'}
                  </div>
                  {analysisProgress > 0 && (
                    <div className="w-48 mt-4">
                      <Progress value={analysisProgress} className="h-2" />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Analysis results */}
            {analysisResult && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Movement Analysis Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Overall Score:</span>
                      <span className="font-bold text-lg">{analysisResult.analysis.overall_score}/100</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Joint Scores</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-xs">Shoulders</span>
                          <Progress value={analysisResult.analysis.joint_scores.shoulders} className="h-2 mt-1" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs">Hips</span>
                          <Progress value={analysisResult.analysis.joint_scores.hips} className="h-2 mt-1" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs">Knees</span>
                          <Progress value={analysisResult.analysis.joint_scores.knees} className="h-2 mt-1" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs">Ankles</span>
                          <Progress value={analysisResult.analysis.joint_scores.ankles} className="h-2 mt-1" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Feedback</div>
                      <div className="space-y-2">
                        {analysisResult.analysis.positive_feedback.map((feedback: string, index: number) => (
                          <div key={`positive-${index}`} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{feedback}</span>
                          </div>
                        ))}
                        
                        {analysisResult.analysis.improvement_areas.map((feedback: string, index: number) => (
                          <div key={`improve-${index}`} className="flex items-start gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span>{feedback}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="text-sm text-muted-foreground">
                    Based on this analysis, we'll customize your recovery plan to address your specific needs.
                  </div>
                </CardFooter>
              </Card>
            )}
            
            <div className="flex justify-end gap-2 mt-4">
              {!capturedImage ? (
                <>
                  <Button variant="outline" onClick={handleCloseCamera}>Cancel</Button>
                  <Button onClick={handleCapture} disabled={!isCameraReady || isCapturing}>
                    {isCapturing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Capturing...
                      </>
                    ) : (
                      'Capture and Analyze'
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setCapturedImage(null)}>Retake</Button>
                  <Button onClick={handleCloseCamera}>Done</Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}