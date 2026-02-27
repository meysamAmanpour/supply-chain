import bcrypt from "bcryptjs"
import fs from "fs"
import path from "path"

const filePath = path.join(process.cwd(), "data/enterkitchenUsers.json")

export async function POST(req) {
  const { username, password, role } = await req.json()

  // 🔑 هش پسورد
  const hashedPassword = await bcrypt.hash(password, 10) // 10 = salt rounds

  const users = JSON.parse(fs.readFileSync(filePath, "utf-8"))
  users.push({ username, password: hashedPassword, role })

  fs.writeFileSync(filePath, JSON.stringify(users, null, 2), "utf-8")

  return new Response(JSON.stringify({ success: true }), { status: 200 })
}
