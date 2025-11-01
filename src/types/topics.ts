export interface Topic {
  id: string;
  name: string;
  slug: string;
  category: 'período' | 'técnica' | 'estilista' | 'movimento' | 'outro';
  description: string | null;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface TopicPerformance {
  topic: Topic;
  performance: 'fraqueza' | 'regular' | 'força';
  errorCount: number;
  lastError: string | null;
}
