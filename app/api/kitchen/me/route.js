import fs from "fs"
import path from "path"
import { NextResponse } from "next/server"

const filePath = path.join(process.cwd(), "data/enterKitchenUsers.json")

export async function GET(req) {
  const auth = req.cookies.get("auth")?.value
  const role = req.cookies.get("role")?.value

  if (!auth || !role) return NextResponse.json({}, { status: 401 })

  const username = req.cookies.get("username")?.value

  return NextResponse.json({
    user: {
      username: username || "کاربر",
      role,
    },
  })
}
