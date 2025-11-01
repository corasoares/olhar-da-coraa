import { useState } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useTopics } from '@/hooks/useTopics';
import { Topic } from '@/types/topics';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TopicForm } from '@/components/admin/TopicForm';

export default function TopicsManager() {
  const { data: topics, isLoading, refetch } = useTopics();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredTopics = topics?.filter(topic =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este assunto?')) return;

    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir assunto');
      return;
    }

    toast.success('Assunto excluído com sucesso');
    refetch();
  };

  const handleEdit = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setSelectedTopic(null);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedTopic(null);
    refetch();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Gestão de Assuntos</h1>
              <p className="text-muted-foreground mt-2">
                Gerencie os assuntos abordados nas lições
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Assunto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedTopic ? 'Editar Assunto' : 'Novo Assunto'}
                  </DialogTitle>
                </DialogHeader>
                <TopicForm topic={selectedTopic} onSuccess={handleSuccess} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar assuntos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando assuntos...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTopics?.map((topic) => (
                <Card key={topic.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: topic.color }}
                      >
                        {topic.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{topic.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {topic.description || 'Sem descrição'}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{topic.category || 'outro'}</Badge>
                          <Badge variant="secondary">{topic.slug}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(topic)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(topic.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {filteredTopics?.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhum assunto encontrado</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
