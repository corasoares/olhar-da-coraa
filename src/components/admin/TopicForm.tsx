import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Topic } from '@/types/topics';

interface TopicFormProps {
  topic: Topic | null;
  onSuccess: () => void;
}

export function TopicForm({ topic, onSuccess }: TopicFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'outro' as 'período' | 'técnica' | 'estilista' | 'movimento' | 'outro',
    description: '',
    color: '#3B82F6',
    icon: 'tag',
  });

  useEffect(() => {
    if (topic) {
      setFormData({
        name: topic.name,
        slug: topic.slug,
        category: topic.category,
        description: topic.description || '',
        color: topic.color,
        icon: topic.icon,
      });
    }
  }, [topic]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (topic) {
        const { error } = await supabase
          .from('topics')
          .update(formData)
          .eq('id', topic.id);

        if (error) throw error;
        toast.success('Assunto atualizado com sucesso');
      } else {
        const { error } = await supabase
          .from('topics')
          .insert([formData]);

        if (error) throw error;
        toast.success('Assunto criado com sucesso');
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar assunto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Assunto *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          placeholder="Ex: Renascimento, Barroco, Alta Costura..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (gerado automaticamente)</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
          required
          placeholder="renascimento"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria *</Label>
        <Select
          value={formData.category}
          onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="período">Período</SelectItem>
            <SelectItem value="técnica">Técnica</SelectItem>
            <SelectItem value="estilista">Estilista</SelectItem>
            <SelectItem value="movimento">Movimento</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Breve descrição do assunto..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="color">Cor</Label>
          <div className="flex gap-2">
            <Input
              id="color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="w-20 h-10 p-1"
            />
            <Input
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              placeholder="#3B82F6"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="icon">Ícone (Lucide)</Label>
          <Input
            id="icon"
            value={formData.icon}
            onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
            placeholder="tag"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : topic ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}
