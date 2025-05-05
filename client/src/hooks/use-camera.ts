import { useState, useRef, useCallback, useEffect } from 'react';

interface UseCameraReturn {
  isCameraReady: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureImage: () => string | null;
  isSupported: boolean;
  error: string | null;
}

/**
 * Custom hook for camera functionality
 * Provides methods to start/stop the camera and capture images
 */
export default function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  // Check if the camera is supported
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
      setError('Camera not supported in this browser');
    }
  }, []);

  /**
   * Start the camera stream
   */
  const startCamera = useCallback(async () => {
    setError(null);
    
    if (!isSupported) {
      setError('Camera not supported in this browser');
      return;
    }
    
    try {
      if (streamRef.current) {
        stopCamera();
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => setIsCameraReady(true))
              .catch(err => {
                console.error('Error playing video:', err);
                setError('Could not start video playback');
              });
          }
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check camera permissions.');
    }
  }, [isSupported]);

  /**
   * Stop the camera stream
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraReady(false);
  }, []);

  /**
   * Capture an image from the current video frame
   * @returns Base64 encoded image data or null if capture failed
   */
  const captureImage = useCallback((): string | null => {
    if (!videoRef.current || !isCameraReady) {
      setError('Camera not ready for capture');
      return null;
    }
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Could not create canvas context');
        return null;
      }
      
      // Draw the current video frame to the canvas
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convert the canvas to a base64 encoded image
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      return imageData;
    } catch (err) {
      console.error('Error capturing image:', err);
      setError('Failed to capture image');
      return null;
    }
  }, [isCameraReady]);

  return {
    isCameraReady,
    videoRef,
    startCamera,
    stopCamera,
    captureImage,
    isSupported,
    error
  };
}
