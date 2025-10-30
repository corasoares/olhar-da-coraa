import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, GripVertical, MoveUp, MoveDown } from 'lucide-react';
import { LessonQuestion, QuestionOption } from '@/types/learning';

interface QuizBuilderProps {
  questions: LessonQuestion[];
  onChange: (questions: LessonQuestion[]) => void;
}

export function QuizBuilder({ questions, onChange }: QuizBuilderProps) {
  const addQuestion = () => {
    const newQuestion: LessonQuestion = {
      id: crypto.randomUUID(),
      order: questions.length + 1,
      type: 'dissertativa',
      question: '',
    };
    onChange([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    const updated = questions.filter(q => q.id !== id).map((q, idx) => ({
      ...q,
      order: idx + 1,
    }));
    onChange(updated);
  };

  const updateQuestion = (id: string, updates: Partial<LessonQuestion>) => {
    onChange(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (swapIndex < 0 || swapIndex >= newQuestions.length) return;
    
    [newQuestions[index], newQuestions[swapIndex]] = [newQuestions[swapIndex], newQuestions[index]];
    
    const reordered = newQuestions.map((q, idx) => ({ ...q, order: idx + 1 }));
    onChange(reordered);
  };

  const updateOption = (questionId: string, optionId: string, text: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || !question.options) return;

    const updatedOptions = question.options.map(opt => 
      opt.id === optionId ? { ...opt, text } : opt
    );
    updateQuestion(questionId, { options: updatedOptions });
  };

  const setCorrectOption = (questionId: string, optionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || !question.options) return;

    const updatedOptions = question.options.map(opt => ({
      ...opt,
      is_correct: opt.id === optionId,
    }));
    updateQuestion(questionId, { options: updatedOptions });
  };

  const changeQuestionType = (questionId: string, type: 'dissertativa' | 'multipla_escolha') => {
    const updates: Partial<LessonQuestion> = { type };
    
    if (type === 'multipla_escolha') {
      updates.options = [
        { id: 'a', text: '', is_correct: false },
        { id: 'b', text: '', is_correct: false },
        { id: 'c', text: '', is_correct: false },
        { id: 'd', text: '', is_correct: false },
        { id: 'e', text: '', is_correct: false },
      ];
    } else {
      updates.options = undefined;
    }
    
    updateQuestion(questionId, updates);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Perguntas do Quiz</h3>
        <Button onClick={addQuestion} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Pergunta
        </Button>
      </div>

      {questions.length === 0 && (
        <p className="text-muted-foreground text-sm text-center py-8">
          Nenhuma pergunta adicionada ainda. Clique em "Adicionar Pergunta" para começar.
        </p>
      )}

      {questions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-2">
              <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
              <CardTitle className="text-base">Pergunta {question.order}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => moveQuestion(index, 'up')}
                disabled={index === 0}
              >
                <MoveUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => moveQuestion(index, 'down')}
                disabled={index === questions.length - 1}
              >
                <MoveDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeQuestion(question.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Pergunta</Label>
              <Textarea
                value={question.question}
                onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                placeholder="Digite a pergunta..."
                rows={3}
              />
            </div>

            <div>
              <Label>Tipo de Pergunta</Label>
              <Select
                value={question.type}
                onValueChange={(value: 'dissertativa' | 'multipla_escolha') => 
                  changeQuestionType(question.id, value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dissertativa">Dissertativa</SelectItem>
                  <SelectItem value="multipla_escolha">Múltipla Escolha</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {question.type === 'dissertativa' && (
              <div className="bg-muted/50 p-4 rounded-md">
                <p className="text-sm text-muted-foreground">
                  O usuário responderá com texto livre. A IA avaliará baseada na Base de Conhecimento.
                </p>
              </div>
            )}

            {question.type === 'multipla_escolha' && question.options && (
              <div className="space-y-3">
                <Label>Alternativas (selecione a correta)</Label>
                {question.options.map((option) => (
                  <div key={option.id} className="flex items-center gap-3">
                    <Checkbox
                      checked={option.is_correct}
                      onCheckedChange={() => setCorrectOption(question.id, option.id)}
                    />
                    <Label className="min-w-[20px]">{option.id})</Label>
                    <Input
                      value={option.text}
                      onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                      placeholder={`Alternativa ${option.id.toUpperCase()}`}
                      className="flex-1"
                    />
                  </div>
                ))}
                {!question.options.some(o => o.is_correct) && (
                  <p className="text-sm text-destructive">
                    ⚠️ Selecione a alternativa correta
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
