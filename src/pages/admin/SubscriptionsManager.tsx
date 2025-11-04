import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { CreditCard, Key, Shield, AlertCircle, CheckCircle2, Copy, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SubscriptionsManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showProductionKeys, setShowProductionKeys] = useState({
    publicKey: false,
    accessToken: false,
    clientId: false,
    clientSecret: false,
  });
  const [showTestKeys, setShowTestKeys] = useState({
    publicKey: false,
    accessToken: false,
  });

  // Production credentials state
  const [productionCreds, setProductionCreds] = useState({
    publicKey: '',
    accessToken: '',
    clientId: '',
    clientSecret: '',
    industry: '',
    website: '',
  });

  // Test credentials state
  const [testCreds, setTestCreds] = useState({
    publicKey: '',
    accessToken: '',
  });

  const [isActivated, setIsActivated] = useState(false);

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} copiada para a área de transferência.`,
    });
  };

  const toggleVisibility = (type: 'production' | 'test', field: string) => {
    if (type === 'production') {
      setShowProductionKeys(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
    } else {
      setShowTestKeys(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
    }
  };

  const handleSaveProductionCreds = () => {
    // TODO: Implementar salvamento das credenciais usando Supabase Secrets
    toast({
      title: "Credenciais salvas!",
      description: "As credenciais de produção foram salvas com sucesso.",
    });
    setIsActivated(true);
  };

  const handleSaveTestCreds = () => {
    // TODO: Implementar salvamento das credenciais de teste
    toast({
      title: "Credenciais de teste salvas!",
      description: "As credenciais de teste foram atualizadas com sucesso.",
    });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-3xl font-bold">Assinaturas & Pagamentos</h1>
                <p className="text-muted-foreground">
                  Gerencie as credenciais do Mercado Pago para processar pagamentos
                </p>
              </div>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status da Integração</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {isActivated ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <Badge variant="default" className="bg-green-500">Ativa</Badge>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        <Badge variant="secondary">Não Configurada</Badge>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Meio de Pagamento</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Mercado Pago</div>
                  <p className="text-xs text-muted-foreground">
                    Gateway de pagamento integrado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Segurança</CardTitle>
                  <Key className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">OAuth 2.0</div>
                  <p className="text-xs text-muted-foreground">
                    Protocolo de autenticação segura
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Credentials Management */}
            <Tabs defaultValue="production" className="space-y-4">
              <TabsList>
                <TabsTrigger value="production">Credenciais de Produção</TabsTrigger>
                <TabsTrigger value="test">Credenciais de Teste</TabsTrigger>
                <TabsTrigger value="docs">Documentação</TabsTrigger>
              </TabsList>

              {/* Production Credentials */}
              <TabsContent value="production" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Credenciais de Produção</CardTitle>
                    <CardDescription>
                      Configure as credenciais para receber pagamentos reais. Estas credenciais são utilizadas no ambiente de produção.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Mantenha estas credenciais seguras. Nunca as compartilhe publicamente ou as exponha no frontend.
                      </AlertDescription>
                    </Alert>

                    <div className="grid gap-4">
                      {/* Public Key */}
                      <div className="space-y-2">
                        <Label htmlFor="prod-public-key">Public Key</Label>
                        <div className="flex gap-2">
                          <Input
                            id="prod-public-key"
                            type={showProductionKeys.publicKey ? 'text' : 'password'}
                            placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                            value={productionCreds.publicKey}
                            onChange={(e) => setProductionCreds({ ...productionCreds, publicKey: e.target.value })}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => toggleVisibility('production', 'publicKey')}
                          >
                            {showProductionKeys.publicKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleCopyToClipboard(productionCreds.publicKey, 'Public Key')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Utilizada no frontend para acessar informações sobre meios de pagamento
                        </p>
                      </div>

                      {/* Access Token */}
                      <div className="space-y-2">
                        <Label htmlFor="prod-access-token">Access Token</Label>
                        <div className="flex gap-2">
                          <Input
                            id="prod-access-token"
                            type={showProductionKeys.accessToken ? 'text' : 'password'}
                            placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            value={productionCreds.accessToken}
                            onChange={(e) => setProductionCreds({ ...productionCreds, accessToken: e.target.value })}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => toggleVisibility('production', 'accessToken')}
                          >
                            {showProductionKeys.accessToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleCopyToClipboard(productionCreds.accessToken, 'Access Token')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Chave privada utilizada no backend para gerar pagamentos
                        </p>
                      </div>

                      {/* Client ID */}
                      <div className="space-y-2">
                        <Label htmlFor="prod-client-id">Client ID</Label>
                        <div className="flex gap-2">
                          <Input
                            id="prod-client-id"
                            type={showProductionKeys.clientId ? 'text' : 'password'}
                            placeholder="xxxxxxxxxxxx"
                            value={productionCreds.clientId}
                            onChange={(e) => setProductionCreds({ ...productionCreds, clientId: e.target.value })}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => toggleVisibility('production', 'clientId')}
                          >
                            {showProductionKeys.clientId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleCopyToClipboard(productionCreds.clientId, 'Client ID')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Identificador único da sua integração
                        </p>
                      </div>

                      {/* Client Secret */}
                      <div className="space-y-2">
                        <Label htmlFor="prod-client-secret">Client Secret</Label>
                        <div className="flex gap-2">
                          <Input
                            id="prod-client-secret"
                            type={showProductionKeys.clientSecret ? 'text' : 'password'}
                            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            value={productionCreds.clientSecret}
                            onChange={(e) => setProductionCreds({ ...productionCreds, clientSecret: e.target.value })}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => toggleVisibility('production', 'clientSecret')}
                          >
                            {showProductionKeys.clientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleCopyToClipboard(productionCreds.clientSecret, 'Client Secret')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Chave privada para autenticação OAuth
                        </p>
                      </div>

                      {/* Industry */}
                      <div className="space-y-2">
                        <Label htmlFor="industry">Indústria</Label>
                        <Input
                          id="industry"
                          placeholder="Ex: Educação, E-commerce, Serviços"
                          value={productionCreds.industry}
                          onChange={(e) => setProductionCreds({ ...productionCreds, industry: e.target.value })}
                        />
                      </div>

                      {/* Website */}
                      <div className="space-y-2">
                        <Label htmlFor="website">Website (obrigatório)</Label>
                        <Input
                          id="website"
                          type="url"
                          placeholder="https://seusite.com"
                          value={productionCreds.website}
                          onChange={(e) => setProductionCreds({ ...productionCreds, website: e.target.value })}
                        />
                      </div>
                    </div>

                    <Button onClick={handleSaveProductionCreds} className="w-full">
                      Salvar Credenciais de Produção
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Test Credentials */}
              <TabsContent value="test" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Credenciais de Teste</CardTitle>
                    <CardDescription>
                      Configure as credenciais para testar a integração. Estas credenciais já estão disponíveis assim que você cria uma aplicação.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        As credenciais de teste não precisam ser ativadas e estão prontas para uso imediato.
                      </AlertDescription>
                    </Alert>

                    <div className="grid gap-4">
                      {/* Test Public Key */}
                      <div className="space-y-2">
                        <Label htmlFor="test-public-key">Public Key (Teste)</Label>
                        <div className="flex gap-2">
                          <Input
                            id="test-public-key"
                            type={showTestKeys.publicKey ? 'text' : 'password'}
                            placeholder="TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                            value={testCreds.publicKey}
                            onChange={(e) => setTestCreds({ ...testCreds, publicKey: e.target.value })}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => toggleVisibility('test', 'publicKey')}
                          >
                            {showTestKeys.publicKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleCopyToClipboard(testCreds.publicKey, 'Public Key de Teste')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Test Access Token */}
                      <div className="space-y-2">
                        <Label htmlFor="test-access-token">Access Token (Teste)</Label>
                        <div className="flex gap-2">
                          <Input
                            id="test-access-token"
                            type={showTestKeys.accessToken ? 'text' : 'password'}
                            placeholder="TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            value={testCreds.accessToken}
                            onChange={(e) => setTestCreds({ ...testCreds, accessToken: e.target.value })}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => toggleVisibility('test', 'accessToken')}
                          >
                            {showTestKeys.accessToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleCopyToClipboard(testCreds.accessToken, 'Access Token de Teste')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleSaveTestCreds} className="w-full">
                      Salvar Credenciais de Teste
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documentation */}
              <TabsContent value="docs" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Documentação & Segurança</CardTitle>
                    <CardDescription>
                      Informações importantes sobre segurança e boas práticas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Recomendações de Segurança</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          <li>Sempre envie o Access Token no header das requisições</li>
                          <li>Nunca exponha credenciais privadas no frontend</li>
                          <li>Use OAuth para gerenciar credenciais de terceiros</li>
                          <li>Renove suas credenciais periodicamente por segurança</li>
                          <li>Mantenha as credenciais em ambiente seguro (Secrets)</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Tipos de Credenciais</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          <li><strong>Public Key:</strong> Utilizada no frontend para acessar informações sobre meios de pagamento</li>
                          <li><strong>Access Token:</strong> Chave privada usada no backend para gerar pagamentos</li>
                          <li><strong>Client ID:</strong> Identificador único da integração</li>
                          <li><strong>Client Secret:</strong> Chave privada para autenticação OAuth</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Links Úteis</h3>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start" asChild>
                            <a href="https://www.mercadopago.com.br/developers" target="_blank" rel="noopener noreferrer">
                              Portal de Desenvolvedores do Mercado Pago
                            </a>
                          </Button>
                          <Button variant="outline" className="w-full justify-start" asChild>
                            <a href="https://www.mercadopago.com.br/developers/pt/docs" target="_blank" rel="noopener noreferrer">
                              Documentação Completa
                            </a>
                          </Button>
                          <Button variant="outline" className="w-full justify-start" asChild>
                            <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integrate-checkout-pro/web" target="_blank" rel="noopener noreferrer">
                              Integração Checkout Pro
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
