import fs from "fs"
import path from "path"

const filePath = path.join(process.cwd(), "data/enterMaterialsKitchen.json")

const readData = () => JSON.parse(fs.readFileSync(filePath, "utf-8"))

const writeData = (data) =>
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")

export async function GET() {
  return Response.json(readData())
}

export async function POST(req) {
  const data = await req.json()
  const materials = readData()

  materials.push({ ...data, id: Date.now() })
  writeData(materials)

  return Response.json({ success: true })
}

export async function DELETE(req) {
  const { id } = await req.json()
  const materials = readData().filter((item) => item.id !== id)

  writeData(materials)
  return Response.json({ success: true })
}

export async function PUT(req) {
  const updated = await req.json()
  const materials = readData().map((item) =>
    item.id === updated.id ? updated : item,
  )

  writeData(materials)
  return Response.json({ success: true })
}
