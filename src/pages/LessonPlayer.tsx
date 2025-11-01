import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { MemberSidebar } from '@/components/MemberSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLessonSubmission } from '@/hooks/useLessonSubmission';
import { FormatRenderer } from '@/components/lessons/FormatRenderer';
import { Loader2, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Lesson } from '@/types/learning';

const LessonPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeElapsed, setTimeElapsed] = useState(0);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const {
    answers,
    setAnswer,
    isAllAnswered,
    submitResponses,
    isSubmitting,
  } = useLessonSubmission(id || '', user?.id || '');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    const quizConfig = lesson?.quiz_config as any;
    if (!quizConfig?.questions) return;

    if (!isAllAnswered(quizConfig.questions.length)) {
      toast.error('Por favor, responda todas as questões antes de enviar.');
      return;
    }

    try {
      const result = await submitResponses();
      toast.success('Respostas enviadas com sucesso!');
      navigate(`/lesson/${id}/results`, { state: { result } });
    } catch (error) {
      console.error('Error submitting lesson:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Lição não encontrada</h2>
          <Button onClick={() => navigate('/lessons')}>Voltar para Lições</Button>
        </div>
      </div>
    );
  }

  const quizConfig = lesson.quiz_config as any;
  const questions = quizConfig?.questions || [];
  const progress = (Object.keys(answers).length / questions.length) * 100;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <MemberSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {lesson.title}
                </h1>
                <p className="text-muted-foreground mt-1">{lesson.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span className="font-mono">{formatTime(timeElapsed)}</span>
                </div>
                <SidebarTrigger />
              </div>
            </div>

            {/* Progress */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium">
                      {Object.keys(answers).length} / {questions.length} questões
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            {lesson.format && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Conteúdo da Lição</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormatRenderer lesson={lesson as unknown as Lesson} />
                </CardContent>
              </Card>
            )}

            {/* Quiz */}
            {questions.length > 0 && (
              <div className="space-y-6 mb-8">
                <h2 className="text-2xl font-bold">Questões</h2>
                {questions.map((question: any, index: number) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Questão {index + 1}
                      </CardTitle>
                      <CardDescription>{question.question}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {question.type === 'multiple_choice' ? (
                        <RadioGroup
                          value={answers[question.id] || ''}
                          onValueChange={(value) => setAnswer(question.id, value)}
                        >
                          {question.options?.map((option: any, optIndex: number) => (
                            <div key={optIndex} className="flex items-center space-x-2 mb-3">
                              <RadioGroupItem value={option.text} id={`q${question.id}-${optIndex}`} />
                              <Label htmlFor={`q${question.id}-${optIndex}`} className="cursor-pointer">
                                {option.text}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      ) : (
                        <Textarea
                          placeholder="Digite sua resposta aqui..."
                          value={answers[question.id] || ''}
                          onChange={(e) => setAnswer(question.id, e.target.value)}
                          className="min-h-[120px]"
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => navigate('/lessons')}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !isAllAnswered(questions.length)}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando respostas...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Enviar Respostas
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default LessonPlayer;
