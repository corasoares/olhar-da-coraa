-- Extensão da tabela lessons para suportar o novo sistema
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS format TEXT,
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_additional BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS knowledge_base TEXT,
ADD COLUMN IF NOT EXISTS quiz_config JSONB DEFAULT '{"questions": []}'::jsonb;

-- Atualizar constraint de format
ALTER TABLE public.lessons
DROP CONSTRAINT IF EXISTS lessons_format_check;

ALTER TABLE public.lessons
ADD CONSTRAINT lessons_format_check 
CHECK (format IN ('image', 'text', 'video', 'pdf', 'audio'));

-- Função para verificar sobreposição de datas
CREATE OR REPLACE FUNCTION public.check_lesson_date_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_additional = false AND NEW.is_active = true THEN
    IF EXISTS (
      SELECT 1 FROM public.lessons
      WHERE id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND is_active = true
      AND is_additional = false
      AND start_date IS NOT NULL
      AND end_date IS NOT NULL
      AND (NEW.start_date, NEW.end_date) OVERLAPS (start_date, end_date)
    ) THEN
      RAISE EXCEPTION 'Já existe uma lição ativa neste período. Use "Atividade Adicional" se quiser criar outra lição simultânea.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para validação de datas
DROP TRIGGER IF EXISTS validate_lesson_dates ON public.lessons;
CREATE TRIGGER validate_lesson_dates
BEFORE INSERT OR UPDATE ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.check_lesson_date_overlap();

-- Criar bucket de Storage para mídias de lições
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-media', 'lesson-media', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para o bucket lesson-media
CREATE POLICY "Super admins can upload lesson media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lesson-media' 
  AND public.has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Super admins can update lesson media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'lesson-media' 
  AND public.has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Super admins can delete lesson media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lesson-media' 
  AND public.has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Authenticated users can view lesson media"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-media' AND auth.uid() IS NOT NULL);

-- Adicionar campo ai_feedback na tabela user_lesson_progress
ALTER TABLE public.user_lesson_progress 
ADD COLUMN IF NOT EXISTS ai_feedback JSONB;