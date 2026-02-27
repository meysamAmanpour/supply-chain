"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

function Panels() {
  const router = useRouter()
  const pathname = usePathname()
  const Panels = [
    {
      title: "پنل ورودی",
      path: "/in/dashboard",
    },
    {
      title: "پنل خروجی",
      path: "/export/dashboard",
    },
    {
      title: "پنل مصرفی",
      path: "/process/dashboard",
    },
    {
      title: "پنل آشپزخانه",
      path: "/kitchen/dashboard",
    },
  ]

  return (
    <div className="flex gap-4">
      {Panels.map((item) => (
        <Link
          key={item.title}
          href={item.path}
          className={
            pathname === item.path
              ? "bg-blue-500 ms-4 text-gray-900 p-1 px-4 rounded hover:shadow shadow-pink-800 transition-all duration-500"
              : " text-white ms-4  p-1 px-4 rounded hover:shadow-lg shadow-blue-800 transition-all duration-500"
          }>
          {item.title}
        </Link>
      ))}
    </div>
  )
}

export default Panels
