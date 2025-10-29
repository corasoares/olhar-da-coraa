import { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { MemberSidebar } from '@/components/MemberSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Brain, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Quizzes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAdaptiveQuiz = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-adaptive-quiz', {
        body: {
          topics: ['moda em geral'],
          difficulty: 'medium',
          questionCount: 5
        }
      });

      if (error) throw error;

      toast({
        title: 'Quiz Personalizado Criado!',
        description: 'Seu quiz foi gerado com base nas suas dificuldades.',
      });
      
      // TODO: Navigate to quiz player with generated quiz
      console.log('Generated quiz:', data);
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o quiz. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <MemberSidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Quizzes Inteligentes
              </h1>
              <p className="text-muted-foreground mt-2">
                Teste seu conhecimento com quizzes personalizados por IA
              </p>
            </div>
            <SidebarTrigger />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-purple-500/5">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle>Quiz Adaptativo</CardTitle>
                </div>
                <CardDescription>
                  IA cria perguntas baseadas nas suas dificuldades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleGenerateAdaptiveQuiz}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? 'Gerando...' : 'Gerar Quiz Personalizado'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <CardTitle>Quiz Rápido</CardTitle>
                </div>
                <CardDescription>
                  5 perguntas sobre tópicos aleatórios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Iniciar Quiz Rápido
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle>Desafio Semanal</CardTitle>
                </div>
                <CardDescription>
                  Compete com outros estudantes de moda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  Ver Desafio
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Quizzes</CardTitle>
              <CardDescription>Seus últimos resultados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Nenhum quiz realizado ainda. Comece agora!
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Quizzes;
