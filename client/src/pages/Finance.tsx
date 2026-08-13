import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  CreditCard,
  Calendar,
  Download,
  FileText,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Finance() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const isAdmin = user?.role === "admin";

  // Queries
  const { data: revenues } = trpc.finance.listRevenues.useQuery({ limit: 50 }, { enabled: isAdmin });
  const { data: expenses } = trpc.finance.listExpenses.useQuery({ limit: 50 }, { enabled: isAdmin });
  const { data: autoPayments } = trpc.finance.listAutoPayments.useQuery({ isActive: true }, { enabled: isAdmin });
  const { data: reports } = trpc.finance.listReports.useQuery({ limit: 12 }, { enabled: isAdmin });
  const { data: receipts } = trpc.finance.listReceipts.useQuery({ limit: 50 }, { enabled: isAdmin });

  // Mutations
  const generateReportMutation = trpc.finance.generateMonthlyReport.useMutation();
  const calculateTaxesMutation = trpc.finance.calculateTaxes.useMutation();

  // Calcular totais
  const totalRevenue = revenues?.reduce((sum, rev) => sum + rev.grossAmount, 0) || 0;
  const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
  const netProfit = totalRevenue - totalExpenses;

  const handleGenerateReport = async () => {
    try {
      toast.info("📊 Gerando relatório financeiro...");
      await generateReportMutation.mutateAsync({ month: selectedMonth, year: selectedYear });
      toast.success("Relatório gerado com sucesso!");
      window.location.reload();
    } catch (error) {
      toast.error("Erro ao gerar relatório");
    }
  };

  const handleCalculateTaxes = async () => {
    try {
      toast.info("🧮 Calculando impostos...");
      await calculateTaxesMutation.mutateAsync({ month: selectedMonth, year: selectedYear });
      toast.success("Impostos calculados com sucesso!");
      window.location.reload();
    } catch (error) {
      toast.error("Erro ao calcular impostos");
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Card className="mx-auto max-w-xl border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900"><AlertCircle className="h-5 w-5" /> Acesso administrativo necessário</CardTitle>
              <CardDescription>Este painel contém informações financeiras e só é carregado para administradores autorizados.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Gestão Financeira
            </h1>
            <p className="text-lg text-gray-600">
              Controle completo de receitas, despesas, impostos e recibos
            </p>
          </div>

          {/* Cards de resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Receita Total
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(totalRevenue)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {revenues?.length || 0} transações
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Despesas Totais
                </CardTitle>
                <TrendingDown className="h-5 w-5 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {formatCurrency(totalExpenses)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {expenses?.length || 0} despesas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Lucro Líquido
                </CardTitle>
                <DollarSign className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(netProfit)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {netProfit >= 0 ? 'Positivo' : 'Negativo'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="revenues" className="space-y-6">
            <TabsList>
              <TabsTrigger value="revenues">
                <TrendingUp className="h-4 w-4 mr-2" />
                Receitas
              </TabsTrigger>
              <TabsTrigger value="expenses">
                <TrendingDown className="h-4 w-4 mr-2" />
                Despesas
              </TabsTrigger>
              <TabsTrigger value="auto-payments">
                <CreditCard className="h-4 w-4 mr-2" />
                Pagamentos Automáticos
              </TabsTrigger>
              <TabsTrigger value="receipts">
                <Receipt className="h-4 w-4 mr-2" />
                Recibos
              </TabsTrigger>
              <TabsTrigger value="reports">
                <FileText className="h-4 w-4 mr-2" />
                Relatórios
              </TabsTrigger>
            </TabsList>

            {/* Tab: Receitas */}
            <TabsContent value="revenues">
              <Card>
                <CardHeader>
                  <CardTitle>Receitas Recebidas</CardTitle>
                  <CardDescription>Pagamentos de assinaturas e transações</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {!revenues || revenues.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma receita registrada</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {revenues.map((revenue) => (
                          <div key={revenue.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant={revenue.status === "completed" ? "default" : "outline"}>
                                  {revenue.source}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  {new Date(revenue.paidAt!).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                ID: {revenue.transactionId || revenue.id}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">
                                {formatCurrency(revenue.grossAmount)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Líquido: {formatCurrency(revenue.netAmount)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Despesas */}
            <TabsContent value="expenses">
              <Card>
                <CardHeader>
                  <CardTitle>Despesas Operacionais</CardTitle>
                  <CardDescription>Custos e despesas do negócio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {!expenses || expenses.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma despesa registrada</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {expenses.map((expense) => (
                          <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{expense.category}</Badge>
                                {expense.provider && (
                                  <span className="text-sm font-semibold">{expense.provider}</span>
                                )}
                                {expense.isRecurring && (
                                  <Badge variant="secondary">Recorrente</Badge>
                                )}
                              </div>
                              <div className="mt-1 text-sm text-gray-700">
                                {expense.description}
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                {expense.status === "paid" && expense.paidAt ? 
                                  `Pago em ${new Date(expense.paidAt).toLocaleDateString('pt-BR')}` :
                                  `Vencimento: ${expense.dueDate ? new Date(expense.dueDate).toLocaleDateString('pt-BR') : 'N/A'}`
                                }
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-red-600">
                                {formatCurrency(expense.amount)}
                              </div>
                              <Badge variant={
                                expense.status === "paid" ? "default" :
                                expense.status === "overdue" ? "destructive" : "outline"
                              }>
                                {expense.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Pagamentos Automáticos */}
            <TabsContent value="auto-payments">
              <Card>
                <CardHeader>
                  <CardTitle>Pagamentos Automáticos Configurados</CardTitle>
                  <CardDescription>Despesas recorrentes com pagamento automático</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {!autoPayments || autoPayments.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum pagamento automático configurado</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {autoPayments.map((payment) => (
                          <div key={payment.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                                  <span className="font-semibold text-lg">{payment.provider}</span>
                                  <Badge variant="secondary">{payment.frequency}</Badge>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{payment.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                  <span>
                                    <Calendar className="h-3 w-3 inline mr-1" />
                                    Próximo: {payment.nextPaymentDate ? new Date(payment.nextPaymentDate).toLocaleDateString('pt-BR') : 'N/A'}
                                  </span>
                                  {payment.lastPaymentDate && (
                                    <span>
                                      Último: {new Date(payment.lastPaymentDate).toLocaleDateString('pt-BR')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-blue-600">
                                  {formatCurrency(payment.amount)}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {payment.paymentMethod}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Recibos */}
            <TabsContent value="receipts">
              <Card>
                <CardHeader>
                  <CardTitle>Recibos e Comprovantes</CardTitle>
                  <CardDescription>Documentação fiscal completa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {!receipts || receipts.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum recibo disponível</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {receipts.map((receipt) => (
                          <div key={receipt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge>{receipt.receiptType}</Badge>
                                <span className="text-sm font-mono text-gray-600">
                                  #{receipt.receiptNumber}
                                </span>
                              </div>
                              <div className="mt-1 text-sm text-gray-700">
                                {receipt.description}
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                Emitido em {new Date(receipt.issuedAt).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-lg font-bold">
                                  {formatCurrency(receipt.amount)}
                                </div>
                              </div>
                              {receipt.pdfUrl && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={receipt.pdfUrl} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Relatórios */}
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Relatórios Financeiros</CardTitle>
                      <CardDescription>Análises mensais e anuais</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCalculateTaxes} variant="outline">
                        Calcular Impostos
                      </Button>
                      <Button onClick={handleGenerateReport}>
                        Gerar Relatório
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {!reports || reports.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum relatório gerado</p>
                        <Button onClick={handleGenerateReport} className="mt-4">
                          Gerar Primeiro Relatório
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {reports.map((report) => (
                          <div key={report.id} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {new Date(report.year, report.month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                </h3>
                                {report.isFinalized && (
                                  <Badge variant="default" className="mt-1">Finalizado</Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <div className={`text-2xl font-bold ${report.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrency(report.netProfit)}
                                </div>
                                <div className="text-xs text-gray-500">Lucro Líquido</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-gray-600">Receita</div>
                                <div className="font-semibold text-green-600">
                                  {formatCurrency(report.totalRevenue)}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600">Despesas</div>
                                <div className="font-semibold text-red-600">
                                  {formatCurrency(report.totalExpenses)}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600">Impostos</div>
                                <div className="font-semibold text-orange-600">
                                  {formatCurrency(report.totalTaxes)}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600">Assinantes</div>
                                <div className="font-semibold">
                                  {report.activeSubscribers}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
