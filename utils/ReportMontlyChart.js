"use client"

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"

// تابع رنگ داینامیک موجودی
const getEndColor = (value) => {
  if (value <= 10) return "#f87171" // قرمز
  if (value <= 30) return "#facc15" // زرد
  return "#34d399" // سبز
}

// Tooltip سفارشی
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const endValue = payload.find((p) => p.dataKey === "end")?.value
    return (
      <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((p, i) => {
          const color = p.dataKey === "end" ? getEndColor(endValue) : p.fill
          return (
            <p key={i} style={{ color }}>
              {p.name}: {p.value}
            </p>
          )
        })}
      </div>
    )
  }
  return null
}

export default function ReportMonthlyChartChart({ data }) {
  return (
    <div className="w-full h-96 bg-white rounded-2xl p-4 shadow">
      <ResponsiveContainer>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* ورودی */}
          <Bar dataKey="in" name="ورودی" fill="#60a5fa" />

          {/* مصرف */}
          <Bar dataKey="process" name="مصرف" fill="#f87171" />
          <Bar dataKey="start" name="مانده ماه قبل" fill="#7100ff" />
          <Bar dataKey="remain" name="موجودی پایان ماه  " fill="#34d399" />
          <Bar dataKey="materialName" name="نام مواد" />

          {/* موجودی پایان ماه */}
          <Line
            dataKey="remain"
            name="موجودی پایان ماه"
            stroke="#34d399"
            strokeWidth={3}
            dot={(props) => {
              const { cx, cy, value } = props
              return <circle cx={cx} cy={cy} r={6} fill={getEndColor(value)} />
            }}
            activeDot={{ r: 8 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
