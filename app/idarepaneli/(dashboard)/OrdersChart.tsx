"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function OrdersChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#171717" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#171717" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={2} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={30} />
        <Tooltip />
        <Area type="monotone" dataKey="count" stroke="#171717" fill="url(#ordersFill)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
