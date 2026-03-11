import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import type { Meal } from "../backend";

interface WeeklyChartProps {
  meals: Meal[];
  goal: number;
}

function getLast7Days(): { date: string; label: string }[] {
  const days: { date: string; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const label =
      i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" });
    days.push({ date, label });
  }
  return days;
}

export function WeeklyChart({ meals, goal }: WeeklyChartProps) {
  const days = getLast7Days();

  const data = days.map(({ date, label }) => {
    const dayStart = new Date(`${date}T00:00:00`).getTime();
    const dayEnd = dayStart + 86400000;

    const calories = meals
      .filter((m) => {
        // timestamp is nanoseconds since epoch
        const ms = Number(m.timestamp) / 1_000_000;
        return ms >= dayStart && ms < dayEnd;
      })
      .reduce((sum, m) => sum + Number(m.calories), 0);

    return { date, label, calories };
  });

  const maxVal = Math.max(...data.map((d) => d.calories), goal);

  const chartConfig: ChartConfig = {
    calories: {
      label: "Calories",
      color: "oklch(0.78 0.19 65)",
    },
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-base">This Week</h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-2 h-2 rounded-sm"
              style={{ background: "oklch(0.63 0.19 145)" }}
            />
            Under goal
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-2 h-2 rounded-sm"
              style={{ background: "oklch(0.63 0.22 25)" }}
            />
            Over goal
          </span>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-52 w-full">
        <BarChart
          data={data}
          margin={{ top: 8, right: 4, left: -16, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke="oklch(0.28 0.015 55 / 0.6)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, Math.ceil(maxVal * 1.1)]}
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
            }
          />
          <ReferenceLine
            y={goal}
            stroke="oklch(0.78 0.19 65 / 0.7)"
            strokeDasharray="4 3"
            label={{
              value: "Goal",
              position: "right",
              fontSize: 10,
              fill: "oklch(0.65 0.10 65)",
            }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => [
                  `${Number(value).toLocaleString()} kcal`,
                  "Calories",
                ]}
              />
            }
          />
          <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.date}
                fill={
                  entry.calories === 0
                    ? "oklch(0.28 0.015 55)"
                    : entry.calories > goal
                      ? "oklch(0.63 0.22 25)"
                      : "oklch(0.63 0.19 145)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      {/* Weekly totals summary */}
      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
        <span>
          Weekly avg:{" "}
          <span className="font-semibold text-foreground">
            {Math.round(
              data.reduce((s, d) => s + d.calories, 0) /
                Math.max(data.filter((d) => d.calories > 0).length, 1),
            ).toLocaleString()}{" "}
            kcal/day
          </span>
        </span>
        <span>
          Goal:{" "}
          <span className="font-semibold text-foreground">
            {goal.toLocaleString()} kcal
          </span>
        </span>
      </div>
    </div>
  );
}
