"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#7aa2ff", "#4d7dff", "#9dbaff", "#5b6b8c", "#334066"];

export function RevenueChart({ data }: { data: { day: string; total: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted">No approved payments yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data.map((d) => ({ ...d, total: d.total / 100 }))}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1c2333" />
        <XAxis dataKey="day" stroke="#8a90a6" fontSize={11} />
        <YAxis stroke="#8a90a6" fontSize={11} />
        <Tooltip
          contentStyle={{ background: "#0d1120", border: "1px solid #1c2333", borderRadius: 8 }}
          formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
        />
        <Line type="monotone" dataKey="total" stroke="#7aa2ff" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function OrdersChart({ data }: { data: { day: string; count: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted">No orders yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1c2333" />
        <XAxis dataKey="day" stroke="#8a90a6" fontSize={11} />
        <YAxis stroke="#8a90a6" fontSize={11} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "#0d1120", border: "1px solid #1c2333", borderRadius: 8 }}
          formatter={(value) => [value, "Orders"]}
        />
        <Bar dataKey="count" fill="#7aa2ff" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PaymentMethodChart({ data }: { data: { method: string; count: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted">No approved payments yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="method" innerRadius={50} outerRadius={80}>
          {data.map((entry, i) => (
            <Cell key={entry.method} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: "#0d1120", border: "1px solid #1c2333", borderRadius: 8 }} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function OrderStatusChart({ data }: { data: { status: string; count: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted">No orders yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1c2333" />
        <XAxis dataKey="status" stroke="#8a90a6" fontSize={10} interval={0} angle={-20} textAnchor="end" height={60} />
        <YAxis stroke="#8a90a6" fontSize={11} allowDecimals={false} />
        <Tooltip contentStyle={{ background: "#0d1120", border: "1px solid #1c2333", borderRadius: 8 }} />
        <Bar dataKey="count" fill="#7aa2ff" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
