"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { demoProducts } from "@/lib/data/demo";
import { formatCurrency } from "@/lib/utils";

const revenue = [
  { month: "Jan", total: 4200 },
  { month: "Feb", total: 5100 },
  { month: "Mar", total: 4800 },
  { month: "Apr", total: 6200 },
  { month: "May", total: 7100 },
  { month: "Jun", total: 8600 },
  { month: "Jul", total: 9200 },
];

const recentOrders = [
  { id: "DG-1042", customer: "Aaliyah M.", total: 145.98, status: "processing" },
  { id: "DG-1041", customer: "Priya S.", total: 79.99, status: "shipped" },
  { id: "DG-1040", customer: "Jordan K.", total: 59.99, status: "delivered" },
  { id: "DG-1039", customer: "Maya R.", total: 118.97, status: "pending" },
];

export default function AdminDashboardPage() {
  const stats = [
    { label: "Total Sales", value: formatCurrency(45280) },
    { label: "Orders", value: "186" },
    { label: "Customers", value: "142" },
    { label: "Products", value: String(demoProducts.length) },
    { label: "Low Stock", value: String(demoProducts.filter((p) => p.stock <= 10).length) },
    { label: "Subscribers", value: "328" },
    { label: "Unread Messages", value: "4" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">Dashboard</h1>
        <p className="mt-1 text-sm text-white/50">Overview of Dazzle Glam performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-silver">{s.label}</p>
            <p className="mt-2 font-heading text-3xl text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="font-heading text-xl">Monthly Revenue</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF1493" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#FF1493" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#0a0a0a",
                    border: "1px solid #333",
                    borderRadius: 8,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#FF1493"
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-fuchsia">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {recentOrders.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between border-b border-white/5 pb-3 text-sm"
              >
                <div>
                  <p className="font-medium">{o.id}</p>
                  <p className="text-white/45">{o.customer}</p>
                </div>
                <div className="text-right">
                  <p>{formatCurrency(o.total)}</p>
                  <p className="capitalize text-fuchsia">{o.status}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="font-heading text-xl">Top Sellers</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-silver">
              <tr>
                <th className="pb-3">Product</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Stock</th>
              </tr>
            </thead>
            <tbody>
              {demoProducts
                .filter((p) => p.isBestSeller)
                .slice(0, 5)
                .map((p) => (
                  <tr key={p.id} className="border-t border-white/5">
                    <td className="py-3">{p.name.slice(0, 48)}…</td>
                    <td>{formatCurrency(p.price)}</td>
                    <td>{p.stock}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
