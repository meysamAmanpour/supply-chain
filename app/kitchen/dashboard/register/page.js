"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [register, setRegister] = useState(false)
  const [role, setRole] = useState("user")
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) {
      toast.error("نام کاربری و رمز عبور الزامی است")
      return
    }

    const res = await fetch("/api/kitchen/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      toast.error(data.error || "اطلاعات ورود نادرست است")
      return
    }

    document.cookie = `authIn=true; path=/`
    document.cookie = `role=${data.user.role}; path=/`
    document.cookie = `username=${data.user.username}; path=/`

    // role-based redirect
    if (data.user.role === "admin") router.push("kitchen/dashboard")
    else router.push("kitchen/dashboard/form")
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!username || !password || !confirmPassword) {
      toast.error("همه فیلدها الزامی هستند")
      return
    }
    if (password !== confirmPassword) {
      toast.error("پسورد ها یکی نیستند")
      return
    }

    const res = await fetch("/api/kitchen/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    })

    if (res.ok) {
      toast.success("کاربر جدید با موفقیت ثبت شد")
      setRegister(false)
      setUsername("")
      setPassword("")
      setConfirmPassword("")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-xl font-bold mb-6 text-center">
          ثبت نام کاربر جدید
        </h2>

        <input
          className="w-full border p-2 mb-4 rounded"
          placeholder="نام کاربری"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-2 mb-4 rounded"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-2 mb-4 rounded"
          placeholder="تکرار رمز عبور"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border p-2 mb-6 rounded">
          <option value="user">user</option>

          <option value="admin">admin</option>
        </select>

        <button className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700">
          ذخیره اطلاعات
        </button>
      </form>
    </div>
  )
}
