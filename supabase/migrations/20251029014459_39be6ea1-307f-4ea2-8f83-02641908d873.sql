-- =====================================================
-- FASE 1: Sistema de Aprendizagem Adaptativa - Olhar de Moda
-- =====================================================

-- 1.1 Habilitar extensão pgvector para embeddings semânticos
CREATE EXTENSION IF NOT EXISTS vector;

-- 1.2 Criar tabelas principais do sistema de aprendizagem

-- Tabela: user_learning_profiles
-- Perfil de aprendizagem de cada usuário com métricas agregadas
CREATE TABLE IF NOT EXISTS public.user_learning_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  learning_style TEXT, -- 'visual', 'textual', 'interactive', etc.
  strengths TEXT[] DEFAULT '{}', -- Array de tópicos fortes
  weaknesses TEXT[] DEFAULT '{}', -- Array de tópicos fracos
  average_score DECIMAL(5,2) DEFAULT 0, -- Pontuação média geral
  total_quizzes_completed INTEGER DEFAULT 0,
  total_lessons_completed INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0, -- Taxa de conclusão
  preferred_difficulty TEXT DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  points INTEGER DEFAULT 0, -- Sistema de gamificação
  level INTEGER DEFAULT 1, -- Nível do usuário
  badges TEXT[] DEFAULT '{}', -- Badges conquistados
  streak_days INTEGER DEFAULT 0, -- Dias consecutivos estudando
  last_activity_date DATE, -- Última atividade para tracking de streak
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: lessons
-- Catálogo de lições com metadata e embeddings
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content JSONB, -- Conteúdo estruturado da lição
  lesson_type TEXT NOT NULL, -- 'questionnaire', 'image_analysis', 'quiz', 'theory', etc.
  topics TEXT[] NOT NULL DEFAULT '{}', -- Array de tópicos abordados
  fashion_era TEXT, -- 'década de 20', 'década de 60', 'contemporâneo', etc.
  difficulty TEXT DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  estimated_duration INTEGER, -- Duração estimada em minutos
  points_reward INTEGER DEFAULT 100, -- Pontos ganhos ao completar
  embedding vector(1536), -- Embedding semântico do conteúdo da lição
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca vetorial eficiente
CREATE INDEX IF NOT EXISTS lessons_embedding_idx ON public.lessons 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Tabela: user_lesson_progress
-- Progresso individual em cada lição
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  progress_percentage INTEGER DEFAULT 0,
  responses JSONB DEFAULT '{}', -- Todas as respostas do usuário nesta lição
  time_spent INTEGER DEFAULT 0, -- Tempo gasto em segundos
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Tabela: quiz_attempts
-- Histórico completo de tentativas de quiz
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  quiz_type TEXT NOT NULL, -- 'adaptive', 'lesson_based', 'custom', etc.
  questions JSONB NOT NULL DEFAULT '[]', -- Array de perguntas e opções
  answers JSONB NOT NULL DEFAULT '{}', -- Respostas do usuário com timestamp
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  score DECIMAL(5,2), -- Pontuação percentual
  topics_covered TEXT[] DEFAULT '{}', -- Tópicos do quiz
  time_taken INTEGER, -- Tempo em segundos
  points_earned INTEGER DEFAULT 0, -- Pontos ganhos neste quiz
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: user_difficulties
-- Registro detalhado de dificuldades identificadas
CREATE TABLE IF NOT EXISTS public.user_difficulties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL, -- Tópico específico (ex: 'silhueta anos 20')
  category TEXT, -- Categoria mais ampla (ex: 'história da moda')
  difficulty_level TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  error_count INTEGER DEFAULT 1, -- Número de erros neste tópico
  last_error_at TIMESTAMPTZ DEFAULT NOW(),
  context TEXT, -- Contexto do erro (pergunta específica)
  embedding vector(1536), -- Embedding semântico da dificuldade
  resolved BOOLEAN DEFAULT false, -- Se foi resolvida
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca vetorial de dificuldades similares
CREATE INDEX IF NOT EXISTS user_difficulties_embedding_idx ON public.user_difficulties 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Índice composto para consultas rápidas
CREATE INDEX IF NOT EXISTS user_difficulties_user_topic_idx ON public.user_difficulties(user_id, topic, resolved);

-- Tabela: ai_recommendations
-- Recomendações geradas pela IA
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recommendation_type TEXT NOT NULL, -- 'lesson', 'quiz', 'study_plan'
  content JSONB NOT NULL DEFAULT '{}', -- Conteúdo da recomendação
  based_on_difficulties UUID[] DEFAULT '{}', -- IDs das dificuldades que geraram esta recomendação
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'completed', 'dismissed'
  reasoning TEXT, -- Explicação da IA sobre a recomendação
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Recomendações podem expirar
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 1.3 Criar triggers para atualização automática de updated_at
CREATE TRIGGER update_user_learning_profiles_updated_at 
BEFORE UPDATE ON public.user_learning_profiles 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at 
BEFORE UPDATE ON public.lessons 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_lesson_progress_updated_at 
BEFORE UPDATE ON public.user_lesson_progress 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_difficulties_updated_at 
BEFORE UPDATE ON public.user_difficulties 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 1.4 Políticas RLS (Row Level Security)

-- user_learning_profiles
ALTER TABLE public.user_learning_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own learning profile" 
ON public.user_learning_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning profile" 
ON public.user_learning_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning profile" 
ON public.user_learning_profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all learning profiles" 
ON public.user_learning_profiles FOR SELECT 
USING (public.has_role(auth.uid(), 'super_admin'));

-- lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active lessons" 
ON public.lessons FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Super admins can insert lessons" 
ON public.lessons FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update lessons" 
ON public.lessons FOR UPDATE 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete lessons" 
ON public.lessons FOR DELETE 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can view all lessons" 
ON public.lessons FOR SELECT 
USING (public.has_role(auth.uid(), 'super_admin'));

-- user_lesson_progress
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress" 
ON public.user_lesson_progress FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
ON public.user_lesson_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.user_lesson_progress FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all progress" 
ON public.user_lesson_progress FOR SELECT 
USING (public.has_role(auth.uid(), 'super_admin'));

-- quiz_attempts
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz attempts" 
ON public.quiz_attempts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz attempts" 
ON public.quiz_attempts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can view all quiz attempts" 
ON public.quiz_attempts FOR SELECT 
USING (public.has_role(auth.uid(), 'super_admin'));

-- user_difficulties
ALTER TABLE public.user_difficulties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own difficulties" 
ON public.user_difficulties FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own difficulties" 
ON public.user_difficulties FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own difficulties" 
ON public.user_difficulties FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all difficulties" 
ON public.user_difficulties FOR SELECT 
USING (public.has_role(auth.uid(), 'super_admin'));

-- ai_recommendations
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recommendations" 
ON public.ai_recommendations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations" 
ON public.ai_recommendations FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all recommendations" 
ON public.ai_recommendations FOR SELECT 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "System can insert recommendations" 
ON public.ai_recommendations FOR INSERT 
WITH CHECK (true);

-- Criar perfil de aprendizagem automaticamente quando um usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user_learning_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_learning_profiles (user_id)
  VALUES (NEW.user_id);
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil de aprendizagem após criar perfil de usuário
CREATE TRIGGER on_profile_created_create_learning_profile
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_learning_profile();