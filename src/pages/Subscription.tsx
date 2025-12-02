import { SidebarProvider } from '@/components/ui/sidebar';
import { MemberSidebar } from '@/components/MemberSidebar';
import { useSubscription, useSubscriptionPlans } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  AlertTriangle,
  Check,
  Clock,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Subscription = () => {
  const { 
    subscription, 
    transactions, 
    isPremium, 
    isTrialing, 
    daysRemaining, 
    isLoading,
    cancelSubscription 
  } = useSubscription();
  const { data: plans } = useSubscriptionPlans();
  const navigate = useNavigate();

  const formatCurrency = (value: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { label: 'Ativa', variant: 'default' },
      trialing: { label: 'Período de Teste', variant: 'secondary' },
      pending: { label: 'Pendente', variant: 'outline' },
      cancelled: { label: 'Cancelada', variant: 'destructive' },
      past_due: { label: 'Pagamento Atrasado', variant: 'destructive' },
    };
    const config = statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTransactionStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      approved: { label: 'Aprovado', variant: 'default' },
      pending: { label: 'Pendente', variant: 'outline' },
      rejected: { label: 'Rejeitado', variant: 'destructive' },
      refunded: { label: 'Reembolsado', variant: 'secondary' },
    };
    const config = statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <MemberSidebar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <MemberSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Minha Assinatura</h1>
              <p className="text-muted-foreground">Gerencie sua assinatura e histórico de pagamentos</p>
            </div>

            {/* Current Plan */}
            {subscription ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Crown className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {subscription.plan?.name || 'Plano'}
                          {getStatusBadge(subscription.status)}
                        </CardTitle>
                        <CardDescription>
                          {subscription.billing_cycle === 'yearly' ? 'Cobrança Anual' : 'Cobrança Mensal'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {formatCurrency(subscription.amount || 0, subscription.currency || 'BRL')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        por {subscription.billing_cycle === 'yearly' ? 'ano' : 'mês'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {subscription.current_period_end && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Próxima cobrança</p>
                          <p className="font-medium">
                            {format(new Date(subscription.current_period_end), "dd 'de' MMMM", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {daysRemaining !== null && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Dias restantes</p>
                          <p className="font-medium">{daysRemaining} dias</p>
                        </div>
                      </div>
                    )}
                    
                    {subscription.started_at && (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Assinante desde</p>
                          <p className="font-medium">
                            {format(new Date(subscription.started_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {subscription.cancel_at_period_end && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        Sua assinatura será cancelada ao final do período atual
                      </p>
                    </div>
                  )}

                  {/* Plan Features */}
                  {subscription.plan?.features && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Recursos incluídos</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {(subscription.plan.features as string[]).map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <Check className="h-4 w-4 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="flex flex-wrap gap-3">
                    {!subscription.cancel_at_period_end && subscription.status === 'active' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="text-destructive">
                            Cancelar Assinatura
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancelar Assinatura?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sua assinatura continuará ativa até o final do período atual. 
                              Após isso, você perderá acesso aos recursos premium.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Manter Assinatura</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => cancelSubscription.mutate({ 
                                subscriptionId: subscription.id,
                                cancelAtPeriodEnd: true 
                              })}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Confirmar Cancelamento
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    
                    <Button variant="outline" onClick={() => navigate('/checkout')}>
                      Alterar Plano
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Crown className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Sem assinatura ativa</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Assine agora para desbloquear todos os recursos premium
                  </p>
                  <Button onClick={() => navigate('/checkout')} className="gap-2">
                    Ver Planos <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Histórico de Pagamentos
                </CardTitle>
                <CardDescription>
                  Seus pagamentos recentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div 
                        key={transaction.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(transaction.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        {getTransactionStatusBadge(transaction.status)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum pagamento registrado
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Subscription;
