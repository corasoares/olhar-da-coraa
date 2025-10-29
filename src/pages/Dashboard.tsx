import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { MemberSidebar } from '@/components/MemberSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useLearningProfile } from '@/hooks/useLearningProfile';
import { Sparkles, TrendingUp, Award, Zap } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const Dashboard = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useLearningProfile(user?.id);

  useEffect(() => {
    if (userRole === 'super_admin') {
      navigate('/super-admin', { replace: true });
    }
  }, [userRole, navigate]);

  const getLevelProgress = () => {
    if (!profile) return 0;
    const pointsForCurrentLevel = (profile.level - 1) * 1000;
    const pointsInCurrentLevel = profile.points - pointsForCurrentLevel;
    const pointsNeededForNextLevel = 1000;
    return (pointsInCurrentLevel / pointsNeededForNextLevel) * 100;
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <MemberSidebar />
        <div className="flex-1">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </div>
          </header>

          <main className="p-6">
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                Olá, {user?.email?.split('@')[0]}!
              </h1>
              <p className="text-muted-foreground mt-2">
                Bem-vinda ao Olhar de Moda
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Nível</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{profile?.level || 1}</div>
                  <Progress value={getLevelProgress()} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {Math.round(getLevelProgress())}% para o próximo nível
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pontos</CardTitle>
                  <Zap className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{profile?.points || 0}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Total acumulado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Sequência</CardTitle>
                  <Award className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{profile?.streak_days || 0}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    dias consecutivos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pontuação Média</CardTitle>
                  <Sparkles className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{profile?.average_score.toFixed(1) || 0}%</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    em quizzes
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Próximas Atividades</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Comece sua primeira lição</h4>
                      <p className="text-sm text-muted-foreground">Explore nossa biblioteca de conteúdo</p>
                    </div>
                    <Badge>Novo</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                    <div>
                      <h4 className="font-medium">Quiz Adaptativo</h4>
                      <p className="text-sm text-muted-foreground">Complete uma lição primeiro</p>
                    </div>
                    <Badge variant="outline">Bloqueado</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recomendações Personalizadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    A IA analisará seu desempenho para criar recomendações personalizadas após seus primeiros quizzes.
                  </p>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Complete atividades para desbloquear recomendações de IA
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
