import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { MemberSidebar } from '@/components/MemberSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, XCircle, Sparkles, ArrowLeft, Trophy } from 'lucide-react';

const LessonResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result;

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Resultado não encontrado</h2>
          <Button onClick={() => navigate('/lessons')}>Voltar para Lições</Button>
        </div>
      </div>
    );
  }

  const { score, total_points, feedback, points_earned } = result;
  const percentage = (score / 100) * 100;

  const getScoreBadge = () => {
    if (percentage >= 90) return { label: 'Excelente!', variant: 'default' as const, icon: '🏆' };
    if (percentage >= 70) return { label: 'Muito Bom!', variant: 'secondary' as const, icon: '⭐' };
    if (percentage >= 50) return { label: 'Bom!', variant: 'outline' as const, icon: '👍' };
    return { label: 'Continue Praticando', variant: 'outline' as const, icon: '💪' };
  };

  const badge = getScoreBadge();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <MemberSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Button variant="ghost" onClick={() => navigate('/lessons')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Lições
              </Button>
              <SidebarTrigger />
            </div>

            {/* Score Card */}
            <Card className="mb-8 border-2 border-primary/20">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Trophy className="h-16 w-16 text-primary" />
                </div>
                <CardTitle className="text-3xl">
                  Parabéns! Você completou a lição
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Confira seu desempenho abaixo
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                  <div>
                    <div className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      {score.toFixed(0)}%
                    </div>
                    <p className="text-muted-foreground mt-2">Pontuação</p>
                  </div>
                  <div>
                    <div className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      {points_earned || 0}
                    </div>
                    <p className="text-muted-foreground mt-2">Pontos Ganhos</p>
                  </div>
                </div>
                <div className="mt-6">
                  <Badge variant={badge.variant} className="text-lg px-4 py-2">
                    {badge.icon} {badge.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Question Feedback */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Detalhes das Respostas</CardTitle>
                <CardDescription>
                  Veja o feedback detalhado para cada questão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {feedback?.map((item: any, index: number) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          {item.is_correct ? (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="font-medium">Questão {index + 1}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {item.question}
                            </div>
                          </div>
                          <Badge variant={item.is_correct ? 'default' : 'secondary'}>
                            {item.points_earned || 0} / {item.max_points || 0} pts
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Pergunta:
                            </p>
                            <p className="text-base">{item.question}</p>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Sua Resposta:
                            </p>
                            <p className="text-base bg-muted p-3 rounded-lg">
                              {item.user_answer}
                            </p>
                          </div>

                          {!item.is_correct && item.correct_answer && (
                            <div>
                              <p className="text-sm font-medium text-green-600 mb-1">
                                Resposta Correta:
                              </p>
                              <p className="text-base bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                                {item.correct_answer}
                              </p>
                            </div>
                          )}

                          {item.feedback && (
                            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                              <div className="flex items-start gap-2">
                                <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-primary mb-1">
                                    Feedback da IA
                                  </p>
                                  <p className="text-sm leading-relaxed">{item.feedback}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Recomendações Personalizadas
                  </CardTitle>
                  <CardDescription>
                    Com base no seu desempenho, sugerimos:
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="mt-8 flex justify-center">
              <Button size="lg" onClick={() => navigate('/lessons')}>
                Voltar para Lições
              </Button>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default LessonResults;
