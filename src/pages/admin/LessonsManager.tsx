import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Eye, Copy, Trash2, Calendar } from 'lucide-react';
import { Lesson } from '@/types/learning';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function LessonsManager() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const { data: lessons, isLoading, refetch } = useQuery({
    queryKey: ['admin-lessons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });

  const getStatusBadge = (lesson: Lesson) => {
    if (!lesson.start_date || !lesson.end_date) {
      return <Badge variant="secondary">Rascunho</Badge>;
    }

    const now = new Date();
    const start = new Date(lesson.start_date);
    const end = new Date(lesson.end_date);

    if (!lesson.is_active) return <Badge variant="secondary">Rascunho</Badge>;
    if (now < start) return <Badge variant="outline">Futura</Badge>;
    if (now > end) return <Badge>Encerrada</Badge>;
    return <Badge className="bg-green-500">Ativa</Badge>;
  };

  const filterLessons = (lessons: Lesson[] | undefined) => {
    if (!lessons) return [];
    const now = new Date();

    switch (activeTab) {
      case 'active':
        return lessons.filter(l => 
          l.is_active && 
          l.start_date && l.end_date &&
          new Date(l.start_date) <= now && 
          new Date(l.end_date) >= now
        );
      case 'future':
        return lessons.filter(l => 
          l.is_active && 
          l.start_date && 
          new Date(l.start_date) > now
        );
      case 'draft':
        return lessons.filter(l => !l.is_active || !l.start_date || !l.end_date);
      default:
        return lessons;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta lição?')) return;

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir lição');
      return;
    }

    toast.success('Lição excluída com sucesso');
    refetch();
  };

  const filteredLessons = filterLessons(lessons);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Gerenciar Lições</h1>
                <p className="text-muted-foreground mt-1">
                  Crie e gerencie lições semanais de Olhar de Moda
                </p>
              </div>
              <Button onClick={() => navigate('/admin/lessons/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Lição
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="active">Ativas</TabsTrigger>
                <TabsTrigger value="future">Futuras</TabsTrigger>
                <TabsTrigger value="draft">Rascunhos</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4 mt-6">
                {isLoading ? (
                  <p>Carregando...</p>
                ) : filteredLessons.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">Nenhuma lição encontrada</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {filteredLessons.map((lesson) => (
                      <Card key={lesson.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle>{lesson.title}</CardTitle>
                                {getStatusBadge(lesson)}
                                {lesson.is_additional && (
                                  <Badge variant="outline">Adicional</Badge>
                                )}
                              </div>
                              {lesson.description && (
                                <CardDescription>{lesson.description}</CardDescription>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {lesson.start_date && lesson.end_date && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {format(new Date(lesson.start_date), 'dd/MM/yy', { locale: ptBR })} - {format(new Date(lesson.end_date), 'dd/MM/yy', { locale: ptBR })}
                                  </span>
                                </div>
                              )}
                              <Badge variant="outline">{lesson.format || 'N/A'}</Badge>
                              <span>{lesson.quiz_config?.questions?.length || 0} perguntas</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/lesson/${lesson.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/admin/lessons/${lesson.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(lesson.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
