export type ExerciseStatus = "draft" | "published" | "archived";
export type ExerciseDifficulty = "easy" | "medium" | "hard";
export type ImportJobStatus = "pending" | "processing" | "completed" | "failed";

export type ManagementExercise = {
  id: string;
  title: string;
  status: ExerciseStatus;
  difficulty: ExerciseDifficulty;
  topicId: string;
  topicName: string;
  source: "manual" | "xml";
  position: number;
  updatedAt: string;
  statement?: string;
  steps?: ManagementStep[];
};

export type ManagementStep = {
  id: string;
  phase: "identification" | "strategy" | "procedure" | "verification";
  position: number;
  prompt: string;
  answerType: "single_choice" | "multi_choice" | "numeric" | "expression";
  options?: { id: string; label: string }[];
  correctAnswer?: string | string[];
  tolerance?: number;
  maxScore: number;
  hints?: { text: string; penaltyPercent: number }[];
};

export type ImportJobSummary = {
  id: string;
  filename: string;
  status: ImportJobStatus;
  createdAt: string;
  createdCount?: number;
  rejectedCount?: number;
  report?: ImportReport;
};

export type ImportReport = {
  created: number;
  rejected: { index: number; title: string; errors: string[] }[];
};

export type ContentDashboardSummary = {
  totalsByStatus: Record<ExerciseStatus, number>;
  totalExercises: number;
  recentImports: ImportJobSummary[];
};

export type LtiContext = {
  contextId: string;
  contextTitle: string;
  platformName: string;
  lessonSessionsCount: number;
};

export type Paginated<T> = {
  data: T[];
  meta: { page: number; totalPages: number; totalCount: number };
};

export type ManagementExerciseFilters = {
  topicId?: string;
  status?: ExerciseStatus;
  difficulty?: ExerciseDifficulty;
  page?: number;
};
