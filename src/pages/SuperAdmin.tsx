import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Users, Settings, BarChart3 } from 'lucide-react';

const SuperAdmin = () => {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex-1">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold">Painel de Administração</h1>
            </div>
          </header>

          <main className="p-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] bg-clip-text text-transparent">
                Dashboard do Super Admin
              </h2>
              <p className="text-muted-foreground mt-2">
                Bem-vindo, {user?.email}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Usuários
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Dados serão configurados em breve
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Planos Ativos
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    Sistema de planos em desenvolvimento
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Configurações
                  </CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">✓</div>
                  <p className="text-xs text-muted-foreground">
                    Sistema configurado
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Próximos Passos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>• Configurar sistema de planos e preços</p>
                  <p>• Integrar gateway de pagamento</p>
                  <p>• Configurar integrações de terceiros</p>
                  <p>• Desenvolver dashboards de métricas</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SuperAdmin;
