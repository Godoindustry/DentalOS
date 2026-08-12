"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface DonutChartProps {
  data: { name: string; value: number; color: string }[]
  total: string
}

export function DonutChart({ data, total }: DonutChartProps) {
  const softenedData = data.map((entry, index) => ({
    ...entry,
    color: entry.color || ["#4FD1C5", "#7DD3FC", "#6EE7B7", "#FBBF77"][index % 4],
  }))

  return (
    <div className="relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={softenedData}
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={82}
            paddingAngle={4}
            dataKey="value"
            stroke="rgba(0,43,54,0.65)"
            strokeWidth={2}
          >
            {softenedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "rgba(8, 53, 62, 0.96)",
              border: "1px solid rgba(216,238,240,0.12)",
              borderRadius: "12px",
              backdropFilter: "blur(16px)",
              color: "#D8EEF0",
              fontSize: "13px",
              boxShadow: "0 16px 42px rgba(0,18,24,0.32)",
            }}
            formatter={(value: unknown, name: unknown) => [`${value}%`, String(name)]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground">{total}</span>
        <span className="text-xs text-muted-foreground">Bruto</span>
      </div>
    </div>
  )
}
