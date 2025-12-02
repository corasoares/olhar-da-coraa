-- =============================================
-- FASE 1: INFRAESTRUTURA DE BANCO DE DADOS
-- Sistema Completo de Assinaturas com Mercado Pago
-- =============================================

-- 1.1 Criar tabela de planos de assinatura
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  trial_days INTEGER DEFAULT 0,
  mp_plan_id TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 1.2 Criar tabela de assinaturas dos usuários
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing', 'pending')),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'BRL',
  started_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  -- Campos Mercado Pago
  mp_subscription_id TEXT,
  mp_preapproval_id TEXT,
  mp_payer_id TEXT,
  mp_payment_method_id TEXT,
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Constraint para garantir apenas uma assinatura ativa por usuário
  CONSTRAINT unique_active_subscription UNIQUE (user_id) 
);

-- 1.3 Criar tabela de transações de pagamento
CREATE TABLE public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'refunded', 'in_process', 'charged_back')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('subscription', 'one_time', 'refund')),
  -- Campos Mercado Pago
  mp_payment_id TEXT,
  mp_status TEXT,
  mp_status_detail TEXT,
  mp_preference_id TEXT,
  mp_external_reference TEXT,
  -- Detalhes do pagamento
  payment_method TEXT,
  payment_type TEXT,
  installments INTEGER DEFAULT 1,
  description TEXT,
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_mp_subscription_id ON public.subscriptions(mp_subscription_id);
CREATE INDEX idx_subscriptions_mp_preapproval_id ON public.subscriptions(mp_preapproval_id);

CREATE INDEX idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_subscription_id ON public.payment_transactions(subscription_id);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX idx_payment_transactions_mp_payment_id ON public.payment_transactions(mp_payment_id);
CREATE INDEX idx_payment_transactions_created_at ON public.payment_transactions(created_at DESC);

-- =============================================
-- HABILITAR RLS
-- =============================================

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS RLS - subscription_plans
-- =============================================

-- Todos podem ver planos ativos
CREATE POLICY "Anyone can view active plans"
ON public.subscription_plans
FOR SELECT
USING (is_active = true);

-- Super admins podem gerenciar planos
CREATE POLICY "Super admins can manage plans"
ON public.subscription_plans
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- =============================================
-- POLÍTICAS RLS - subscriptions
-- =============================================

-- Usuários podem ver suas próprias assinaturas
CREATE POLICY "Users can view own subscriptions"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Super admins podem ver todas as assinaturas
CREATE POLICY "Super admins can view all subscriptions"
ON public.subscriptions
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

-- Super admins podem inserir assinaturas
CREATE POLICY "Super admins can insert subscriptions"
ON public.subscriptions
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Super admins podem atualizar assinaturas
CREATE POLICY "Super admins can update subscriptions"
ON public.subscriptions
FOR UPDATE
USING (public.has_role(auth.uid(), 'super_admin'));

-- Usuários podem atualizar status de cancelamento da própria assinatura
CREATE POLICY "Users can cancel own subscription"
ON public.subscriptions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- POLÍTICAS RLS - payment_transactions
-- =============================================

-- Usuários podem ver suas próprias transações
CREATE POLICY "Users can view own transactions"
ON public.payment_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Super admins podem ver todas as transações
CREATE POLICY "Super admins can view all transactions"
ON public.payment_transactions
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

-- Super admins podem inserir transações
CREATE POLICY "Super admins can insert transactions"
ON public.payment_transactions
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Super admins podem atualizar transações
CREATE POLICY "Super admins can update transactions"
ON public.payment_transactions
FOR UPDATE
USING (public.has_role(auth.uid(), 'super_admin'));

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ADICIONAR CAMPO is_premium NA TABELA LESSONS
-- =============================================

ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- =============================================
-- INSERIR PLANOS PADRÃO
-- =============================================

INSERT INTO public.subscription_plans (name, slug, description, price_monthly, price_yearly, features, trial_days, sort_order)
VALUES 
  ('Free', 'free', 'Acesso básico à plataforma', 0, 0, 
   '["Acesso a lições básicas", "Quizzes limitados", "Progresso básico"]'::jsonb, 
   0, 1),
  ('Premium', 'premium', 'Acesso completo a todos os recursos', 29.90, 299.00, 
   '["Acesso ilimitado a todas as lições", "Quizzes ilimitados", "Análise avançada de progresso", "Recomendações personalizadas por IA", "Certificados de conclusão", "Suporte prioritário"]'::jsonb, 
   7, 2),
  ('Business', 'business', 'Para equipes e empresas', 99.90, 999.00, 
   '["Tudo do Premium", "Múltiplos usuários", "Dashboard de equipe", "Relatórios personalizados", "API de integração", "Gerente de conta dedicado"]'::jsonb, 
   14, 3)
ON CONFLICT (slug) DO NOTHING;