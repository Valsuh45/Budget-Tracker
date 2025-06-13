
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DashboardStatsProps {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
}

export const DashboardStats = ({ totalIncome, totalExpenses, totalSavings }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Income */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Total Income</p>
              <p className="text-3xl font-bold">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-red-500 to-red-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Total Expenses</p>
              <p className="text-3xl font-bold">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <TrendingDown className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Savings */}
      <Card className={`shadow-lg border-0 text-white ${
        totalSavings >= 0 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
          : 'bg-gradient-to-br from-orange-500 to-orange-600'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                totalSavings >= 0 ? 'text-blue-100' : 'text-orange-100'
              }`}>
                {totalSavings >= 0 ? 'Total Savings' : 'Budget Deficit'}
              </p>
              <p className="text-3xl font-bold">{formatCurrency(Math.abs(totalSavings))}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <PiggyBank className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
