"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { BlockScore } from "@/lib/scoring";

export default function RadarChartClient({
  blocks,
  color,
}: {
  blocks: BlockScore[];
  color: string;
}) {
  const data = blocks.map((b) => ({ axis: b.shortName, value: b.pct }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "#374151", fontSize: 12 }}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            tickCount={5}
          />
          <Radar
            name="Madurez"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.35}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
