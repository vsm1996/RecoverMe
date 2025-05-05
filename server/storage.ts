import { 
  users, User, InsertUser, 
  recoveryMetrics, RecoveryMetric, InsertRecoveryMetric,
  recoveryPlans, RecoveryPlan, InsertRecoveryPlan,
  recoveryTasks, RecoveryTask, InsertRecoveryTask,
  movementAssessments, MovementAssessment, InsertMovementAssessment,
  chartData, ChartData, InsertChartData,
  movementLimitations, MovementLimitation, InsertMovementLimitation,
  exerciseLibrary, ExerciseLibrary, InsertExerciseLibrary,
  recoveryProtocols, RecoveryProtocol, InsertRecoveryProtocol,
  sessionFeedback, SessionFeedback, InsertSessionFeedback,
  exerciseFeedback, ExerciseFeedback, InsertExerciseFeedback,
  // Expert-related imports
  experts, Expert, InsertExpert,
  biomechanicalAssessments, BiomechanicalAssessment, InsertBiomechanicalAssessment,
  expertTemplates, ExpertTemplate, InsertExpertTemplate,
  templateExercises, TemplateExercise, InsertTemplateExercise,
  biomechanicalExerciseAnalysis, BiomechanicalExerciseAnalysis, InsertBiomechanicalExerciseAnalysis,
  recoveryFlowRules, RecoveryFlowRule, InsertRecoveryFlowRule,
  userAssessments, UserAssessment, InsertUserAssessment
} from "@shared/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { DatabaseStorage } from './databaseStorage';


// Storage interface definition
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Recovery metrics operations
  getRecoveryMetric(id: number): Promise<RecoveryMetric | undefined>;
  getRecoveryMetricsByUserId(userId: number): Promise<RecoveryMetric[]>;
  getRecoveryMetricsByDate(userId: number, date: Date): Promise<RecoveryMetric | undefined>;
  createRecoveryMetric(metric: InsertRecoveryMetric): Promise<RecoveryMetric>;
  updateRecoveryMetric(id: number, metric: Partial<InsertRecoveryMetric>): Promise<RecoveryMetric | undefined>;
  
  // Recovery plans operations
  getRecoveryPlan(id: number): Promise<RecoveryPlan | undefined>;
  getRecoveryPlansByUserId(userId: number): Promise<RecoveryPlan[]>;
  getRecoveryPlanByDate(userId: number, date: Date): Promise<RecoveryPlan | undefined>;
  createRecoveryPlan(plan: InsertRecoveryPlan): Promise<RecoveryPlan>;
  updateRecoveryPlan(id: number, plan: Partial<InsertRecoveryPlan>): Promise<RecoveryPlan | undefined>;
  
  // Recovery tasks operations
  getRecoveryTask(id: number): Promise<RecoveryTask | undefined>;
  getRecoveryTasksByPlanId(planId: number): Promise<RecoveryTask[]>;
  createRecoveryTask(task: InsertRecoveryTask): Promise<RecoveryTask>;
  updateRecoveryTask(id: number, task: Partial<InsertRecoveryTask>): Promise<RecoveryTask | undefined>;
  
  // Movement assessment operations
  getMovementAssessment(id: number): Promise<MovementAssessment | undefined>;
  getMovementAssessmentsByUserId(userId: number): Promise<MovementAssessment[]>;
  getLatestMovementAssessment(userId: number): Promise<MovementAssessment | undefined>;
  createMovementAssessment(assessment: InsertMovementAssessment): Promise<MovementAssessment>;
  
  // Chart data operations
  getChartData(id: number): Promise<ChartData | undefined>;
  getChartDataByUserId(userId: number): Promise<ChartData[]>;
  getChartDataByDateRange(userId: number, startDate: Date, endDate: Date): Promise<ChartData[]>;
  createChartData(data: InsertChartData): Promise<ChartData>;
  
  // Movement limitations operations
  getMovementLimitation(id: number): Promise<MovementLimitation | undefined>;
  getMovementLimitationsByUserId(userId: number): Promise<MovementLimitation[]>;
  createMovementLimitation(limitation: InsertMovementLimitation): Promise<MovementLimitation>;
  updateMovementLimitation(id: number, limitation: Partial<InsertMovementLimitation>): Promise<MovementLimitation | undefined>;
  
  // Exercise library operations
  getExercise(id: number): Promise<ExerciseLibrary | undefined>;
  getExercisesByCategory(category: string): Promise<ExerciseLibrary[]>;
  getExercisesByEquipment(equipment: string): Promise<ExerciseLibrary[]>;
  getExercisesByDifficulty(difficultyLevel: string): Promise<ExerciseLibrary[]>;
  createExercise(exercise: InsertExerciseLibrary): Promise<ExerciseLibrary>;
  updateExercise(id: number, exercise: Partial<InsertExerciseLibrary>): Promise<ExerciseLibrary | undefined>;
  
  // Recovery protocol operations
  getRecoveryProtocol(id: number): Promise<RecoveryProtocol | undefined>;
  getRecoveryProtocolsByTargetArea(targetArea: string): Promise<RecoveryProtocol[]>;
  getRecoveryProtocolsBySport(sport: string): Promise<RecoveryProtocol[]>;
  createRecoveryProtocol(protocol: InsertRecoveryProtocol): Promise<RecoveryProtocol>;
  updateRecoveryProtocol(id: number, protocol: Partial<InsertRecoveryProtocol>): Promise<RecoveryProtocol | undefined>;
  
  // Session feedback operations
  getSessionFeedback(id: number): Promise<SessionFeedback | undefined>;
  getSessionFeedbackBySessionId(sessionId: string): Promise<SessionFeedback | undefined>;
  getSessionFeedbackByUserId(userId: number): Promise<SessionFeedback[]>;
  createSessionFeedback(feedback: InsertSessionFeedback): Promise<SessionFeedback>;
  
  // Exercise feedback operations
  getExerciseFeedback(id: number): Promise<ExerciseFeedback | undefined>;
  getExerciseFeedbackBySessionFeedbackId(sessionFeedbackId: number): Promise<ExerciseFeedback[]>;
  createExerciseFeedback(feedback: InsertExerciseFeedback): Promise<ExerciseFeedback>;
  
  // Expert operations
  getExpert(id: number): Promise<Expert | undefined>;
  getExpertByUsername(username: string): Promise<Expert | undefined>;
  createExpert(expert: InsertExpert): Promise<Expert>;
  updateExpert(id: number, expert: Partial<InsertExpert>): Promise<Expert | undefined>;
  
  // Biomechanical assessment operations
  getBiomechanicalAssessment(id: number): Promise<BiomechanicalAssessment | undefined>;
  getBiomechanicalAssessmentsByExpertId(expertId: number): Promise<BiomechanicalAssessment[]>;
  createBiomechanicalAssessment(assessment: InsertBiomechanicalAssessment): Promise<BiomechanicalAssessment>;
  updateBiomechanicalAssessment(id: number, assessment: Partial<InsertBiomechanicalAssessment>): Promise<BiomechanicalAssessment | undefined>;
  getBiomechanicalAssessmentsCount(expertId: number): Promise<number>;
  
  // Expert template operations
  getExpertTemplate(id: number): Promise<ExpertTemplate | undefined>;
  getExpertTemplatesByExpertId(expertId: number): Promise<ExpertTemplate[]>;
  createExpertTemplate(template: InsertExpertTemplate): Promise<ExpertTemplate>;
  updateExpertTemplate(id: number, template: Partial<InsertExpertTemplate>): Promise<ExpertTemplate | undefined>;
  getExpertTemplatesCount(expertId: number): Promise<number>;
  getRecentExpertTemplates(expertId: number, limit: number): Promise<ExpertTemplate[]>;
  
  // Template exercise operations
  getTemplateExercise(id: number): Promise<TemplateExercise | undefined>;
  getTemplateExercisesByTemplateId(templateId: number): Promise<TemplateExercise[]>;
  createTemplateExercise(exercise: InsertTemplateExercise): Promise<TemplateExercise>;
  updateTemplateExercise(id: number, exercise: Partial<InsertTemplateExercise>): Promise<TemplateExercise | undefined>;
  deleteTemplateExercise(id: number): Promise<boolean>;
  
  // Biomechanical exercise analysis operations
  getBiomechanicalExerciseAnalysis(id: number): Promise<BiomechanicalExerciseAnalysis | undefined>;
  getBiomechanicalExerciseAnalysesByExpertId(expertId: number): Promise<BiomechanicalExerciseAnalysis[]>;
  getBiomechanicalExerciseAnalysesByExerciseId(exerciseId: number): Promise<BiomechanicalExerciseAnalysis[]>;
  createBiomechanicalExerciseAnalysis(analysis: InsertBiomechanicalExerciseAnalysis): Promise<BiomechanicalExerciseAnalysis>;
  updateBiomechanicalExerciseAnalysis(id: number, analysis: Partial<InsertBiomechanicalExerciseAnalysis>): Promise<BiomechanicalExerciseAnalysis | undefined>;
  getBiomechanicalExerciseAnalysesCount(expertId: number): Promise<number>;
  
  // Recovery flow rule operations
  getRecoveryFlowRule(id: number): Promise<RecoveryFlowRule | undefined>;
  getRecoveryFlowRulesByExpertId(expertId: number): Promise<RecoveryFlowRule[]>;
  createRecoveryFlowRule(rule: InsertRecoveryFlowRule): Promise<RecoveryFlowRule>;
  updateRecoveryFlowRule(id: number, rule: Partial<InsertRecoveryFlowRule>): Promise<RecoveryFlowRule | undefined>;
  getRecoveryFlowRulesCount(expertId: number): Promise<number>;
  
  // User assessment operations
  getUserAssessment(id: number): Promise<UserAssessment | undefined>;
  getUserAssessmentsByExpertId(expertId: number): Promise<UserAssessment[]>;
  getUserAssessmentsByUserId(userId: number): Promise<UserAssessment[]>;
  createUserAssessment(assessment: InsertUserAssessment): Promise<UserAssessment>;
  updateUserAssessment(id: number, assessment: Partial<InsertUserAssessment>): Promise<UserAssessment | undefined>;
  getUserAssessmentsCount(expertId: number): Promise<number>;
  getRecentUserAssessments(expertId: number, limit: number): Promise<UserAssessment[]>;
  
  // Advanced search operations
  searchExercisesWithBiomechanicalData(
    options: {
      targetMuscles?: string[];
      category?: string;
      difficultyLevel?: string;
      equipment?: string[];
      hasAnalysis?: boolean;
      effectivenessMinScore?: number;
      biomechanicalConcerns?: string[];
    },
    limit: number,
    offset: number
  ): Promise<Array<ExerciseLibrary & { biomechanicalAnalysis?: BiomechanicalExerciseAnalysis }>>;
  
  // Stats operations
  getExerciseEffectivenessStats(expertId: number): Promise<{
    averageScore: number;
    mostEffectiveExercises: Array<{ exerciseId: number; name: string; score: number; }>;
    exercisesByCategory: Record<string, { count: number; avgScore: number; }>;
  }>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private recoveryMetrics: Map<number, RecoveryMetric>;
  private recoveryPlans: Map<number, RecoveryPlan>;
  private recoveryTasks: Map<number, RecoveryTask>;
  private movementAssessments: Map<number, MovementAssessment>;
  private chartData: Map<number, ChartData>;
  private movementLimitations: Map<number, MovementLimitation>;
  private exerciseLibrary: Map<number, ExerciseLibrary>;
  private recoveryProtocols: Map<number, RecoveryProtocol>;
  private sessionFeedback: Map<number, SessionFeedback>;
  private exerciseFeedback: Map<number, ExerciseFeedback>;
  
  // Expert-related data structures
  private experts: Map<number, Expert>;
  private biomechanicalAssessments: Map<number, BiomechanicalAssessment>;
  private expertTemplates: Map<number, ExpertTemplate>;
  private templateExercises: Map<number, TemplateExercise>;
  private biomechanicalExerciseAnalyses: Map<number, BiomechanicalExerciseAnalysis>;
  private recoveryFlowRules: Map<number, RecoveryFlowRule>;
  private userAssessments: Map<number, UserAssessment>;
  
  currentUserId: number;
  currentRecoveryMetricId: number;
  currentRecoveryPlanId: number;
  currentRecoveryTaskId: number;
  currentMovementAssessmentId: number;
  currentChartDataId: number;
  currentMovementLimitationId: number;
  currentExerciseLibraryId: number;
  currentRecoveryProtocolId: number;
  currentSessionFeedbackId: number;
  currentExerciseFeedbackId: number;
  
  // Expert-related IDs
  currentExpertId: number;
  currentBiomechanicalAssessmentId: number;
  currentExpertTemplateId: number;
  currentTemplateExerciseId: number;
  currentBiomechanicalExerciseAnalysisId: number;
  currentRecoveryFlowRuleId: number;
  currentUserAssessmentId: number;

  constructor() {
    this.users = new Map();
    this.recoveryMetrics = new Map();
    this.recoveryPlans = new Map();
    this.recoveryTasks = new Map();
    this.movementAssessments = new Map();
    this.chartData = new Map();
    this.movementLimitations = new Map();
    this.exerciseLibrary = new Map();
    this.recoveryProtocols = new Map();
    this.sessionFeedback = new Map();
    this.exerciseFeedback = new Map();
    
    // Initialize expert-related data structures
    this.experts = new Map();
    this.biomechanicalAssessments = new Map();
    this.expertTemplates = new Map();
    this.templateExercises = new Map();
    this.biomechanicalExerciseAnalyses = new Map();
    this.recoveryFlowRules = new Map();
    this.userAssessments = new Map();
    
    this.currentUserId = 1;
    this.currentRecoveryMetricId = 1;
    this.currentRecoveryPlanId = 1;
    this.currentRecoveryTaskId = 1;
    this.currentMovementAssessmentId = 1;
    this.currentChartDataId = 1;
    this.currentMovementLimitationId = 1;
    this.currentExerciseLibraryId = 1;
    this.currentRecoveryProtocolId = 1;
    this.currentSessionFeedbackId = 1;
    this.currentExerciseFeedbackId = 1;
    
    // Initialize expert-related IDs
    this.currentExpertId = 1;
    this.currentBiomechanicalAssessmentId = 1;
    this.currentExpertTemplateId = 1;
    this.currentTemplateExerciseId = 1;
    this.currentBiomechanicalExerciseAnalysisId = 1;
    this.currentRecoveryFlowRuleId = 1;
    this.currentUserAssessmentId = 1;
    
    // Adding a default user
    const defaultUser: User = {
      id: this.currentUserId++,
      username: "alexjones",
      password: "password123", // This would be hashed in a real application
      firstName: "Alex",
      lastName: "Jones",
      email: "alex@example.com",
      sportType: "Running",
      height: 180,
      weight: 75,
      dateOfBirth: new Date(1990, 5, 15),
      profileImageUrl: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
      createdAt: new Date(),
      equipmentAccess: "home",
      experienceLevel: "intermediate",
      recoveryGoals: ["Improve sleep quality", "Reduce muscle soreness", "Increase mobility"],
      injuryHistory: [
        { bodyPart: "right knee", description: "ACL strain", date: "2022-05-10" },
        { bodyPart: "lower back", description: "Mild discomfort during heavy lifting", date: "2023-01-15" }
      ],
      completedAssessment: true,
    };
    this.users.set(defaultUser.id, defaultUser);
    
    // Adding default recovery metric for the user
    const today = new Date();
    const defaultMetric: RecoveryMetric = {
      id: this.currentRecoveryMetricId++,
      userId: defaultUser.id,
      date: today,
      recoveryScore: 78,
      readinessScore: 85,
      balanceScore: 70,
      heartRate: 62,
      sleepQuality: 86,
      activityLevel: "Medium",
      soreness: { "back": 2, "legs": 3, "shoulders": 4 },
      hydrationLevel: 80,
      stressLevel: 40,
      notes: "Feeling good overall but slight soreness in shoulders.",
    };
    this.recoveryMetrics.set(defaultMetric.id, defaultMetric);
    
    // Adding default recovery plan
    const defaultPlan: RecoveryPlan = {
      id: this.currentRecoveryPlanId++,
      userId: defaultUser.id,
      date: today,
      aiRecommendation: "Based on your recent training intensity and sleep patterns, I recommend focusing on mobility work today. Your right shoulder shows signs of tension that could benefit from targeted stretching.",
      isCompleted: false,
    };
    this.recoveryPlans.set(defaultPlan.id, defaultPlan);
    
    // Adding default recovery tasks
    const task1: RecoveryTask = {
      id: this.currentRecoveryTaskId++,
      planId: defaultPlan.id,
      title: "Strength Recovery",
      description: "Lower body focus",
      category: "strength",
      duration: 15,
      isCompleted: false,
      progress: 0,
      time: "Morning",
    };
    this.recoveryTasks.set(task1.id, task1);
    
    const task2: RecoveryTask = {
      id: this.currentRecoveryTaskId++,
      planId: defaultPlan.id,
      title: "Hydration Protocol",
      description: "Electrolyte focus",
      category: "nutrition",
      duration: 0, // All day
      isCompleted: false,
      progress: 60,
      time: "All day",
    };
    this.recoveryTasks.set(task2.id, task2);
    
    const task3: RecoveryTask = {
      id: this.currentRecoveryTaskId++,
      planId: defaultPlan.id,
      title: "Sleep Optimization",
      description: "Sleep preparation routine",
      category: "sleep",
      duration: 30,
      isCompleted: false,
      progress: 0,
      time: "9:30 PM",
    };
    this.recoveryTasks.set(task3.id, task3);
    
    // Adding default movement assessment
    const defaultAssessment: MovementAssessment = {
      id: this.currentMovementAssessmentId++,
      userId: defaultUser.id,
      date: new Date(2023, 4, 15), // May 15, 2023
      videoUrl: "https://example.com/assessment.mp4",
      imageUrl: "https://images.unsplash.com/photo-1581009137042-c552e485697a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      feedback: [
        { type: "positive", message: "Good ankle mobility during squat pattern" },
        { type: "improvement", message: "Right shoulder shows limited rotation range" },
        { type: "improvement", message: "Hip alignment could be improved during forward bend" }
      ],
      analysisResult: {
        overallScore: 72,
        shoulderMobility: 65,
        hipMobility: 70,
        ankleMobility: 85,
        recommendations: [
          "Focus on shoulder mobility exercises",
          "Incorporate hip hinge practice daily"
        ]
      }
    };
    this.movementAssessments.set(defaultAssessment.id, defaultAssessment);
    
    // Adding chart data for the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const defaultChartData: ChartData = {
      id: this.currentChartDataId++,
      userId: defaultUser.id,
      date: today,
      recoveryScores: [65, 70, 72, 76, 74, 78, 80],
      sleepScores: [70, 75, 80, 85, 82, 86, 88],
      activityScores: [80, 75, 70, 65, 70, 75, 70]
    };
    this.chartData.set(defaultChartData.id, defaultChartData);
    
    // Adding default movement limitations
    const kneeLimitation: MovementLimitation = {
      id: this.currentMovementLimitationId++,
      userId: defaultUser.id,
      bodyPart: "right knee",
      limitationType: "range",
      severity: 6,
      description: "Limited range during deep squat, some discomfort",
      createdAt: new Date()
    };
    this.movementLimitations.set(kneeLimitation.id, kneeLimitation);
    
    // Adding sample exercises to the library
    const exercise1: ExerciseLibrary = {
      id: this.currentExerciseLibraryId++,
      name: "Foam Rolling - Quadriceps",
      description: "Self-myofascial release technique for the front of the thighs",
      category: "recovery",
      equipmentRequired: ["foam roller"],
      targetMuscles: ["quadriceps", "vastus lateralis", "rectus femoris"],
      difficultyLevel: "beginner",
      videoUrl: "https://example.com/videos/foam-rolling-quads.mp4",
      imageUrl: "https://example.com/images/foam-rolling-quads.jpg",
      instructions: [
        "Place the foam roller under your thighs while facing down",
        "Support your upper body with your hands on the ground",
        "Roll slowly from hip to knee, pausing on tight spots",
        "Breathe deeply and relax into areas of tension",
        "Spend 1-2 minutes on each leg"
      ],
      alternatives: []
    };
    this.exerciseLibrary.set(exercise1.id, exercise1);
    
    const exercise2: ExerciseLibrary = {
      id: this.currentExerciseLibraryId++,
      name: "Active Hamstring Stretch",
      description: "Dynamic stretch to improve hamstring flexibility and mobility",
      category: "mobility",
      equipmentRequired: [],
      targetMuscles: ["hamstrings", "glutes"],
      difficultyLevel: "beginner",
      videoUrl: "https://example.com/videos/active-hamstring-stretch.mp4",
      imageUrl: "https://example.com/images/active-hamstring-stretch.jpg",
      instructions: [
        "Lie on your back with both legs extended",
        "Lift one leg toward the ceiling while keeping it straight",
        "Use a strap or towel around the foot if needed",
        "Actively push your heel toward the ceiling",
        "Hold for 2-3 seconds, then lower slightly and repeat",
        "Perform 10 repetitions per leg"
      ],
      alternatives: []
    };
    this.exerciseLibrary.set(exercise2.id, exercise2);
    
    // Adding recovery protocols
    const recoveryProtocol1: RecoveryProtocol = {
      id: this.currentRecoveryProtocolId++,
      name: "Post-Run Recovery Protocol",
      description: "Comprehensive recovery routine designed for runners to enhance recovery after moderate to high intensity runs",
      targetAreas: ["legs", "hips", "feet"],
      recommendedFrequency: "After runs longer than 45 minutes",
      exerciseIds: [exercise1.id, exercise2.id],
      duration: 30,
      equipmentRequired: ["foam roller", "massage ball"],
      difficultyLevel: "intermediate",
      sportSpecific: ["running", "triathlon"],
      isTemplate: true
    };
    this.recoveryProtocols.set(recoveryProtocol1.id, recoveryProtocol1);
    
    // Adding a default expert
    const defaultExpert: Expert = {
      id: this.currentExpertId++,
      username: "drsmith",
      password: "expert123", // This would be hashed in a real application
      firstName: "Sarah",
      lastName: "Smith",
      email: "sarah.smith@rehab.example.com",
      specialty: "Sports Physical Therapy",
      credentials: "DPT, OCS",
      title: "Senior Recovery Specialist",
      bio: "Dr. Sarah Smith is a sports rehabilitation specialist with over 12 years of experience working with professional and elite amateur athletes. She specializes in movement assessment and customized recovery protocols.",
      profileImageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
      createdAt: new Date(),
      verificationStatus: "verified"
    };
    this.experts.set(defaultExpert.id, defaultExpert);
    
    // Adding a sample biomechanical assessment
    const sampleAssessment: BiomechanicalAssessment = {
      id: this.currentBiomechanicalAssessmentId++,
      expertId: defaultExpert.id,
      title: "Functional Movement Analysis - Runners",
      description: "Comprehensive assessment of movement patterns specific to runners, identifying common compensation patterns and biomechanical inefficiencies",
      targetAudience: ["runners", "triathletes"],
      assessmentCriteria: [
        "Ankle dorsiflexion mobility",
        "Hip extension range",
        "Pelvic stability during single leg stance",
        "Foot pronation control",
        "Core engagement during dynamic movement"
      ],
      relatedMovementPatterns: ["running gait", "single leg squat", "lunge", "hip hinge"],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.biomechanicalAssessments.set(sampleAssessment.id, sampleAssessment);
    
    // Adding a sample expert template
    const runnerRecoveryTemplate: ExpertTemplate = {
      id: this.currentExpertTemplateId++,
      expertId: defaultExpert.id,
      title: "Runner's Recovery Flow",
      description: "Comprehensive recovery protocol for runners, addressing common areas of tightness and overuse",
      targetAudience: ["recreational runners", "competitive runners", "trail runners"],
      duration: 25,
      difficultyLevel: "intermediate",
      equipmentRequired: ["foam roller", "resistance band", "yoga mat"],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublished: true
    };
    this.expertTemplates.set(runnerRecoveryTemplate.id, runnerRecoveryTemplate);
    
    // Adding template exercises for the sample template
    const templateExercise1: TemplateExercise = {
      id: this.currentTemplateExerciseId++,
      templateId: runnerRecoveryTemplate.id,
      exerciseId: exercise1.id,
      order: 1,
      duration: 3,
      repetitions: null,
      sets: null,
      notes: "Focus on IT band and vastus lateralis"
    };
    this.templateExercises.set(templateExercise1.id, templateExercise1);
    
    const templateExercise2: TemplateExercise = {
      id: this.currentTemplateExerciseId++,
      templateId: runnerRecoveryTemplate.id,
      exerciseId: exercise2.id,
      order: 2,
      duration: 2,
      repetitions: 10,
      sets: 1,
      notes: "Ensure proper form with neutral spine"
    };
    this.templateExercises.set(templateExercise2.id, templateExercise2);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Recovery Metrics methods
  async getRecoveryMetric(id: number): Promise<RecoveryMetric | undefined> {
    return this.recoveryMetrics.get(id);
  }
  
  async getRecoveryMetricsByUserId(userId: number): Promise<RecoveryMetric[]> {
    return Array.from(this.recoveryMetrics.values())
      .filter(metric => metric.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending
  }
  
  async getRecoveryMetricsByDate(userId: number, date: Date): Promise<RecoveryMetric | undefined> {
    const dateString = date.toDateString();
    return Array.from(this.recoveryMetrics.values())
      .find(metric => 
        metric.userId === userId && 
        metric.date.toDateString() === dateString
      );
  }
  
  async createRecoveryMetric(metric: InsertRecoveryMetric): Promise<RecoveryMetric> {
    const id = this.currentRecoveryMetricId++;
    const newMetric: RecoveryMetric = { ...metric, id };
    this.recoveryMetrics.set(id, newMetric);
    return newMetric;
  }
  
  async updateRecoveryMetric(id: number, metricUpdate: Partial<InsertRecoveryMetric>): Promise<RecoveryMetric | undefined> {
    const metric = await this.getRecoveryMetric(id);
    if (!metric) return undefined;
    
    const updatedMetric = { ...metric, ...metricUpdate };
    this.recoveryMetrics.set(id, updatedMetric);
    return updatedMetric;
  }

  // Recovery Plans methods
  async getRecoveryPlan(id: number): Promise<RecoveryPlan | undefined> {
    return this.recoveryPlans.get(id);
  }
  
  async getRecoveryPlansByUserId(userId: number): Promise<RecoveryPlan[]> {
    return Array.from(this.recoveryPlans.values())
      .filter(plan => plan.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending
  }
  
  async getRecoveryPlanByDate(userId: number, date: Date): Promise<RecoveryPlan | undefined> {
    const dateString = date.toDateString();
    return Array.from(this.recoveryPlans.values())
      .find(plan => 
        plan.userId === userId && 
        plan.date.toDateString() === dateString
      );
  }
  
  async createRecoveryPlan(plan: InsertRecoveryPlan): Promise<RecoveryPlan> {
    const id = this.currentRecoveryPlanId++;
    const newPlan: RecoveryPlan = { ...plan, id };
    this.recoveryPlans.set(id, newPlan);
    return newPlan;
  }
  
  async updateRecoveryPlan(id: number, planUpdate: Partial<InsertRecoveryPlan>): Promise<RecoveryPlan | undefined> {
    const plan = await this.getRecoveryPlan(id);
    if (!plan) return undefined;
    
    const updatedPlan = { ...plan, ...planUpdate };
    this.recoveryPlans.set(id, updatedPlan);
    return updatedPlan;
  }

  // Recovery Tasks methods
  async getRecoveryTask(id: number): Promise<RecoveryTask | undefined> {
    return this.recoveryTasks.get(id);
  }
  
  async getRecoveryTasksByPlanId(planId: number): Promise<RecoveryTask[]> {
    return Array.from(this.recoveryTasks.values())
      .filter(task => task.planId === planId);
  }
  
  async createRecoveryTask(task: InsertRecoveryTask): Promise<RecoveryTask> {
    const id = this.currentRecoveryTaskId++;
    const newTask: RecoveryTask = { ...task, id };
    this.recoveryTasks.set(id, newTask);
    return newTask;
  }
  
  async updateRecoveryTask(id: number, taskUpdate: Partial<InsertRecoveryTask>): Promise<RecoveryTask | undefined> {
    const task = await this.getRecoveryTask(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskUpdate };
    this.recoveryTasks.set(id, updatedTask);
    return updatedTask;
  }

  // Movement Assessment methods
  async getMovementAssessment(id: number): Promise<MovementAssessment | undefined> {
    return this.movementAssessments.get(id);
  }
  
  async getMovementAssessmentsByUserId(userId: number): Promise<MovementAssessment[]> {
    return Array.from(this.movementAssessments.values())
      .filter(assessment => assessment.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending
  }
  
  async getLatestMovementAssessment(userId: number): Promise<MovementAssessment | undefined> {
    const assessments = await this.getMovementAssessmentsByUserId(userId);
    return assessments.length > 0 ? assessments[0] : undefined;
  }
  
  async createMovementAssessment(assessment: InsertMovementAssessment): Promise<MovementAssessment> {
    const id = this.currentMovementAssessmentId++;
    const newAssessment: MovementAssessment = { 
      ...assessment, 
      id,
      date: new Date()
    };
    this.movementAssessments.set(id, newAssessment);
    return newAssessment;
  }

  // Chart Data methods
  async getChartData(id: number): Promise<ChartData | undefined> {
    return this.chartData.get(id);
  }
  
  async getChartDataByUserId(userId: number): Promise<ChartData[]> {
    return Array.from(this.chartData.values())
      .filter(data => data.userId === userId)
      .sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort by date ascending
  }
  
  async getChartDataByDateRange(userId: number, startDate: Date, endDate: Date): Promise<ChartData[]> {
    return Array.from(this.chartData.values())
      .filter(data => 
        data.userId === userId && 
        data.date >= startDate && 
        data.date <= endDate
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort by date ascending
  }
  
  async createChartData(data: InsertChartData): Promise<ChartData> {
    const id = this.currentChartDataId++;
    const newData: ChartData = { ...data, id };
    this.chartData.set(id, newData);
    return newData;
  }

  // Movement Limitation methods
  async getMovementLimitation(id: number): Promise<MovementLimitation | undefined> {
    return this.movementLimitations.get(id);
  }
  
  async getMovementLimitationsByUserId(userId: number): Promise<MovementLimitation[]> {
    return Array.from(this.movementLimitations.values())
      .filter(limitation => limitation.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by creation date descending
  }
  
  async createMovementLimitation(limitation: InsertMovementLimitation): Promise<MovementLimitation> {
    const id = this.currentMovementLimitationId++;
    const newLimitation: MovementLimitation = {
      ...limitation,
      id,
      createdAt: new Date()
    };
    this.movementLimitations.set(id, newLimitation);
    return newLimitation;
  }
  
  async updateMovementLimitation(id: number, limitationUpdate: Partial<InsertMovementLimitation>): Promise<MovementLimitation | undefined> {
    const limitation = await this.getMovementLimitation(id);
    if (!limitation) return undefined;
    
    const updatedLimitation = { ...limitation, ...limitationUpdate };
    this.movementLimitations.set(id, updatedLimitation);
    return updatedLimitation;
  }
  
  // Exercise Library methods
  async getExercise(id: number): Promise<ExerciseLibrary | undefined> {
    return this.exerciseLibrary.get(id);
  }
  
  async getExercisesByCategory(category: string): Promise<ExerciseLibrary[]> {
    return Array.from(this.exerciseLibrary.values())
      .filter(exercise => exercise.category === category);
  }
  
  async getExercisesByEquipment(equipment: string): Promise<ExerciseLibrary[]> {
    return Array.from(this.exerciseLibrary.values())
      .filter(exercise => exercise.equipmentRequired.includes(equipment));
  }
  
  async getExercisesByDifficulty(difficultyLevel: string): Promise<ExerciseLibrary[]> {
    return Array.from(this.exerciseLibrary.values())
      .filter(exercise => exercise.difficultyLevel === difficultyLevel);
  }
  
  async createExercise(exercise: InsertExerciseLibrary): Promise<ExerciseLibrary> {
    const id = this.currentExerciseLibraryId++;
    const newExercise: ExerciseLibrary = { ...exercise, id };
    this.exerciseLibrary.set(id, newExercise);
    return newExercise;
  }
  
  async updateExercise(id: number, exerciseUpdate: Partial<InsertExerciseLibrary>): Promise<ExerciseLibrary | undefined> {
    const exercise = await this.getExercise(id);
    if (!exercise) return undefined;
    
    const updatedExercise = { ...exercise, ...exerciseUpdate };
    this.exerciseLibrary.set(id, updatedExercise);
    return updatedExercise;
  }
  
  // Recovery Protocol methods
  async getRecoveryProtocol(id: number): Promise<RecoveryProtocol | undefined> {
    return this.recoveryProtocols.get(id);
  }
  
  async getRecoveryProtocolsByTargetArea(targetArea: string): Promise<RecoveryProtocol[]> {
    return Array.from(this.recoveryProtocols.values())
      .filter(protocol => protocol.targetAreas.includes(targetArea));
  }
  
  async getRecoveryProtocolsBySport(sport: string): Promise<RecoveryProtocol[]> {
    return Array.from(this.recoveryProtocols.values())
      .filter(protocol => protocol.sportSpecific.includes(sport));
  }
  
  async createRecoveryProtocol(protocol: InsertRecoveryProtocol): Promise<RecoveryProtocol> {
    const id = this.currentRecoveryProtocolId++;
    const newProtocol: RecoveryProtocol = { ...protocol, id };
    this.recoveryProtocols.set(id, newProtocol);
    return newProtocol;
  }
  
  async updateRecoveryProtocol(id: number, protocolUpdate: Partial<InsertRecoveryProtocol>): Promise<RecoveryProtocol | undefined> {
    const protocol = await this.getRecoveryProtocol(id);
    if (!protocol) return undefined;
    
    const updatedProtocol = { ...protocol, ...protocolUpdate };
    this.recoveryProtocols.set(id, updatedProtocol);
    return updatedProtocol;
  }

  // Session Feedback methods
  async getSessionFeedback(id: number): Promise<SessionFeedback | undefined> {
    return this.sessionFeedback.get(id);
  }
  
  async getSessionFeedbackBySessionId(sessionId: string): Promise<SessionFeedback | undefined> {
    return Array.from(this.sessionFeedback.values())
      .find(feedback => feedback.sessionId === sessionId);
  }
  
  async getSessionFeedbackByUserId(userId: number): Promise<SessionFeedback[]> {
    return Array.from(this.sessionFeedback.values())
      .filter(feedback => feedback.userId === userId)
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime()); // Sort by completion date descending
  }
  
  async createSessionFeedback(feedback: InsertSessionFeedback): Promise<SessionFeedback> {
    const id = this.currentSessionFeedbackId++;
    const newFeedback: SessionFeedback = {
      ...feedback,
      id,
      completedAt: new Date(),
      createdAt: new Date()
    };
    this.sessionFeedback.set(id, newFeedback);
    return newFeedback;
  }
  
  // Exercise Feedback methods
  async getExerciseFeedback(id: number): Promise<ExerciseFeedback | undefined> {
    return this.exerciseFeedback.get(id);
  }
  
  async getExerciseFeedbackBySessionFeedbackId(sessionFeedbackId: number): Promise<ExerciseFeedback[]> {
    return Array.from(this.exerciseFeedback.values())
      .filter(feedback => feedback.sessionFeedbackId === sessionFeedbackId);
  }
  
  async createExerciseFeedback(feedback: InsertExerciseFeedback): Promise<ExerciseFeedback> {
    const id = this.currentExerciseFeedbackId++;
    const newFeedback: ExerciseFeedback = {
      ...feedback,
      id
    };
    this.exerciseFeedback.set(id, newFeedback);
    return newFeedback;
  }

  // Expert methods
  async getExpert(id: number): Promise<Expert | undefined> {
    return this.experts.get(id);
  }

  async getExpertByUsername(username: string): Promise<Expert | undefined> {
    return Array.from(this.experts.values()).find(
      (expert) => expert.username === username,
    );
  }

  async createExpert(insertExpert: InsertExpert): Promise<Expert> {
    const id = this.currentExpertId++;
    const expert: Expert = { 
      ...insertExpert, 
      id,
      createdAt: new Date()
    };
    this.experts.set(id, expert);
    return expert;
  }
  
  async updateExpert(id: number, expertUpdate: Partial<InsertExpert>): Promise<Expert | undefined> {
    const expert = await this.getExpert(id);
    if (!expert) return undefined;
    
    const updatedExpert = { ...expert, ...expertUpdate };
    this.experts.set(id, updatedExpert);
    return updatedExpert;
  }

  // Biomechanical Assessment methods
  async getBiomechanicalAssessment(id: number): Promise<BiomechanicalAssessment | undefined> {
    return this.biomechanicalAssessments.get(id);
  }
  
  async getBiomechanicalAssessmentsByExpertId(expertId: number): Promise<BiomechanicalAssessment[]> {
    return Array.from(this.biomechanicalAssessments.values())
      .filter(assessment => assessment.expertId === expertId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by creation date descending
  }
  
  async createBiomechanicalAssessment(assessment: InsertBiomechanicalAssessment): Promise<BiomechanicalAssessment> {
    const id = this.currentBiomechanicalAssessmentId++;
    const newAssessment: BiomechanicalAssessment = {
      ...assessment,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.biomechanicalAssessments.set(id, newAssessment);
    return newAssessment;
  }
  
  async updateBiomechanicalAssessment(id: number, assessmentUpdate: Partial<InsertBiomechanicalAssessment>): Promise<BiomechanicalAssessment | undefined> {
    const assessment = await this.getBiomechanicalAssessment(id);
    if (!assessment) return undefined;
    
    const updatedAssessment = { 
      ...assessment, 
      ...assessmentUpdate,
      updatedAt: new Date()
    };
    this.biomechanicalAssessments.set(id, updatedAssessment);
    return updatedAssessment;
  }

  // Expert Template methods
  async getExpertTemplate(id: number): Promise<ExpertTemplate | undefined> {
    return this.expertTemplates.get(id);
  }
  
  async getExpertTemplatesByExpertId(expertId: number): Promise<ExpertTemplate[]> {
    return Array.from(this.expertTemplates.values())
      .filter(template => template.expertId === expertId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by creation date descending
  }
  
  async createExpertTemplate(template: InsertExpertTemplate): Promise<ExpertTemplate> {
    const id = this.currentExpertTemplateId++;
    const newTemplate: ExpertTemplate = {
      ...template,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.expertTemplates.set(id, newTemplate);
    return newTemplate;
  }
  
  async updateExpertTemplate(id: number, templateUpdate: Partial<InsertExpertTemplate>): Promise<ExpertTemplate | undefined> {
    const template = await this.getExpertTemplate(id);
    if (!template) return undefined;
    
    const updatedTemplate = { 
      ...template, 
      ...templateUpdate,
      updatedAt: new Date()
    };
    this.expertTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }
  
  // Template Exercise methods
  async getTemplateExercise(id: number): Promise<TemplateExercise | undefined> {
    return this.templateExercises.get(id);
  }
  
  async getTemplateExercisesByTemplateId(templateId: number): Promise<TemplateExercise[]> {
    return Array.from(this.templateExercises.values())
      .filter(exercise => exercise.templateId === templateId)
      .sort((a, b) => a.order - b.order); // Sort by order
  }
  
  async createTemplateExercise(exercise: InsertTemplateExercise): Promise<TemplateExercise> {
    const id = this.currentTemplateExerciseId++;
    const newExercise: TemplateExercise = { ...exercise, id };
    this.templateExercises.set(id, newExercise);
    return newExercise;
  }
  
  async updateTemplateExercise(id: number, exerciseUpdate: Partial<InsertTemplateExercise>): Promise<TemplateExercise | undefined> {
    const exercise = await this.getTemplateExercise(id);
    if (!exercise) return undefined;
    
    const updatedExercise = { ...exercise, ...exerciseUpdate };
    this.templateExercises.set(id, updatedExercise);
    return updatedExercise;
  }
  
  async deleteTemplateExercise(id: number): Promise<boolean> {
    const exists = this.templateExercises.has(id);
    if (exists) {
      this.templateExercises.delete(id);
      return true;
    }
    return false;
  }

  // Biomechanical Exercise Analysis methods
  async getBiomechanicalExerciseAnalysis(id: number): Promise<BiomechanicalExerciseAnalysis | undefined> {
    return this.biomechanicalExerciseAnalyses.get(id);
  }
  
  async getBiomechanicalExerciseAnalysesByExpertId(expertId: number): Promise<BiomechanicalExerciseAnalysis[]> {
    return Array.from(this.biomechanicalExerciseAnalyses.values())
      .filter(analysis => analysis.expertId === expertId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by creation date descending
  }
  
  async getBiomechanicalExerciseAnalysesByExerciseId(exerciseId: number): Promise<BiomechanicalExerciseAnalysis[]> {
    return Array.from(this.biomechanicalExerciseAnalyses.values())
      .filter(analysis => analysis.exerciseId === exerciseId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by creation date descending
  }
  
  async createBiomechanicalExerciseAnalysis(analysis: InsertBiomechanicalExerciseAnalysis): Promise<BiomechanicalExerciseAnalysis> {
    const id = this.currentBiomechanicalExerciseAnalysisId++;
    const newAnalysis: BiomechanicalExerciseAnalysis = {
      ...analysis,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.biomechanicalExerciseAnalyses.set(id, newAnalysis);
    return newAnalysis;
  }
  
  async updateBiomechanicalExerciseAnalysis(id: number, analysisUpdate: Partial<InsertBiomechanicalExerciseAnalysis>): Promise<BiomechanicalExerciseAnalysis | undefined> {
    const analysis = await this.getBiomechanicalExerciseAnalysis(id);
    if (!analysis) return undefined;
    
    const updatedAnalysis = { 
      ...analysis, 
      ...analysisUpdate,
      updatedAt: new Date()
    };
    this.biomechanicalExerciseAnalyses.set(id, updatedAnalysis);
    return updatedAnalysis;
  }

  // Recovery Flow Rule methods
  async getRecoveryFlowRule(id: number): Promise<RecoveryFlowRule | undefined> {
    return this.recoveryFlowRules.get(id);
  }
  
  async getRecoveryFlowRulesByExpertId(expertId: number): Promise<RecoveryFlowRule[]> {
    return Array.from(this.recoveryFlowRules.values())
      .filter(rule => rule.expertId === expertId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by creation date descending
  }
  
  async createRecoveryFlowRule(rule: InsertRecoveryFlowRule): Promise<RecoveryFlowRule> {
    const id = this.currentRecoveryFlowRuleId++;
    const newRule: RecoveryFlowRule = {
      ...rule,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.recoveryFlowRules.set(id, newRule);
    return newRule;
  }
  
  async updateRecoveryFlowRule(id: number, ruleUpdate: Partial<InsertRecoveryFlowRule>): Promise<RecoveryFlowRule | undefined> {
    const rule = await this.getRecoveryFlowRule(id);
    if (!rule) return undefined;
    
    const updatedRule = { 
      ...rule, 
      ...ruleUpdate,
      updatedAt: new Date()
    };
    this.recoveryFlowRules.set(id, updatedRule);
    return updatedRule;
  }

  // User Assessment methods
  async getUserAssessment(id: number): Promise<UserAssessment | undefined> {
    return this.userAssessments.get(id);
  }
  
  async getUserAssessmentsByExpertId(expertId: number): Promise<UserAssessment[]> {
    return Array.from(this.userAssessments.values())
      .filter(assessment => assessment.expertId === expertId)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending
  }
  
  async getUserAssessmentsByUserId(userId: number): Promise<UserAssessment[]> {
    return Array.from(this.userAssessments.values())
      .filter(assessment => assessment.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending
  }
  
  async createUserAssessment(assessment: InsertUserAssessment): Promise<UserAssessment> {
    const id = this.currentUserAssessmentId++;
    const newAssessment: UserAssessment = { 
      ...assessment, 
      id,
      date: new Date()
    };
    this.userAssessments.set(id, newAssessment);
    return newAssessment;
  }
  
  async updateUserAssessment(id: number, assessmentUpdate: Partial<InsertUserAssessment>): Promise<UserAssessment | undefined> {
    const assessment = await this.getUserAssessment(id);
    if (!assessment) return undefined;
    
    const updatedAssessment = { ...assessment, ...assessmentUpdate };
    this.userAssessments.set(id, updatedAssessment);
    return updatedAssessment;
  }

  // Dashboard statistics methods
  async getExpertTemplatesCount(expertId: number): Promise<number> {
    return Array.from(this.expertTemplates.values())
      .filter(template => template.expertId === expertId).length;
  }
  
  async getBiomechanicalAssessmentsCount(expertId: number): Promise<number> {
    return Array.from(this.biomechanicalAssessments.values())
      .filter(assessment => assessment.expertId === expertId).length;
  }
  
  async getBiomechanicalExerciseAnalysesCount(expertId: number): Promise<number> {
    return Array.from(this.biomechanicalExerciseAnalyses.values())
      .filter(analysis => analysis.expertId === expertId).length;
  }
  
  async getRecoveryFlowRulesCount(expertId: number): Promise<number> {
    return Array.from(this.recoveryFlowRules.values())
      .filter(rule => rule.expertId === expertId).length;
  }
  
  async getUserAssessmentsCount(expertId: number): Promise<number> {
    return Array.from(this.userAssessments.values())
      .filter(assessment => assessment.expertId === expertId).length;
  }
  
  async getRecentExpertTemplates(expertId: number, limit: number = 5): Promise<ExpertTemplate[]> {
    return (await this.getExpertTemplatesByExpertId(expertId)).slice(0, limit);
  }
  
  async getRecentUserAssessments(expertId: number, limit: number = 5): Promise<UserAssessment[]> {
    return (await this.getUserAssessmentsByExpertId(expertId)).slice(0, limit);
  }
  
  // Search and statistics methods
  async searchExercisesWithBiomechanicalData(
    options: {
      targetMuscles?: string[];
      category?: string;
      difficultyLevel?: string;
      equipment?: string[];
      hasAnalysis?: boolean;
      effectivenessMinScore?: number;
      biomechanicalConcerns?: string[];
    },
    limit: number,
    offset: number
  ): Promise<Array<ExerciseLibrary & { biomechanicalAnalysis?: BiomechanicalExerciseAnalysis }>> {
    const exercises = Array.from(this.exerciseLibrary.values());
    const analyses = Array.from(this.biomechanicalExerciseAnalyses.values());
    
    // Filter exercises based on options
    let filteredExercises = exercises.filter(exercise => {
      // Category filter
      if (options.category && exercise.category !== options.category) {
        return false;
      }
      
      // Difficulty level filter
      if (options.difficultyLevel && exercise.difficultyLevel !== options.difficultyLevel) {
        return false;
      }
      
      // Target muscles filter
      if (options.targetMuscles && options.targetMuscles.length > 0) {
        if (!exercise.targetMuscles) return false;
        
        const hasTargetMuscle = options.targetMuscles.some(muscle => 
          exercise.targetMuscles.includes(muscle)
        );
        if (!hasTargetMuscle) return false;
      }
      
      // Equipment filter
      if (options.equipment && options.equipment.length > 0) {
        if (!exercise.equipmentRequired) return false;
        
        const hasEquipment = options.equipment.some(eq => 
          exercise.equipmentRequired.includes(eq)
        );
        if (!hasEquipment) return false;
      }
      
      return true;
    });
    
    // Further filter based on biomechanical analysis
    if (options.hasAnalysis || options.effectivenessMinScore || options.biomechanicalConcerns) {
      filteredExercises = filteredExercises.filter(exercise => {
        const analysis = analyses.find(a => a.exerciseId === exercise.id);
        
        // Has analysis filter
        if (options.hasAnalysis && !analysis) {
          return false;
        }
        
        // Effectiveness score filter
        if (options.effectivenessMinScore && (!analysis || analysis.effectivenessScore < options.effectivenessMinScore)) {
          return false;
        }
        
        // Biomechanical concerns filter
        if (options.biomechanicalConcerns && options.biomechanicalConcerns.length > 0) {
          if (!analysis || !analysis.contraindications) return false;
          
          const hasConcern = options.biomechanicalConcerns.some(concern => 
            analysis.contraindications.includes(concern)
          );
          if (!hasConcern) return false;
        }
        
        return true;
      });
    }
    
    // Paginate and enhance with analysis data
    const paginatedExercises = filteredExercises
      .slice(offset, offset + limit)
      .map(exercise => {
        const analysis = analyses.find(a => a.exerciseId === exercise.id);
        return {
          ...exercise,
          biomechanicalAnalysis: analysis
        };
      });
      
    return paginatedExercises;
  }
  
  async getExerciseEffectivenessStats(expertId: number): Promise<{
    averageScore: number;
    mostEffectiveExercises: Array<{ exerciseId: number; name: string; score: number; }>;
    exercisesByCategory: Record<string, { count: number; avgScore: number; }>;
  }> {
    const analyses = await this.getBiomechanicalExerciseAnalysesByExpertId(expertId);
    const exercises = Array.from(this.exerciseLibrary.values());
    const feedbacks = Array.from(this.exerciseFeedback.values());
    
    let totalScore = 0;
    let totalCount = 0;
    
    // Calculate average effectiveness by exercise
    const exerciseEffectiveness = new Map<number, { total: number, count: number }>();
    
    for (const feedback of feedbacks) {
      const exerciseId = parseInt(feedback.exerciseId);
      if (isNaN(exerciseId)) continue;
      
      if (!exerciseEffectiveness.has(exerciseId)) {
        exerciseEffectiveness.set(exerciseId, { total: 0, count: 0 });
      }
      
      const stats = exerciseEffectiveness.get(exerciseId);
      if (stats) {
        stats.total += feedback.effectiveness;
        stats.count += 1;
        totalScore += feedback.effectiveness;
        totalCount += 1;
      }
    }
    
    // Calculate by category
    const categoryEffectiveness: Record<string, { count: number; avgScore: number }> = {};
    
    for (const [exerciseId, stats] of exerciseEffectiveness) {
      const exercise = exercises.find(e => e.id === exerciseId);
      if (!exercise) continue;
      
      if (!categoryEffectiveness[exercise.category]) {
        categoryEffectiveness[exercise.category] = { count: 0, avgScore: 0 };
      }
      
      // Calculate the average score for this exercise
      const exerciseAvgScore = stats.count > 0 ? stats.total / stats.count : 0;
      
      // Update the category's running total
      categoryEffectiveness[exercise.category].count += 1;
      categoryEffectiveness[exercise.category].avgScore = 
        (categoryEffectiveness[exercise.category].avgScore * (categoryEffectiveness[exercise.category].count - 1) + exerciseAvgScore) / 
        categoryEffectiveness[exercise.category].count;
    }
    
    const effectivenessArray = Array.from(exerciseEffectiveness.entries())
      .map(([exerciseId, data]) => {
        const exercise = exercises.find(e => e.id === exerciseId);
        return {
          exerciseId,
          name: exercise?.name || `Exercise ${exerciseId}`,
          score: data.count > 0 ? data.total / data.count : 0
        };
      });
    
    // Sort for most effective exercises
    effectivenessArray.sort((a, b) => b.score - a.score);
    const mostEffectiveExercises = effectivenessArray.slice(0, 5);
    
    return {
      averageScore: totalCount > 0 ? totalScore / totalCount : 0,
      mostEffectiveExercises,
      exercisesByCategory: categoryEffectiveness
    };
  }
}

// Use DatabaseStorage when a database is available, otherwise fall back to MemStorage
// Temporarily using MemStorage for now due to connection issues
export const storage = new MemStorage();
