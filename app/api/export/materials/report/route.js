export const runtime = "nodejs"

import fs from "fs"
import path from "path"
import PDFDocument from "pdfkit"
import getStream from "get-stream"

export async function GET() {
  try {
    // مسیر JSON
    const filePath = path.join(process.cwd(), "data/enterMaterials.json")
    const materials = JSON.parse(fs.readFileSync(filePath, "utf-8"))

    const doc = new PDFDocument({ margin: 40 })

    // محتوای PDF
    doc.fontSize(18).text("گزارش مواد اولیه", { align: "center" })
    doc.moveDown()

    let total = 0
    materials.forEach((item, index) => {
      total += Number(item.quantity)
      doc
        .fontSize(12)
        .text(
          `${index + 1}) ${item.materialName} | ${item.quantity} ${item.unit} | تحویل دهنده: ${item.deliveredBy}`,
        )
    })

    doc.moveDown()
    doc.fontSize(14).text(`جمع کل: ${total}`, { align: "right" })

    doc.end()

    // گرفتن buffer کامل PDF
    const pdfBuffer = await getStream.buffer(doc)

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=materials-report.pdf",
      },
    })
  } catch (err) {
    console.error("PDF Error:", err)
    return new Response("خطا در ساخت PDF", { status: 500 })
  }
}
