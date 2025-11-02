import { useState } from 'react';
import { LessonQuestion } from '@/types/learning';
import { Topic } from '@/types/topics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, GripVertical, MoveUp, MoveDown, Sparkles } from 'lucide-react';
import { useSuggestDifficulty } from '@/hooks/useSuggestDifficulty';
import { toast } from 'sonner';

interface QuizBuilderProps {
  questions: LessonQuestion[];
  onChange: (questions: LessonQuestion[]) => void;
  lessonTopics: Topic[];
}

export function QuizBuilder({ questions, onChange, lessonTopics }: QuizBuilderProps) {
  const { suggestDifficulty, isLoading: isSuggesting } = useSuggestDifficulty();

  const addQuestion = () => {
    if (lessonTopics.length === 0) {
      toast.error('Adicione pelo menos um assunto à lição antes de criar perguntas');
      return;
    }
    
    const newQuestion: LessonQuestion = {
      id: crypto.randomUUID(),
      question: '',
      type: 'dissertativa',
      order: questions.length + 1,
      topic_id: lessonTopics[0].id, // Default to first topic
      difficulty: 2, // Default to level 2
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

  const updateQuestion = (id: string, field: string, value: any) => {
    onChange(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (swapIndex < 0 || swapIndex >= newQuestions.length) return;
    
    [newQuestions[index], newQuestions[swapIndex]] = [newQuestions[swapIndex], newQuestions[index]];
    
    const reordered = newQuestions.map((q, idx) => ({ ...q, order: idx + 1 }));
    onChange(reordered);
  };

  const updateOption = (questionId: string, optionIndex: number, text: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question?.options) return;

    const updatedOptions = question.options.map((opt, idx) => 
      idx === optionIndex ? { ...opt, text } : opt
    );
    updateQuestion(questionId, 'options', updatedOptions);
  };

  const setCorrectOption = (questionId: string, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (!question?.options) return;

    const updatedOptions = question.options.map((opt, idx) => ({
      ...opt,
      is_correct: idx === optionIndex,
    }));
    updateQuestion(questionId, 'options', updatedOptions);
  };

  const changeQuestionType = (id: string, newType: 'dissertativa' | 'multipla_escolha') => {
    const question = questions.find(q => q.id === id);
    if (!question) return;

    if (newType === 'multipla_escolha' && !question.options) {
      updateQuestion(id, 'type', newType);
      updateQuestion(id, 'options', [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ]);
    } else {
      updateQuestion(id, 'type', newType);
      if (newType === 'dissertativa') {
        updateQuestion(id, 'options', undefined);
      }
    }
  };

  const handleSuggestDifficulty = async (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    if (!question.question.trim()) {
      toast.error('Digite a pergunta antes de solicitar sugestão');
      return;
    }

    if (!question.topic_id) {
      toast.error('Selecione um assunto antes de solicitar sugestão');
      return;
    }

    const topic = lessonTopics.find(t => t.id === question.topic_id);
    if (!topic) return;

    const suggestedDifficulty = await suggestDifficulty(
      question.question,
      question.type,
      topic.name,
      question.options
    );

    if (suggestedDifficulty) {
      updateQuestion(questionId, 'difficulty', suggestedDifficulty);
    }
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

      <div className="space-y-4">
        {questions.map((question, index) => {
          const selectedTopic = lessonTopics.find(t => t.id === question.topic_id);
          const hasValidation = !question.topic_id || !question.difficulty;
          
          return (
            <Card key={question.id} className={`${hasValidation ? 'border-destructive' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <CardTitle className="text-base">Pergunta {question.order}</CardTitle>
                  {selectedTopic && (
                    <Badge style={{ backgroundColor: selectedTopic.color }} className="text-white">
                      {selectedTopic.name}
                    </Badge>
                  )}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`topic-${question.id}`}>Assunto *</Label>
                    <Select
                      value={question.topic_id || ''}
                      onValueChange={(value) => updateQuestion(question.id, 'topic_id', value)}
                    >
                      <SelectTrigger id={`topic-${question.id}`} className={!question.topic_id ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Selecione o assunto" />
                      </SelectTrigger>
                      <SelectContent>
                        {lessonTopics.map(topic => (
                          <SelectItem key={topic.id} value={topic.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: topic.color }} />
                              {topic.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Dificuldade *</Label>
                    <RadioGroup
                      value={question.difficulty?.toString() || ''}
                      onValueChange={(value) => updateQuestion(question.id, 'difficulty', parseInt(value))}
                      className="flex gap-4 mt-2"
                    >
                      {[1, 2, 3, 4].map(level => (
                        <div key={level} className="flex items-center space-x-2">
                          <RadioGroupItem value={level.toString()} id={`diff-${question.id}-${level}`} />
                          <Label htmlFor={`diff-${question.id}-${level}`} className="cursor-pointer">
                            {'⭐'.repeat(level)}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => handleSuggestDifficulty(question.id)}
                      disabled={isSuggesting || !question.question.trim() || !question.topic_id}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {isSuggesting ? 'Analisando...' : 'Sugerir com IA'}
                    </Button>
                  </div>
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

                <div>
                  <Label>Pergunta</Label>
                  <Textarea
                    value={question.question}
                    onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                    placeholder="Digite a pergunta..."
                    rows={3}
                  />
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
                    <Label>Alternativas (marque a correta)</Label>
                    {question.options.map((option, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-3">
                        <Checkbox
                          checked={option.is_correct}
                          onCheckedChange={() => setCorrectOption(question.id, optIdx)}
                        />
                        <Input
                          value={option.text}
                          onChange={(e) => updateOption(question.id, optIdx, e.target.value)}
                          placeholder={`Alternativa ${String.fromCharCode(65 + optIdx)}`}
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
          );
        })}
      </div>
    </div>
  );
}
