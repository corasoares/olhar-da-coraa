-- Create topics table
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT CHECK (category IN ('período', 'técnica', 'estilista', 'movimento', 'outro')),
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  icon TEXT NOT NULL DEFAULT 'tag',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for topics
CREATE POLICY "Authenticated users can view topics"
  ON topics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage topics"
  ON topics FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Alter lessons table: remove default first, then change type
ALTER TABLE lessons 
  ALTER COLUMN topics DROP DEFAULT,
  ALTER COLUMN topics TYPE UUID[] USING ARRAY[]::UUID[];

-- Add topic_id to user_difficulties
ALTER TABLE user_difficulties
  ADD COLUMN topic_id UUID REFERENCES topics(id);

-- Update user_learning_profiles: change strengths and weaknesses to UUID[]
ALTER TABLE user_learning_profiles
  ALTER COLUMN strengths DROP DEFAULT,
  ALTER COLUMN strengths TYPE UUID[] USING ARRAY[]::UUID[],
  ALTER COLUMN weaknesses DROP DEFAULT,
  ALTER COLUMN weaknesses TYPE UUID[] USING ARRAY[]::UUID[];

-- Insert default topics for testing
INSERT INTO topics (name, slug, category, description, color, icon) VALUES
  ('Renascimento', 'renascimento', 'período', 'Período artístico europeu (séc. XIV-XVII)', '#10B981', 'palette'),
  ('Barroco', 'barroco', 'período', 'Estilo artístico exuberante (séc. XVII-XVIII)', '#8B5CF6', 'sparkles'),
  ('Anos 20', 'anos-20', 'período', 'Década de 1920 - Era do Jazz', '#F59E0B', 'music'),
  ('Alta Costura', 'alta-costura', 'técnica', 'Haute Couture - moda de luxo sob medida', '#EC4899', 'scissors'),
  ('Chanel', 'chanel', 'estilista', 'Gabrielle "Coco" Chanel', '#000000', 'star'),
  ('Art Deco', 'art-deco', 'movimento', 'Estilo decorativo geométrico (1920-1940)', '#06B6D4', 'hexagon')
ON CONFLICT (slug) DO NOTHING;