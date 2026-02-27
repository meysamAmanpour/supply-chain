import fs from "fs"
import path from "path"

export function readData(file) {
  const filePath = path.join(process.cwd(), "data", file)
  const data = fs.readFileSync(filePath, "utf-8")
  return JSON.parse(data)
}
