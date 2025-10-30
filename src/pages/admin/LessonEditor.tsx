import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { QuizBuilder } from '@/components/admin/QuizBuilder';
import { Lesson, LessonQuestion, QuizConfig } from '@/types/learning';
import { toast } from 'sonner';
import { ArrowLeft, Save, Send } from 'lucide-react';

export default function LessonEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [isAdditional, setIsAdditional] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState<'image' | 'text' | 'video' | 'pdf' | 'audio'>('text');
  const [mediaUrl, setMediaUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [questions, setQuestions] = useState<LessonQuestion[]>([]);
  const [pointsReward, setPointsReward] = useState(100);
  const [estimatedDuration, setEstimatedDuration] = useState(30);

  useEffect(() => {
    if (isEditing) {
      loadLesson();
    }
  }, [id]);

  const loadLesson = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast.error('Erro ao carregar lição');
      return;
    }

    const lesson = data as any;
    setTitle(lesson.title);
    setDescription(lesson.description || '');
    setTopics(lesson.topics || []);
    setIsAdditional(lesson.is_additional || false);
    setStartDate(lesson.start_date || '');
    setEndDate(lesson.end_date || '');
    setFormat(lesson.format || 'text');
    setMediaUrl(lesson.media_url || '');
    setYoutubeUrl(lesson.youtube_url || '');
    setTextContent(lesson.content || '');
    setKnowledgeBase(lesson.knowledge_base || '');
    setQuestions(lesson.quiz_config?.questions || []);
    setPointsReward(lesson.points_reward || 100);
    setEstimatedDuration(lesson.estimated_duration || 30);
  };

  const validate = () => {
    if (!title.trim()) {
      toast.error('Título é obrigatório');
      return false;
    }
    if (!startDate || !endDate) {
      toast.error('Período é obrigatório');
      return false;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error('Data final deve ser posterior à data inicial');
      return false;
    }
    if (format === 'text' && !textContent.trim()) {
      toast.error('Conteúdo de texto é obrigatório');
      return false;
    }
    if ((format === 'image' || format === 'pdf' || format === 'audio') && !mediaUrl) {
      toast.error('Upload de mídia é obrigatório');
      return false;
    }
    if (format === 'video' && !mediaUrl && !youtubeUrl) {
      toast.error('Upload de vídeo ou link do YouTube é obrigatório');
      return false;
    }
    if (!knowledgeBase.trim()) {
      toast.error('Base de Conhecimento é obrigatória');
      return false;
    }
    if (questions.length === 0) {
      toast.error('Adicione pelo menos uma pergunta');
      return false;
    }

    for (const q of questions) {
      if (!q.question.trim()) {
        toast.error('Todas as perguntas devem ter texto');
        return false;
      }
      if (q.type === 'multipla_escolha') {
        const hasCorrect = q.options?.some(o => o.is_correct);
        if (!hasCorrect) {
          toast.error('Cada pergunta de múltipla escolha precisa de uma resposta correta');
          return false;
        }
        const allFilled = q.options?.every(o => o.text.trim());
        if (!allFilled) {
          toast.error('Todas as alternativas devem ser preenchidas');
          return false;
        }
      }
    }

    return true;
  };

  const handleSave = async (publish: boolean) => {
    if (!validate()) return;

    setLoading(true);
    try {
      const quizConfig: QuizConfig = { questions };

      const lessonData: any = {
        title,
        description,
        topics,
        is_additional: isAdditional,
        start_date: startDate,
        end_date: endDate,
        format,
        media_url: format !== 'text' && format !== 'video' ? mediaUrl : null,
        youtube_url: format === 'video' ? youtubeUrl || null : null,
        content: format === 'text' ? textContent : null,
        knowledge_base: knowledgeBase,
        quiz_config: quizConfig,
        points_reward: pointsReward,
        estimated_duration: estimatedDuration,
        is_active: publish,
        lesson_type: 'quiz',
        difficulty: 'medium',
      };

      if (isEditing) {
        const { error } = await supabase
          .from('lessons')
          .update(lessonData)
          .eq('id', id);

        if (error) throw error;
        toast.success(publish ? 'Lição publicada!' : 'Lição salva como rascunho');
      } else {
        const { error } = await supabase
          .from('lessons')
          .insert(lessonData);

        if (error) throw error;
        toast.success(publish ? 'Lição publicada!' : 'Lição salva como rascunho');
      }

      navigate('/admin/lessons');
    } catch (error: any) {
      console.error('Error saving lesson:', error);
      if (error.message.includes('Já existe uma lição ativa')) {
        toast.error('Já existe uma lição ativa neste período. Use "Atividade Adicional" ou escolha outro período.');
      } else {
        toast.error('Erro ao salvar lição');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin/lessons')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">
                  {isEditing ? 'Editar Lição' : 'Nova Lição'}
                </h1>
                <p className="text-muted-foreground">
                  Preencha todos os campos para criar uma lição completa
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título da Lição *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Análise da Silhueta dos Anos 20"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva brevemente o conteúdo da lição..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is-additional"
                    checked={isAdditional}
                    onCheckedChange={(checked) => setIsAdditional(checked as boolean)}
                  />
                  <Label htmlFor="is-additional">É Atividade Adicional?</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Período</CardTitle>
                <CardDescription>
                  Defina quando esta lição estará disponível
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Data Inicial *</Label>
                  <Input
                    id="start-date"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">Data Final *</Label>
                  <Input
                    id="end-date"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Formato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="format">Tipo de Conteúdo *</Label>
                  <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                    <SelectTrigger id="format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Imagem</SelectItem>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="audio">Áudio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {format === 'text' && (
                  <div>
                    <Label htmlFor="text-content">Conteúdo de Texto *</Label>
                    <Textarea
                      id="text-content"
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Escreva o conteúdo da lição aqui..."
                      rows={10}
                    />
                  </div>
                )}

                {format === 'video' && (
                  <div>
                    <Label htmlFor="youtube-url">Link do YouTube (opcional)</Label>
                    <Input
                      id="youtube-url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Ou faça upload do vídeo abaixo
                    </p>
                  </div>
                )}

                {format !== 'text' && (
                  <MediaUploader
                    format={format}
                    onUploadComplete={setMediaUrl}
                    currentUrl={mediaUrl}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Base de Conhecimento</CardTitle>
                <CardDescription>
                  Esta base será usada pela IA para avaliar as respostas dissertativas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={knowledgeBase}
                  onChange={(e) => setKnowledgeBase(e.target.value)}
                  placeholder="Descreva detalhadamente os conceitos, contextos históricos e critérios de avaliação..."
                  rows={8}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="points">Pontos de Recompensa</Label>
                  <Input
                    id="points"
                    type="number"
                    value={pointsReward}
                    onChange={(e) => setPointsReward(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duração Estimada (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quiz</CardTitle>
                <CardDescription>
                  Crie as perguntas que os usuários responderão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuizBuilder questions={questions} onChange={setQuestions} />
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-end">
              <Button variant="outline" onClick={() => navigate('/admin/lessons')}>
                Cancelar
              </Button>
              <Button variant="secondary" onClick={() => handleSave(false)} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Rascunho
              </Button>
              <Button onClick={() => handleSave(true)} disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                Publicar Lição
              </Button>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
