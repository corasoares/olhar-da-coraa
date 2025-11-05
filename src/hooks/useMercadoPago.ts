import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MercadoPagoCredentials {
  publicKey: string;
  accessToken: string;
  clientId: string;
  clientSecret: string;
  industry?: string;
  website?: string;
}

interface OAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
  user_id?: number;
  public_key?: string;
  live_mode?: boolean;
}

export const useMercadoPago = () => {
  const { toast } = useToast();

  const obtainAccessToken = useMutation({
    mutationFn: async ({ 
      clientId, 
      clientSecret, 
      testMode = false 
    }: { 
      clientId: string; 
      clientSecret: string; 
      testMode?: boolean;
    }) => {
      console.log('Obtaining Mercado Pago access token...', { testMode });

      const { data, error } = await supabase.functions.invoke('mercadopago-oauth', {
        body: {
          clientId,
          clientSecret,
          grantType: 'client_credentials',
          testToken: testMode,
        },
      });

      if (error) {
        console.error('Error obtaining access token:', error);
        throw error;
      }

      return data as OAuthResponse;
    },
    onSuccess: (data) => {
      console.log('Access token obtained successfully:', data);
      toast({
        title: 'Access Token Obtido!',
        description: `Token válido por ${Math.floor(data.expires_in / 3600)} horas.`,
      });
    },
    onError: (error: any) => {
      console.error('Failed to obtain access token:', error);
      toast({
        title: 'Erro ao obter Access Token',
        description: error.message || 'Verifique suas credenciais e tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const saveProductionCredentials = useMutation({
    mutationFn: async (credentials: MercadoPagoCredentials) => {
      console.log('Saving production credentials...');

      // First, obtain the access token to validate credentials
      const tokenData = await obtainAccessToken.mutateAsync({
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret,
        testMode: false,
      });

      // Store credentials in Supabase secrets would go here
      // For now, we'll store them in localStorage as a temporary solution
      localStorage.setItem('mp_production_credentials', JSON.stringify({
        ...credentials,
        generatedAccessToken: tokenData.access_token,
        tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      }));

      return { ...credentials, tokenData };
    },
    onSuccess: () => {
      toast({
        title: 'Credenciais de Produção Salvas!',
        description: 'As credenciais foram salvas e validadas com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar credenciais',
        description: error.message || 'Ocorreu um erro ao salvar as credenciais.',
        variant: 'destructive',
      });
    },
  });

  const saveTestCredentials = useMutation({
    mutationFn: async (credentials: { publicKey: string; accessToken: string }) => {
      console.log('Saving test credentials...');

      // Store in localStorage
      localStorage.setItem('mp_test_credentials', JSON.stringify(credentials));

      return credentials;
    },
    onSuccess: () => {
      toast({
        title: 'Credenciais de Teste Salvas!',
        description: 'As credenciais de teste foram atualizadas com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar credenciais',
        description: error.message || 'Ocorreu um erro ao salvar as credenciais.',
        variant: 'destructive',
      });
    },
  });

  const getStoredCredentials = (type: 'production' | 'test') => {
    const key = type === 'production' ? 'mp_production_credentials' : 'mp_test_credentials';
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  };

  return {
    obtainAccessToken,
    saveProductionCredentials,
    saveTestCredentials,
    getStoredCredentials,
  };
};
