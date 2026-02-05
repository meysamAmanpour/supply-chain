"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    if (res.ok) {
      document.cookie = "auth=true; path=/"
      router.push("/dashboard")
    } else {
      alert("نام کاربری یا رمز عبور اشتباه است")
    }
  }

  return (
    <div className="p-6">
      <h2>ورود به سیستم آشپزخانه</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="نام کاربری"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <br />

        <button type="submit">ورود</button>
      </form>
    </div>
  )
}
