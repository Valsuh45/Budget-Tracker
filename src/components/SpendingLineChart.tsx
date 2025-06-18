import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useTheme } from "next-themes";
import { Transaction } from "@/types/transaction";
import { formatCurrency } from "@/lib/utils";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface SpendingLineChartProps {
  transactions: Transaction[];
  period: "weekly" | "monthly";
  currency: string;
}

function getWeekYear(date: Date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return `${date.getFullYear()}-W${String(Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)).padStart(2, "0")}`;
}

function getMonthYear(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export const SpendingLineChart = ({ transactions, period, currency }: SpendingLineChartProps) => {
  const { resolvedTheme } = useTheme();

  // Filter only expenses for the selected currency
  const filtered = transactions.filter(
    (t) => t.type === "expense" && (t.currency || "USD") === currency
  );

  // Group and sum expenses by week or month
  const grouped = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((t) => {
      const date = new Date(t.date);
      const key = period === "weekly" ? getWeekYear(date) : getMonthYear(date);
      map.set(key, (map.get(key) || 0) + t.amount);
    });
    // Sort keys chronologically
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, period]);

  const labels = grouped.map(([key]) => key);
  const dataPoints = grouped.map(([, value]) => value);

  // Chart.js theme-aware colors
  const isDark = resolvedTheme === "dark";
  const chartColor = isDark ? "#34d399" : "#059669"; // emerald
  const gridColor = isDark ? "#334155" : "#e5e7eb";
  const textColor = isDark ? "#f1f5f9" : "#334155";
  const bgGradient = isDark
    ? (ctx: any) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(52, 211, 153, 0.3)");
        gradient.addColorStop(1, "rgba(30, 41, 59, 0.1)");
        return gradient;
      }
    : (ctx: any) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(16, 185, 129, 0.2)");
        gradient.addColorStop(1, "rgba(255,255,255,0.1)");
        return gradient;
      };

  const chartData = {
    labels,
    datasets: [
      {
        label: `Total Spending (${currency})`,
        data: dataPoints,
        fill: true,
        backgroundColor: bgGradient,
        borderColor: chartColor,
        pointBackgroundColor: chartColor,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        labels: { color: textColor },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${formatCurrency(ctx.parsed.y, currency)}`,
        },
        backgroundColor: isDark ? "#1e293b" : "#fff",
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: chartColor,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor },
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="w-full">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}; 