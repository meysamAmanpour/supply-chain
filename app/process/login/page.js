"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Link from "next/link"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) {
      toast.error("نام کاربری و رمز عبور الزامی است")
      return
    }

    const res = await fetch("/api/process/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      toast.error(data.error || "اطلاعات ورود نادرست است")
      return
    }

    document.cookie = `authProcess=true; path=/`
    document.cookie = `role=${data.user.role}; path=/`
    document.cookie = `username=${data.user.username}; path=/`

    // role-based redirect
    if (data.user.role === "admin") router.push("/process/dashboard")
    else router.push("/process/dashboard/form")
  }

  return (
    <>
      <div className=" m-20 w-40 bg-gray-700 py-1 rounded-xl text-white text-center hover:shadow shadow-gray-800 transition-all duration-300 ">
        <Link href="/">صفحه اصلی</Link>
      </div>
      <div className="flex items-center justify-center mt-40  bg-inherit">
        <form
          onSubmit={handleSubmit}
          className=" bg-white p-8 rounded-xl shadow-md w-96">
          <h2 className="text-xl font-bold mb-6 text-center">ورود به سیستم</h2>

          <input
            className="w-full border p-2 mb-4 rounded"
            placeholder="نام کاربری"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            className="w-full border p-2 mb-6 rounded"
            placeholder="رمز عبور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700">
            ورود
          </button>
        </form>
      </div>
    </>
  )
}
