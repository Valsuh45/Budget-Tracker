import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Transaction } from "@/types/transaction";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface TransactionChartProps {
  transactions: Transaction[];
  defaultCurrency: string;
}

export const TransactionChart = ({ transactions, defaultCurrency }: TransactionChartProps) => {
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency);
  
  // Get unique currencies from transactions
  const currencies = [...new Set(transactions.map(t => t.currency || 'USD'))];
  
  // Filter transactions by selected currency
  const filteredTransactions = transactions.filter(t => (t.currency || 'USD') === selectedCurrency);

  // Prepare data for expense pie chart
  const expenseData = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const category = transaction.category;
      if (acc[category]) {
        acc[category] += transaction.amount;
      } else {
        acc[category] = transaction.amount;
      }
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(expenseData).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  // Prepare data for monthly bar chart
  const monthlyData = filteredTransactions.reduce(
    (acc, transaction) => {
      const monthYear = new Date(transaction.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });

      if (!acc[monthYear]) {
        acc[monthYear] = { month: monthYear, income: 0, expense: 0 };
      }

      if (transaction.type === "income") {
        acc[monthYear].income += transaction.amount;
      } else {
        acc[monthYear].expense += transaction.amount;
      }

      return acc;
    },
    {} as Record<string, { month: string; income: number; expense: number }>,
  );

  const barData = Object.values(monthlyData).sort(
    (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime(),
  );

  // Colors for charts
  const COLORS = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#ec4899",
    "#6366f1",
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value, selectedCurrency)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-800">{data.name}</p>
          <p className="text-sm text-slate-600">{formatCurrency(data.value, selectedCurrency)}</p>
        </div>
      );
    }
    return null;
  };

  if (transactions.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        <div className="text-center">
          <p className="text-lg font-medium">No data to display</p>
          <p className="text-sm">
            Add some transactions to see your spending insights
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {currencies.length > 1 && (
        <div className="mb-4">
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(currency => (
                <SelectItem key={currency} value={currency}>{currency}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expenses">Expense Breakdown</TabsTrigger>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          {pieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              <p>No expense data available for {selectedCurrency}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {barData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="income"
                    fill="#10b981"
                    name="Income"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="expense"
                    fill="#ef4444"
                    name="Expenses"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              <p>No trend data available for {selectedCurrency}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
