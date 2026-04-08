import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ChartConfig {
  type: "bar" | "line" | "scatter" | "pie" | "area";
  title: string;
  xKey: string;
  yKey: string;
  data: Record<string, unknown>[];
}

const COLORS = [
  "hsl(172, 66%, 50%)",
  "hsl(200, 80%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(340, 70%, 55%)",
  "hsl(45, 90%, 55%)",
];

export function ChatChart({ config }: { config: ChartConfig }) {
  const { type, title, xKey, yKey, data } = config;

  const chartProps = {
    data,
    margin: { top: 5, right: 20, left: 10, bottom: 5 },
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 my-3">
      <h4 className="text-sm font-semibold text-foreground mb-3">{title}</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {type === "bar" ? (
            <BarChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
              <XAxis dataKey={xKey} tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 8 }} />
              <Bar dataKey={yKey} fill={COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : type === "line" ? (
            <LineChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
              <XAxis dataKey={xKey} tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 8 }} />
              <Line type="monotone" dataKey={yKey} stroke={COLORS[0]} strokeWidth={2} dot={{ fill: COLORS[0] }} />
            </LineChart>
          ) : type === "area" ? (
            <AreaChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
              <XAxis dataKey={xKey} tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 8 }} />
              <Area type="monotone" dataKey={yKey} stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.2} />
            </AreaChart>
          ) : type === "scatter" ? (
            <ScatterChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
              <XAxis dataKey={xKey} tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} />
              <YAxis dataKey={yKey} tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 8 }} />
              <Scatter data={data} fill={COLORS[0]} />
            </ScatterChart>
          ) : (
            <PieChart>
              <Pie data={data} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={80} label>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 8 }} />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
