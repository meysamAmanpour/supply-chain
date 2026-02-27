"use client"

import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts"

export default function ReportChart({ data }) {
  const getColor = (remain) => {
    if (remain < 0) return "#ef4444" // مغایرت
    if (remain <= 10) return "#f59e0b" // درحال اتمام
    return "#22c55e" // موجود
  }

  return (
    <BarChart width={700} height={320} data={data}>
      <CartesianGrid strokeDasharray="3 3" />

      <XAxis dataKey="materialName" />
      <YAxis />
      <Tooltip />
      <Legend />

      {/* ستون باقی مانده */}
      <Bar dataKey="remain" name="باقی مانده">
        {data.map((item, i) => (
          <Cell key={i} fill={getColor(item.remain)} />
        ))}
      </Bar>

      {/* خط مصرف */}
      <Line
        type="monotone"
        dataKey="process"
        name="مصرف"
        stroke="#3b82f6"
        strokeWidth={3}
      />
    </BarChart>
  )
}

// "use client"

// import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Line } from "recharts"

// export default function ReportChart({ data }) {
//   const getColor = (r) => {
//     if (r > 0 && r < 11) return "#f59e0b" //نارنجی
//     if (r > 10) return "#22c55e" //سبز
//     return "#ef4444"
//   }

//   console.log(data)

//   return (
//     <div style={{ width: "50%", height: 300 }}>
//       <BarChart width={600} height={300} data={data}>
//         <XAxis dataKey="materialName" />
//         <YAxis />
//         <Tooltip />

//         <Bar dataKey="remain">
//           {data.map((item, i) => (
//             <Cell key={i} fill={getColor(item.remain)} />
//           ))}
//         </Bar>
//       </BarChart>
//     </div>
//   )
// }
