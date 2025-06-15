import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TransactionChart } from "@/components/TransactionChart";
import { TransactionList } from "@/components/TransactionList";
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { DashboardStats } from "@/components/DashboardStats";
import { formatCurrency } from "@/lib/utils";
import { Transaction, CURRENCIES } from "@/types/transaction";
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState('USD');

  // Load transactions from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('budgetTracker_transactions');
    if (savedTransactions) {
      const parsedTransactions = JSON.parse(savedTransactions);
      
      // Handle migration of old data without currency
      const migratedTransactions = parsedTransactions.map((t: any) => ({
        ...t,
        currency: t.currency || 'USD'
      }));
      
      setTransactions(migratedTransactions);
    }
    
    // Load default currency preference
    const savedCurrency = localStorage.getItem('budgetTracker_defaultCurrency');
    if (savedCurrency) {
      setDefaultCurrency(savedCurrency);
    }
  }, []);

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('budgetTracker_transactions', JSON.stringify(transactions));
  }, [transactions]);
  
  // Save default currency preference
  useEffect(() => {
    localStorage.setItem('budgetTracker_defaultCurrency', defaultCurrency);
  }, [defaultCurrency]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setShowAddForm(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Group transactions by currency
  const transactionsByCurrency = transactions.reduce((acc, transaction) => {
    const currency = transaction.currency || 'USD';
    if (!acc[currency]) {
      acc[currency] = [];
    }
    acc[currency].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  // Calculate totals for each currency
  const totals = Object.entries(transactionsByCurrency).map(([currency, txs]) => {
    const income = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { currency, income, expenses, savings: income - expenses };
  });

  // Get totals for default currency (for main display)
  const defaultTotals = totals.find(t => t.currency === defaultCurrency) || { 
    currency: defaultCurrency, 
    income: 0, 
    expenses: 0, 
    savings: 0 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">Budget Tracker</h1>
              <p className="text-slate-600">Take control of your financial journey</p>
            </div>
            <div className="flex gap-4">
              <Select 
                value={defaultCurrency} 
                onValueChange={setDefaultCurrency}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(currency => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats 
          totalIncome={defaultTotals.income}
          totalExpenses={defaultTotals.expenses}
          totalSavings={defaultTotals.savings}
          currency={defaultCurrency}
        />

        {/* Currency Summary (if multiple currencies exist) */}
        {totals.length > 1 && (
          <div className="mt-8">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-slate-800">Multi-Currency Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {totals.map(total => (
                    <div key={total.currency} className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{total.currency}</h3>
                        <Badge variant="outline">{CURRENCIES.find(c => c.code === total.currency)?.symbol || total.currency}</Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Income:</span>
                          <span className="font-medium text-emerald-600">{formatCurrency(total.income, total.currency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Expenses:</span>
                          <span className="font-medium text-red-600">{formatCurrency(total.expenses, total.currency)}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-200">
                          <span className="text-slate-600">Balance:</span>
                          <span className={`font-medium ${total.savings >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                            {formatCurrency(total.savings, total.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Charts Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-slate-800">Spending Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionChart 
                  transactions={transactions} 
                  defaultCurrency={defaultCurrency}
                />
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-slate-800">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map(transaction => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{transaction.category}</p>
                          <p className="text-sm text-slate-600">{transaction.description}</p>
                        </div>
                      </div>
                      <div className={`font-semibold ${
                        transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No transactions yet</p>
                      <p className="text-sm">Add your first transaction to get started!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Transactions */}
        <div className="mt-8">
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-800">All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionList 
                transactions={transactions}
                onDeleteTransaction={deleteTransaction}
              />
            </CardContent>
          </Card>
        </div>

        {/* Add Transaction Modal */}
        {showAddForm && (
          <AddTransactionForm
            onAddTransaction={addTransaction}
            onClose={() => setShowAddForm(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
