import { pgTable, text, serial, integer, boolean, date, json, timestamp, doublePrecision, primaryKey, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  sportType: text("sport_type").notNull(),
  height: integer("height"),
  weight: integer("weight"),
  dateOfBirth: date("date_of_birth"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  equipmentAccess: text("equipment_access").default("minimal"), // "gym", "home", "minimal"
  experienceLevel: text("experience_level").default("beginner"), // "beginner", "intermediate", "advanced"
  recoveryGoals: text("recovery_goals").array(), // array of goal strings
  injuryHistory: json("injury_history").$type<Array<{bodyPart: string, description: string, date: string}>>(),
  completedAssessment: boolean("completed_assessment").default(false),
});

// Recovery metrics
export const recoveryMetrics = pgTable("recovery_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  recoveryScore: integer("recovery_score").notNull(),
  readinessScore: integer("readiness_score").notNull(),
  balanceScore: integer("balance_score").notNull(),
  heartRate: integer("heart_rate"),
  sleepQuality: integer("sleep_quality"),
  activityLevel: text("activity_level"),
  soreness: json("soreness").$type<Record<string, number>>(),
  hydrationLevel: integer("hydration_level"),
  stressLevel: integer("stress_level"),
  notes: text("notes"),
});

// Recovery plans
export const recoveryPlans = pgTable("recovery_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  aiRecommendation: text("ai_recommendation"),
  isCompleted: boolean("is_completed").default(false),
});

// Recovery tasks
export const recoveryTasks = pgTable("recovery_tasks", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull().references(() => recoveryPlans.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // strength, mobility, nutrition, etc.
  duration: integer("duration"), // in minutes
  isCompleted: boolean("is_completed").default(false),
  progress: integer("progress").default(0), // 0-100 percentage
  time: text("time"), // time of day if applicable
});

// Movement assessments
export const movementAssessments = pgTable("movement_assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").defaultNow(),
  videoUrl: text("video_url"),
  imageUrl: text("image_url"),
  feedback: json("feedback").$type<Array<{type: string, message: string}>>(),
  analysisResult: json("analysis_result"),
});

// Chart data for tracking recovery over time
export const chartData = pgTable("chart_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  recoveryScores: json("recovery_scores").$type<number[]>(),
  sleepScores: json("sleep_scores").$type<number[]>(),
  activityScores: json("activity_scores").$type<number[]>(),
});

// Movement limitations
export const movementLimitations = pgTable("movement_limitations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bodyPart: text("body_part").notNull(),
  limitationType: text("limitation_type").notNull(), // "range", "strength", "pain", "stiffness"
  severity: integer("severity").notNull(), // 1-10 scale
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Exercise library
export const exerciseLibrary = pgTable("exercise_library", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "strength", "mobility", "recovery", etc.
  equipmentRequired: text("equipment_required").array(), // equipment pieces needed
  targetMuscles: text("target_muscles").array(),
  difficultyLevel: text("difficulty_level").notNull(), // "beginner", "intermediate", "advanced" 
  videoUrl: text("video_url"),
  imageUrl: text("image_url"),
  instructions: text("instructions").array(), // step-by-step instructions
  alternatives: integer("alternatives").array(), // ids of alternative exercises
});

// Recovery protocol templates
export const recoveryProtocols = pgTable("recovery_protocols", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  targetAreas: text("target_areas").array(),
  recommendedFrequency: text("recommended_frequency").notNull(),
  exerciseIds: integer("exercise_ids").array(), // ids from exercise_library
  duration: integer("duration").notNull(), // in minutes
  equipmentRequired: text("equipment_required").array(),
  difficultyLevel: text("difficulty_level").notNull(), // "beginner", "intermediate", "advanced"
  sportSpecific: text("sport_specific").array(), // sport types this applies to
  isTemplate: boolean("is_template").default(true),
});

// Session feedback for machine learning model improvement
export const sessionFeedback = pgTable("session_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionId: text("session_id").notNull(),
  rating: integer("rating").notNull(),
  effectiveness: integer("effectiveness").notNull(),
  difficulty: integer("difficulty").notNull(),
  enjoyment: integer("enjoyment").notNull(),
  feedback: text("feedback"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Exercise-specific feedback for machine learning model improvement
export const exerciseFeedback = pgTable("exercise_feedback", {
  id: serial("id").primaryKey(),
  sessionFeedbackId: integer("session_feedback_id").notNull().references(() => sessionFeedback.id),
  exerciseId: text("exercise_id").notNull(),
  exerciseName: text("exercise_name").notNull(),
  rating: integer("rating").notNull(),
  difficulty: integer("difficulty").notNull(), 
  effectiveness: integer("effectiveness").notNull(),
  feedback: text("feedback"),
});

// Expert table - for physios, trainers and biomechanics experts
export const experts = pgTable("experts", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  specialty: text("specialty").notNull(), // "physio", "trainer", "biomechanics", "nutrition", etc.
  credentials: text("credentials").notNull(),
  bio: text("bio"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  isVerified: boolean("is_verified").default(false),
});

// Biomechanical assessments
export const biomechanicalAssessments = pgTable("biomechanical_assessments", {
  id: serial("id").primaryKey(),
  expertId: integer("expert_id").notNull().references(() => experts.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  targetBodyParts: text("target_body_parts").array(),
  assessmentCriteria: json("assessment_criteria").$type<Array<{
    name: string,
    description: string,
    optimalRange: { min: number, max: number },
    scoringMethod: string,
  }>>(),
  references: text("references").array(), // Scientific references supporting this assessment
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Expert-created recovery templates
export const expertTemplates = pgTable("expert_templates", {
  id: serial("id").primaryKey(),
  expertId: integer("expert_id").notNull().references(() => experts.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  targetAreas: text("target_areas").array(),
  sportSpecific: text("sport_specific").array(),
  totalDuration: integer("total_duration").notNull(), // in minutes
  equipmentRequired: text("equipment_required").array(),
  difficultyLevel: text("difficulty_level").notNull(),
  focusType: text("focus_type").notNull(), // "recovery", "mobility", "strength", "combination"
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  supportingEvidence: text("supporting_evidence"), // Research backing this template
  contraindications: text("contraindications").array(), // Conditions when this shouldn't be used
});

// Expert template exercises - connecting template to exercises with order & settings
export const templateExercises = pgTable("template_exercises", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull().references(() => expertTemplates.id),
  exerciseId: integer("exercise_id").notNull().references(() => exerciseLibrary.id),
  order: integer("order").notNull(),
  duration: integer("duration").notNull(), // in seconds
  repetitions: integer("repetitions"),
  sets: integer("sets"),
  restPeriod: integer("rest_period"), // in seconds
  intensityLevel: text("intensity_level").notNull(), // "light", "moderate", "intense"
  modifications: text("modifications"), // Expert-provided modifications for different abilities
  progessionPath: json("progression_path").$type<Array<{
    condition: string, // e.g., "After 2 weeks" or "When rating > 4" 
    adjustment: string, // e.g., "Increase repetitions to 12" or "Add resistance band"
  }>>(),
});

// Biomechanical exercise analysis - expert assessment of exercises
export const biomechanicalExerciseAnalysis = pgTable("biomechanical_exercise_analysis", {
  id: serial("id").primaryKey(),
  exerciseId: integer("exercise_id").notNull().references(() => exerciseLibrary.id),
  expertId: integer("expert_id").notNull().references(() => experts.id),
  muscleActivationPatterns: json("muscle_activation_patterns").$type<Record<string, number>>(), // Muscle name to 1-10 activation score
  jointLoad: json("joint_load").$type<Record<string, { compression: number, shear: number }>>(), // Joint name to load metrics
  movementQuality: json("movement_quality").$type<Array<{
    phase: string, // E.g., "eccentric", "concentric", "isometric"
    criteriaScores: Record<string, number>, // Assessment criteria to 1-10 scores
  }>>(),
  safetyConsiderations: text("safety_considerations").array(),
  contraindications: text("contraindications").array(),
  modifications: json("modifications").$type<Array<{
    condition: string, // E.g., "knee pain", "limited mobility"
    adjustment: string, // E.g., "reduce range of motion", "add support"
  }>>(),
  effectivenessScore: integer("effectiveness_score").notNull(), // 1-10 rating
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Recovery flow rules - expert-defined rules for recovery progression
export const recoveryFlowRules = pgTable("recovery_flow_rules", {
  id: serial("id").primaryKey(),
  expertId: integer("expert_id").notNull().references(() => experts.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  condition: json("condition").$type<{
    metric: string, // E.g., "soreness", "sleepQuality", "feedbackScore"
    operator: string, // E.g., ">", "<", "=="
    value: number,
    additionalCriteria: Array<{
      metric: string,
      operator: string,
      value: number,
    }>,
  }>(),
  action: json("action").$type<{
    type: string, // E.g., "substituteExercise", "adjustIntensity", "addExercise", "removeExercise"
    parameters: Record<string, any>,
  }>(),
  priority: integer("priority").notNull(), // Higher number = higher priority for rule processing
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User assessment results - storing expert assessments of users
export const userAssessments = pgTable("user_assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  expertId: integer("expert_id").notNull().references(() => experts.id),
  assessmentId: integer("assessment_id").notNull().references(() => biomechanicalAssessments.id),
  date: timestamp("date").defaultNow(),
  scores: json("scores").$type<Record<string, number>>(), // Assessment criteria to scores
  notes: text("notes"),
  recommendations: text("recommendations").array(),
  followUpDate: date("follow_up_date"),
  assessmentData: json("assessment_data"), // Raw data from assessment (angles, measurements, etc.)
});

// Schema definitions for Zod validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertRecoveryMetricSchema = createInsertSchema(recoveryMetrics).omit({ id: true });
export const insertRecoveryPlanSchema = createInsertSchema(recoveryPlans).omit({ id: true });
export const insertRecoveryTaskSchema = createInsertSchema(recoveryTasks).omit({ id: true });
export const insertMovementAssessmentSchema = createInsertSchema(movementAssessments).omit({ id: true, date: true });
export const insertChartDataSchema = createInsertSchema(chartData).omit({ id: true });
export const insertMovementLimitationSchema = createInsertSchema(movementLimitations).omit({ id: true, createdAt: true });
export const insertExerciseLibrarySchema = createInsertSchema(exerciseLibrary).omit({ id: true });
export const insertRecoveryProtocolSchema = createInsertSchema(recoveryProtocols).omit({ id: true });
export const insertSessionFeedbackSchema = createInsertSchema(sessionFeedback).omit({ id: true, createdAt: true, completedAt: true });
export const insertExerciseFeedbackSchema = createInsertSchema(exerciseFeedback).omit({ id: true });

// New schema validation for expert models
export const insertExpertSchema = createInsertSchema(experts).omit({ id: true, createdAt: true });
export const insertBiomechanicalAssessmentSchema = createInsertSchema(biomechanicalAssessments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertExpertTemplateSchema = createInsertSchema(expertTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTemplateExerciseSchema = createInsertSchema(templateExercises).omit({ id: true });
export const insertBiomechanicalExerciseAnalysisSchema = createInsertSchema(biomechanicalExerciseAnalysis).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRecoveryFlowRuleSchema = createInsertSchema(recoveryFlowRules).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserAssessmentSchema = createInsertSchema(userAssessments).omit({ id: true, date: true });

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type RecoveryMetric = typeof recoveryMetrics.$inferSelect;
export type InsertRecoveryMetric = z.infer<typeof insertRecoveryMetricSchema>;

export type RecoveryPlan = typeof recoveryPlans.$inferSelect;
export type InsertRecoveryPlan = z.infer<typeof insertRecoveryPlanSchema>;

export type RecoveryTask = typeof recoveryTasks.$inferSelect;
export type InsertRecoveryTask = z.infer<typeof insertRecoveryTaskSchema>;

export type MovementAssessment = typeof movementAssessments.$inferSelect;
export type InsertMovementAssessment = z.infer<typeof insertMovementAssessmentSchema>;

export type ChartData = typeof chartData.$inferSelect;
export type InsertChartData = z.infer<typeof insertChartDataSchema>;

export type MovementLimitation = typeof movementLimitations.$inferSelect;
export type InsertMovementLimitation = z.infer<typeof insertMovementLimitationSchema>;

export type ExerciseLibrary = typeof exerciseLibrary.$inferSelect;
export type InsertExerciseLibrary = z.infer<typeof insertExerciseLibrarySchema>;

export type RecoveryProtocol = typeof recoveryProtocols.$inferSelect;
export type InsertRecoveryProtocol = z.infer<typeof insertRecoveryProtocolSchema>;

export type SessionFeedback = typeof sessionFeedback.$inferSelect;
export type InsertSessionFeedback = z.infer<typeof insertSessionFeedbackSchema>;

export type ExerciseFeedback = typeof exerciseFeedback.$inferSelect;
export type InsertExerciseFeedback = z.infer<typeof insertExerciseFeedbackSchema>;

// Type exports for expert models
export type Expert = typeof experts.$inferSelect;
export type InsertExpert = z.infer<typeof insertExpertSchema>;

export type BiomechanicalAssessment = typeof biomechanicalAssessments.$inferSelect;
export type InsertBiomechanicalAssessment = z.infer<typeof insertBiomechanicalAssessmentSchema>;

export type ExpertTemplate = typeof expertTemplates.$inferSelect;
export type InsertExpertTemplate = z.infer<typeof insertExpertTemplateSchema>;

export type TemplateExercise = typeof templateExercises.$inferSelect;
export type InsertTemplateExercise = z.infer<typeof insertTemplateExerciseSchema>;

export type BiomechanicalExerciseAnalysis = typeof biomechanicalExerciseAnalysis.$inferSelect;
export type InsertBiomechanicalExerciseAnalysis = z.infer<typeof insertBiomechanicalExerciseAnalysisSchema>;

export type RecoveryFlowRule = typeof recoveryFlowRules.$inferSelect;
export type InsertRecoveryFlowRule = z.infer<typeof insertRecoveryFlowRuleSchema>;

export type UserAssessment = typeof userAssessments.$inferSelect;
export type InsertUserAssessment = z.infer<typeof insertUserAssessmentSchema>;
