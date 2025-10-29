export interface UserLearningProfile {
  id: string;
  user_id: string;
  learning_style: string | null;
  strengths: string[];
  weaknesses: string[];
  average_score: number;
  total_quizzes_completed: number;
  total_lessons_completed: number;
  completion_rate: number;
  preferred_difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  level: number;
  badges: string[];
  streak_days: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: any;
  lesson_type: 'questionnaire' | 'image_analysis' | 'quiz' | 'theory';
  topics: string[];
  fashion_era: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_duration: number | null;
  points_reward: number;
  embedding: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserLessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  responses: any;
  time_spent: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  lesson_id: string | null;
  quiz_type: 'adaptive' | 'lesson_based' | 'custom';
  questions: QuizQuestion[];
  answers: any;
  correct_answers: number;
  incorrect_answers: number;
  score: number;
  topics_covered: string[];
  time_taken: number | null;
  points_earned: number;
  completed_at: string;
  created_at: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  topics?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface UserDifficulty {
  id: string;
  user_id: string;
  topic: string;
  category: string | null;
  difficulty_level: 'low' | 'medium' | 'high' | 'critical';
  error_count: number;
  last_error_at: string;
  context: string | null;
  embedding: string | null;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIRecommendation {
  id: string;
  user_id: string;
  recommendation_type: 'lesson' | 'quiz' | 'study_plan';
  content: any;
  based_on_difficulties: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'accepted' | 'completed' | 'dismissed';
  reasoning: string | null;
  created_at: string;
  expires_at: string | null;
  accepted_at: string | null;
  completed_at: string | null;
}
