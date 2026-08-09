import { IRevenueDataPoint } from "@/types/dashboard.types";
import { format } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface EnrollmentBarChartProps {
  data: IRevenueDataPoint[];
}

const EnrollmentBarChart = ({ data }: EnrollmentBarChartProps) => {
  if (!data || !Array.isArray(data)) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>Monthly Revenue Statistics</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-75">
          <p className="text-sm text-muted-foreground">
            Invalid data provided for the chart.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formattedData = data.map((item) => ({
    month: item.month
      ? format(new Date(item.month + "-01"), "MMM yyyy")
      : "N/A",
    revenue: Number(item.revenue),
  }));

  if (
    !formattedData.length ||
    formattedData.every((item) => item.revenue === 0)
  ) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>Monthly Revenue Statistics</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-75">
          <p className="text-sm text-muted-foreground">
            No revenue data available.
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Revenue Trends</CardTitle>
        <CardDescription>Monthly Revenue Statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={formattedData}>
            <CartesianGrid stroke="#e8ebe6" strokeDasharray="3 3" vertical={false} />
            <XAxis tickLine={false} axisLine={false} dataKey="month" tick={{ fill: "#868685", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: "#868685", fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: "#e8ebe6", opacity: 0.5 }}
              contentStyle={{
                borderRadius: 16,
                border: "1px solid #e8ebe6",
                boxShadow: "0 10px 30px rgba(14,15,12,0.08)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Bar
              dataKey="revenue"
              fill="#9fe870"
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default EnrollmentBarChart;
