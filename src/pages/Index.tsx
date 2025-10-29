import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  useEffect(() => {
    if (user && userRole) {
      // Only redirect once we have both user AND role loaded
      if (userRole === 'super_admin') {
        navigate('/super-admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, userRole, navigate]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-hero)' }}>
      <nav className="border-b border-border/40 backdrop-blur-sm bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] bg-clip-text text-transparent">
              Olhar de Moda
            </span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/auth')}>
              Login
            </Button>
            <Button onClick={() => navigate('/auth')} className="gap-2">
              Começar Agora
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Educação em Moda com Inteligência Artificial
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--primary-glow))] to-[hsl(var(--accent))] bg-clip-text text-transparent leading-tight">
            Transforme seu conhecimento em moda
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Plataforma educacional personalizada com análise de IA, planos de estudos adaptados e quizzes inteligentes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="text-lg px-8 py-6 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-all duration-300"
            >
              Criar Conta Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/auth')}
              className="text-lg px-8 py-6"
            >
              Já tenho conta
            </Button>
          </div>
        </div>

        <div className="mt-32 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              title: 'Análise com IA',
              description: 'Machine Learning detecta suas dificuldades e personaliza o aprendizado',
            },
            {
              title: 'Planos Personalizados',
              description: 'Estude no seu ritmo com conteúdo adaptado ao seu nível',
            },
            {
              title: 'Quizzes Inteligentes',
              description: 'Avaliações que evoluem com você e reforçam conceitos',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg bg-card border border-border shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-border/40 mt-32 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Olhar de Moda. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
