import fs from "fs"
import path from "path"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

const filePath = path.join(process.cwd(), "data/exportSectionUsers.json")

export async function POST(req) {
  const { username, password } = await req.json()
  const users = JSON.parse(fs.readFileSync(filePath, "utf-8"))

  const user = users.find((u) => u.username === username)
  if (!user)
    return NextResponse.json(
      { error: "نام کاربری یا رمز عبور نادرست است" },
      { status: 401 },
    )

  const match = await bcrypt.compare(password, user.password)
  if (!match)
    return NextResponse.json(
      { error: "نام کاربری یا رمز عبور نادرست است" },
      { status: 401 },
    )

  const res = NextResponse.json({
    user: { username: user.username, role: user.role },
  })

  // cookie ساده برای middleware و role-based redirect
  res.cookies.set("authOut", "true", { path: "/" })
  res.cookies.set("role", user.role, { path: "/" })

  return res
}
