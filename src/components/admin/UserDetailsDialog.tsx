import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  TrendingUp, 
  Target, 
  AlertCircle, 
  Brain, 
  Award,
  Activity,
  Calendar,
  Flame,
  Trophy,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Lightbulb
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartConfig 
} from '@/components/ui/chart';
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell
} from 'recharts';

interface UserDetailsDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDialog({ userId, open, onOpenChange }: UserDetailsDialogProps) {
  // Fetch user profile data
  const { data: user, isLoading } = useQuery({
    queryKey: ['user-details', userId],
    queryFn: async () => {
      const [profileData, rolesData, learningData] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).single(),
        supabase.from('user_roles').select('role').eq('user_id', userId),
        supabase.from('user_learning_profiles').select('*').eq('user_id', userId).maybeSingle()
      ]);

      if (profileData.error) throw profileData.error;

      return {
        ...profileData.data,
        roles: rolesData.data || [],
        profile: learningData.data || {
          level: 1,
          points: 0,
          streak_days: 0,
          total_lessons_completed: 0,
          total_quizzes_completed: 0,
          completion_rate: 0,
          average_score: 0,
          strengths: [],
          weaknesses: [],
          badges: [],
          learning_style: null,
          preferred_difficulty: 'medium'
        },
      };
    },
    enabled: open,
  });

  // Fetch AI recommendations
  const { data: recommendations } = useQuery({
    queryKey: ['user-recommendations', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  // Fetch user difficulties
  const { data: difficulties } = useQuery({
    queryKey: ['user-difficulties', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_difficulties')
        .select('*')
        .eq('user_id', userId)
        .order('error_count', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  // Fetch quiz attempts
  const { data: quizAttempts } = useQuery({
    queryKey: ['user-quiz-attempts', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  // Fetch lesson progress
  const { data: lessonProgress } = useQuery({
    queryKey: ['user-lesson-progress', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Prepare chart data
  const performanceData = quizAttempts?.slice(0, 7).reverse().map((attempt, idx) => ({
    name: `Quiz ${idx + 1}`,
    score: attempt.score || 0,
    correct: attempt.correct_answers || 0,
    incorrect: attempt.incorrect_answers || 0,
  })) || [];

  const difficultyDistribution = difficulties?.reduce((acc: any, diff) => {
    const level = diff.difficulty_level || 'medium';
    acc[level] = (acc[level] || 0) + diff.error_count;
    return acc;
  }, {}) || {};

  const pieData = Object.entries(difficultyDistribution).map(([name, value]) => ({
    name: name === 'easy' ? 'Fácil' : name === 'medium' ? 'Médio' : 'Difícil',
    value: value as number
  }));

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

  const chartConfig = {
    score: {
      label: "Pontuação",
      color: "hsl(var(--primary))",
    },
    correct: {
      label: "Corretas",
      color: "hsl(var(--chart-2))",
    },
    incorrect: {
      label: "Incorretas",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Dashboard do Usuário</DialogTitle>
          <DialogDescription>
            Análise completa de desempenho e insights de Machine Learning
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* User Header Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/70">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">{user.full_name}</h3>
                        <p className="text-muted-foreground mt-1">{user.email}</p>
                      </div>
                      <div className="flex gap-2">
                        {user.roles.some((r: any) => r.role === 'super_admin') ? (
                          <Badge variant="default" className="gap-1">
                            <Shield className="h-3 w-3" />
                            Super Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Usuário</Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Membro desde</p>
                          <p className="text-sm font-medium">
                            {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Nível</p>
                          <p className="text-sm font-bold">{user.profile.level}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Sequência</p>
                          <p className="text-sm font-bold">{user.profile.streak_days} dias</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-purple-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Pontos</p>
                          <p className="text-sm font-bold">{user.profile.points}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    Lições
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.profile.total_lessons_completed}</div>
                  <p className="text-xs text-muted-foreground mt-1">Concluídas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Quizzes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.profile.total_quizzes_completed}</div>
                  <p className="text-xs text-muted-foreground mt-1">Realizados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-500" />
                    Taxa de Conclusão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.profile.completion_rate}%</div>
                  <Progress value={user.profile.completion_rate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-500" />
                    Média de Acertos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.profile.average_score?.toFixed(1) || 0}%</div>
                  <Progress value={user.profile.average_score || 0} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Tabs for detailed analysis */}
            <Tabs defaultValue="performance" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="performance">Desempenho</TabsTrigger>
                <TabsTrigger value="ml-insights">ML Insights</TabsTrigger>
                <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
                <TabsTrigger value="activity">Atividade</TabsTrigger>
              </TabsList>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Histórico de Desempenho</CardTitle>
                      <CardDescription>Últimos 7 quizzes realizados</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {performanceData.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-64">
                          <LineChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" className="text-xs" />
                            <YAxis className="text-xs" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line 
                              type="monotone" 
                              dataKey="score" 
                              stroke="hsl(var(--primary))" 
                              strokeWidth={2}
                              dot={{ fill: "hsl(var(--primary))", r: 4 }}
                            />
                          </LineChart>
                        </ChartContainer>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-muted-foreground">
                          Nenhum dado disponível
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Respostas Corretas vs Incorretas</CardTitle>
                      <CardDescription>Comparação de acertos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {performanceData.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-64">
                          <BarChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" className="text-xs" />
                            <YAxis className="text-xs" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="correct" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="incorrect" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ChartContainer>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-muted-foreground">
                          Nenhum dado disponível
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Pontos Fortes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {user.profile.strengths?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {user.profile.strengths.map((strength: string) => (
                            <Badge key={strength} className="bg-green-500/10 text-green-700 hover:bg-green-500/20">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhum ponto forte identificado ainda</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        Áreas de Melhoria
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {user.profile.weaknesses?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {user.profile.weaknesses.map((weakness: string) => (
                            <Badge key={weakness} className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20">
                              {weakness}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhuma área de melhoria identificada</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ML Insights Tab */}
              <TabsContent value="ml-insights" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-500" />
                        Perfil de Aprendizado
                      </CardTitle>
                      <CardDescription>Análise do estilo de aprendizado</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Estilo Preferido</span>
                          <span className="font-medium">{user.profile.learning_style || 'Não definido'}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Dificuldade Preferida</span>
                          <span className="font-medium capitalize">{user.profile.preferred_difficulty}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Conquistas Desbloqueadas</p>
                        {user.profile.badges?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {user.profile.badges.map((badge: string) => (
                              <Badge key={badge} className="bg-purple-500/10 text-purple-700">
                                <Trophy className="h-3 w-3 mr-1" />
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Nenhuma conquista ainda</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Distribuição de Dificuldades</CardTitle>
                      <CardDescription>Erros por nível de dificuldade</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <ChartTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-48 flex items-center justify-center text-muted-foreground">
                          Nenhum dado de dificuldades
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Principais Dificuldades Identificadas</CardTitle>
                    <CardDescription>Tópicos que requerem mais atenção</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {difficulties && difficulties.length > 0 ? (
                      <div className="space-y-3">
                        {difficulties.slice(0, 5).map((diff) => (
                          <div key={diff.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{diff.topic}</p>
                              <p className="text-sm text-muted-foreground">{diff.category}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant={diff.resolved ? "outline" : "destructive"}>
                                {diff.error_count} erros
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {diff.difficulty_level}
                              </Badge>
                              {diff.resolved ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhuma dificuldade registrada
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Recomendações de IA
                    </CardTitle>
                    <CardDescription>Sugestões personalizadas baseadas em Machine Learning</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recommendations && recommendations.length > 0 ? (
                      <div className="space-y-3">
                        {recommendations.map((rec) => (
                          <div key={rec.id} className="p-4 border rounded-lg space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="capitalize">
                                    {rec.recommendation_type}
                                  </Badge>
                                  <Badge 
                                    variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                                  >
                                    {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'}
                                  </Badge>
                                  <Badge 
                                    variant={rec.status === 'completed' ? 'outline' : rec.status === 'accepted' ? 'default' : 'secondary'}
                                  >
                                    {rec.status === 'completed' ? 'Concluída' : rec.status === 'accepted' ? 'Aceita' : 'Pendente'}
                                  </Badge>
                                </div>
                                <p className="text-sm mt-2">{rec.reasoning}</p>
                              </div>
                              <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Criada em {format(new Date(rec.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhuma recomendação disponível ainda
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Progresso em Lições</CardTitle>
                      <CardDescription>Últimas lições acessadas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {lessonProgress && lessonProgress.length > 0 ? (
                        <div className="space-y-3">
                          {lessonProgress.slice(0, 5).map((progress) => (
                            <div key={progress.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="capitalize">
                                    {progress.status}
                                  </Badge>
                                </div>
                                <Progress value={progress.progress_percentage} className="mt-2" />
                              </div>
                              <span className="text-sm font-medium ml-2">{progress.progress_percentage}%</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          Nenhuma atividade registrada
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Histórico de Quizzes</CardTitle>
                      <CardDescription>Resultados recentes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {quizAttempts && quizAttempts.length > 0 ? (
                        <div className="space-y-3">
                          {quizAttempts.slice(0, 5).map((attempt) => (
                            <div key={attempt.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="capitalize">
                                    {attempt.quiz_type}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {attempt.correct_answers}/{attempt.correct_answers + attempt.incorrect_answers}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {attempt.time_taken ? `${Math.floor(attempt.time_taken / 60)}min` : 'N/A'}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold">{attempt.score?.toFixed(0)}%</div>
                                <div className="text-xs text-muted-foreground">+{attempt.points_earned} pts</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          Nenhum quiz realizado
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Usuário não encontrado
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
