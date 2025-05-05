import * as posenet from '@tensorflow-models/posenet';
import * as tf from '@tensorflow/tfjs';

// Initialize TensorFlow.js - must be called before using any TF functions
export async function initTensorFlow() {
  try {
    await tf.ready();
    console.log('TensorFlow.js initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing TensorFlow.js:', error);
    return false;
  }
}

// Load the PoseNet model
export async function loadPoseNetModel() {
  try {
    const model = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: { width: 640, height: 480 },
      multiplier: 0.75
    });
    
    console.log('PoseNet model loaded successfully');
    return model;
  } catch (error) {
    console.error('Error loading PoseNet model:', error);
    throw error;
  }
}

// Detect poses in an image
export async function detectPose(model: posenet.PoseNet, imageElement: HTMLImageElement | HTMLVideoElement) {
  try {
    const pose = await model.estimateSinglePose(imageElement, {
      flipHorizontal: false
    });
    
    return pose;
  } catch (error) {
    console.error('Error detecting pose:', error);
    throw error;
  }
}

// Calculate angles between body parts
export function calculateJointAngles(pose: posenet.Pose) {
  const keypoints = pose.keypoints;
  const angles: Record<string, number> = {};
  
  // Get specific keypoints
  const findKeypoint = (name: string) => keypoints.find(kp => kp.part === name);
  
  const leftShoulder = findKeypoint('leftShoulder');
  const leftElbow = findKeypoint('leftElbow');
  const leftWrist = findKeypoint('leftWrist');
  
  const rightShoulder = findKeypoint('rightShoulder');
  const rightElbow = findKeypoint('rightElbow');
  const rightWrist = findKeypoint('rightWrist');
  
  const leftHip = findKeypoint('leftHip');
  const leftKnee = findKeypoint('leftKnee');
  const leftAnkle = findKeypoint('leftAnkle');
  
  const rightHip = findKeypoint('rightHip');
  const rightKnee = findKeypoint('rightKnee');
  const rightAnkle = findKeypoint('rightAnkle');
  
  // Calculate elbow angles
  if (leftShoulder && leftElbow && leftWrist) {
    angles.leftElbow = calculateAngle(
      [leftShoulder.position.x, leftShoulder.position.y],
      [leftElbow.position.x, leftElbow.position.y],
      [leftWrist.position.x, leftWrist.position.y]
    );
  }
  
  if (rightShoulder && rightElbow && rightWrist) {
    angles.rightElbow = calculateAngle(
      [rightShoulder.position.x, rightShoulder.position.y],
      [rightElbow.position.x, rightElbow.position.y],
      [rightWrist.position.x, rightWrist.position.y]
    );
  }
  
  // Calculate knee angles
  if (leftHip && leftKnee && leftAnkle) {
    angles.leftKnee = calculateAngle(
      [leftHip.position.x, leftHip.position.y],
      [leftKnee.position.x, leftKnee.position.y],
      [leftAnkle.position.x, leftAnkle.position.y]
    );
  }
  
  if (rightHip && rightKnee && rightAnkle) {
    angles.rightKnee = calculateAngle(
      [rightHip.position.x, rightHip.position.y],
      [rightKnee.position.x, rightKnee.position.y],
      [rightAnkle.position.x, rightAnkle.position.y]
    );
  }
  
  // Calculate shoulder/hip angles for posture analysis
  const neck = findKeypoint('nose');
  
  if (neck && leftShoulder && leftHip) {
    angles.leftPosture = calculateAngle(
      [neck.position.x, neck.position.y],
      [leftShoulder.position.x, leftShoulder.position.y],
      [leftHip.position.x, leftHip.position.y]
    );
  }
  
  if (neck && rightShoulder && rightHip) {
    angles.rightPosture = calculateAngle(
      [neck.position.x, neck.position.y],
      [rightShoulder.position.x, rightShoulder.position.y],
      [rightHip.position.x, rightHip.position.y]
    );
  }
  
  return angles;
}

// Helper function to calculate the angle between three points
function calculateAngle(p1: [number, number], p2: [number, number], p3: [number, number]): number {
  const v1 = [p1[0] - p2[0], p1[1] - p2[1]];
  const v2 = [p3[0] - p2[0], p3[1] - p2[1]];
  
  // Calculate dot product
  const dotProduct = v1[0] * v2[0] + v1[1] * v2[1];
  
  // Calculate magnitudes
  const v1Magnitude = Math.sqrt(v1[0]**2 + v1[1]**2);
  const v2Magnitude = Math.sqrt(v2[0]**2 + v2[1]**2);
  
  // Calculate angle in radians
  const angleRadians = Math.acos(dotProduct / (v1Magnitude * v2Magnitude));
  
  // Convert to degrees
  const angleDegrees = angleRadians * (180 / Math.PI);
  
  return angleDegrees;
}

// Draw pose on canvas
export function drawPose(pose: posenet.Pose, ctx: CanvasRenderingContext2D, videoWidth: number, videoHeight: number) {
  if (!pose || !ctx) return;
  
  ctx.clearRect(0, 0, videoWidth, videoHeight);
  drawKeypoints(pose.keypoints, 0.5, ctx);
  drawSkeleton(pose.keypoints, 0.5, ctx);
}

// Draw keypoints on canvas
function drawKeypoints(keypoints: posenet.Keypoint[], minConfidence: number, ctx: CanvasRenderingContext2D) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];
    
    if (keypoint.score < minConfidence) continue;
    
    const { x, y } = keypoint.position;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'aqua';
    ctx.fill();
  }
}

// Draw the skeleton connecting keypoints
function drawSkeleton(keypoints: posenet.Keypoint[], minConfidence: number, ctx: CanvasRenderingContext2D) {
  const adjacentKeypoints = posenet.getAdjacentKeyPoints(keypoints, minConfidence);
  
  adjacentKeypoints.forEach(keypoints => {
    ctx.beginPath();
    ctx.moveTo(keypoints[0].position.x, keypoints[0].position.y);
    ctx.lineTo(keypoints[1].position.x, keypoints[1].position.y);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'lime';
    ctx.stroke();
  });
}

// Analyze symmetry between left and right sides
export function analyzeSymmetry(angles: Record<string, number>) {
  const symmetryScores: Record<string, number> = {};
  
  // The closer to 100, the more symmetrical
  if (angles.leftElbow && angles.rightElbow) {
    const elbowDiff = Math.abs(angles.leftElbow - angles.rightElbow);
    symmetryScores.elbows = Math.max(0, 100 - (elbowDiff * 5));
  }
  
  if (angles.leftKnee && angles.rightKnee) {
    const kneeDiff = Math.abs(angles.leftKnee - angles.rightKnee);
    symmetryScores.knees = Math.max(0, 100 - (kneeDiff * 5));
  }
  
  if (angles.leftPosture && angles.rightPosture) {
    const postureDiff = Math.abs(angles.leftPosture - angles.rightPosture);
    symmetryScores.posture = Math.max(0, 100 - (postureDiff * 5));
  }
  
  // Overall symmetry score
  const scores = Object.values(symmetryScores);
  const overallSymmetry = scores.length > 0 
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length
    : 0;
    
  return {
    scores: symmetryScores,
    overall: overallSymmetry
  };
}

// Analyze a pose for movement quality
export function analyzePoseQuality(pose: posenet.Pose, expectedPose: string = 'neutral') {
  const angles = calculateJointAngles(pose);
  const symmetry = analyzeSymmetry(angles);
  
  let movementQuality = {
    score: 0,
    feedback: [] as string[],
    symmetry: symmetry.overall,
    jointScores: {
      shoulders: 0,
      hips: 0,
      knees: 0,
      ankles: 0
    }
  };
  
  // Basic analysis based on pose confidence
  const avgConfidence = pose.keypoints.reduce((sum, kp) => sum + kp.score, 0) / pose.keypoints.length;
  movementQuality.score = avgConfidence * 100;
  
  // Joint-specific analysis
  const shoulders = pose.keypoints.filter(kp => kp.part === 'leftShoulder' || kp.part === 'rightShoulder');
  const hips = pose.keypoints.filter(kp => kp.part === 'leftHip' || kp.part === 'rightHip');
  const knees = pose.keypoints.filter(kp => kp.part === 'leftKnee' || kp.part === 'rightKnee');
  const ankles = pose.keypoints.filter(kp => kp.part === 'leftAnkle' || kp.part === 'rightAnkle');
  
  movementQuality.jointScores.shoulders = shoulders.reduce((sum, kp) => sum + kp.score, 0) / shoulders.length * 100;
  movementQuality.jointScores.hips = hips.reduce((sum, kp) => sum + kp.score, 0) / hips.length * 100;
  movementQuality.jointScores.knees = knees.reduce((sum, kp) => sum + kp.score, 0) / knees.length * 100;
  movementQuality.jointScores.ankles = ankles.reduce((sum, kp) => sum + kp.score, 0) / ankles.length * 100;
  
  // Generate feedback based on scores
  if (symmetry.overall < 70) {
    movementQuality.feedback.push("Asymmetry detected between left and right sides.");
  }
  
  if (movementQuality.jointScores.shoulders < 60) {
    movementQuality.feedback.push("Shoulder position could be improved.");
  }
  
  if (movementQuality.jointScores.hips < 60) {
    movementQuality.feedback.push("Hip alignment needs attention.");
  }
  
  if (movementQuality.jointScores.knees < 60) {
    movementQuality.feedback.push("Knee positioning could be improved.");
  }
  
  if (movementQuality.jointScores.ankles < 60) {
    movementQuality.feedback.push("Ankle stability needs attention.");
  }
  
  return movementQuality;
}