import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { IChartDataPoint } from "@/types/dashboard.types";

interface EnrollmentPieChartProps {
  data: IChartDataPoint[];
  title?: string;
  description?: string;
}

const CHART_COLORS = [
  "oklch(0.646 0.222 41.116)",
  "oklch(0.6 0.118 184.704)",
  "oklch(0.398 0.07 227.392)",
  "oklch(0.828 0.189 84.429)",
  "oklch(0.769 0.188 70.08)",
];

const EnrollmentPieChart = ({
  data,
  title = "Distribution",
  description = "Data distribution overview",
}: EnrollmentPieChartProps) => {
  if (!data || !Array.isArray(data)) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
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
    name: item.label
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase()),
    value: Number(item.value),
  }));

  if (
    !formattedData.length ||
    formattedData.every((item) => item.value === 0)
  ) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className="flex items-center justify-center h-75">
          <p className="text-sm text-muted-foreground">
            No data available to display the chart.
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey={"value"}
            >
              {formattedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default EnrollmentPieChart;
