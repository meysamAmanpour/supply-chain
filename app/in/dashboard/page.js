"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { redirect, useRouter } from "next/navigation"
import toast from "react-hot-toast"
import autoTable from "jspdf-autotable"
import jsPDF from "jspdf"
import { nazaninBase64 } from "@/lib/nazaninFont"

import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

import DatePicker from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import Panels from "@/components/Panels"

export default function Dashboard() {
  const [materials, setMaterials] = useState([])
  const [receiverFilter, setReceiverFilter] = useState("")
  const [filtered, setFiltered] = useState([])

  const router = useRouter()
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [report, setReport] = useState([])

  const [debounceSearch, setDebounceSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const navs = [
    {
      title: "ایجاد کاربر جدید",
      link: "/in/dashboard/register",
    },
    {
      title: "ثبت مواد",
      link: "/in/dashboard/form",
    },
    {
      title: "صفحه اصلی",
      link: "/",
    },
  ]

  useEffect(() => {
    const role = document.cookie
      .split("; ")
      .find((row) => row.startsWith("role="))
      ?.split("=")[1]

    if (!role) router.push("/in/login")
    if (role !== "admin") router.push("/in/dashboard/form")

    fetchMaterials()
  }, [router])

  const fetchMaterials = async () => {
    try {
      const res = await fetch("/api/in/materials")
      const data = await res.json()
      setMaterials(data)
      setFiltered(data)
    } catch {
      toast.error("خطا در بارگذاری رکوردها")
    }
  }
  // 🔹 گرفتن لیست تحویل‌دهنده‌ها برای select
  const receivers = [...new Set(materials.map((m) => m.receiver))]
  const handleFilter = () => {
    let result = [...materials]

    // فیلتر بازه زمانی
    if (fromDate && toDate) {
      result = result.filter((m) => m.date >= fromDate && m.date <= toDate)
    }

    // فیلتر تحویل گیرنده
    if (receiverFilter) {
      result = result.filter((m) => m.receiver === receiverFilter)
    }

    setFiltered(result)

    // 🔹 محاسبه جمع کل هر ماده
    const grouped = {}

    result.forEach((item) => {
      if (!grouped[item.materialName]) {
        grouped[item.materialName] = 0
      }
      grouped[item.materialName] += Number(item.quantity)
    })

    const reportArray = Object.keys(grouped).map((name) => ({
      materialName: name,
      total: grouped[name],
      // receiver: receiverFilter,
    }))

    setReport(reportArray)
  }

  const handleLogout = async () => {
    if (!confirm("خارج می شوید؟")) return
    await fetch("/api/in/logout", { method: "POST" })
    window.location.href = "/in/login"
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceSearch(receiverFilter)
    }, 1000) //1000ms تاخیر

    return () => {
      clearTimeout(handler)
    }
  }, [receiverFilter])

  // const handleDelete = async (id) => {
  //   if (!confirm("حذف شود؟")) return

  //   const res = await fetch("/api/in/materials", {
  //     method: "DELETE",
  //     headers: {
  //       "Content-type": "application/json",
  //     },
  //     body: JSON.stringify({ id }),
  //   })
  //   if (res.ok) {
  //     const newMatrials =
  //       materials.filter((item) => item.id !== id),
  //     setMaterials(newMatrials)

  //     const newFiltered = newMatrials.filter((item) => {
  //       return (
  //         (receiverFilter === "" || item.receiver.includes(debounceSearch)) &&
  //         (fromDate !== "" ||
  //           toDate === "" ||
  //           (item.date >= fromDate && item.date <= toDate))
  //       )
  //     })

  //     setFiltered(newFiltered)

  //     toast.success("آیتم موردمظر حذف شد")
  //   } else {
  //     toast.error("خطا در حذف آیتم")
  //   }
  // }
  const handleDelete = async (id) => {
    if (!confirm("آیا مطمئن هستید حذف شود؟")) return

    const res = await fetch("/api/in/materials", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })

    if (res.ok) {
      // آپدیت materials
      const newMaterials = materials.filter((item) => item.id !== id)
      setMaterials(newMaterials)

      // اگر از filteredData یا currentItems استفاده می‌کنی، باید دوباره محاسبه بشه
      const newFiltered = newMaterials.filter(
        (item) =>
          (receiverFilter === "" || item.receiver.includes(debounceSearch)) &&
          (fromDate !== "" ||
            toDate === "" ||
            (item.date >= fromDate && item.date <= toDate)),
      )
      setFiltered(newFiltered) // اگر state جدا داری برای filteredData

      toast.success("آیتم حذف شد")
    } else {
      toast.error("خطا در حذف آیتم")
    }
  }

  const filteredData = filtered.filter((item) => {
    return (
      (receiverFilter === "" || item.receiver.includes(debounceSearch)) &&
      (fromDate !== "" ||
        toDate === "" ||
        (item.date >= fromDate && item.date <= toDate))
    )
  })

  const exportPanel = () => {
    router.push("/export/dashboard")
  }
  const processPanel = () => {
    router.push("/process/dashboard")
  }
  const enterKitchenPanel = () => {
    router.push("/kitchen/dashboard")
  }

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" })

    // اضافه کردن فونت فارسی
    doc.addFileToVFS("BNAZANB.TTF", nazaninBase64)
    doc.addFont("BNAZANB.TTF", "BNAZANB", "normal")
    doc.setFont("BNAZANB")

    // بازه زمانی گزارش

    // عنوان گزارش
    doc.setFontSize(18)
    doc.text("گزارش مواد ورودی", 105, 15, { align: "center" })

    doc.setFontSize(12)

    const from = fromDate || "_"
    const to = toDate || "_"
    const receiver = receiverFilter || "همه"

    doc.text(`از تاریخ: ${from}`, 190, 25, { align: "right" })
    doc.text(`تا تاریخ: ${to}`, 190, 32, { align: "right" })

    doc.text(`تحویل گیرنده:  ${receiver}`, 190, 39, { align: "right" })

    // جدول گزارش
    const tableRows = report.map((item, i) => [
      i + 1,
      item.materialName,
      item.total,
    ])

    autoTable(doc, {
      head: [["ردیف", "نام ماده", "جمع کل"]],
      body: tableRows,
      startY: 45,
      styles: { font: "BNAZANB", halign: "center", fontSize: 15 },
      headStyles: {
        fillColor: [41, 25, 120],
        textColor: 255,
        fontStyle: "normal",
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 80 },
        2: { cellWidth: 70 },
      },
      didDrawPage: (data) => {
        doc.setFont("BNAZANB")
      },
    })

    doc.save("report.pdf")
  }

  const handleCloseTable = () => {
    setReport([])
    setFiltered(materials)
  }

  //خروجی اکسل

  const downloadExcel = () => {
    // آماده سازی داده‌ها برای اکسل
    const excelData = filteredData.map((item, i) => [
      i + 1, // ردیف
      item.materialName || "", // نام ماده
      item.quantity || 0, // مقدار
      item.unit || "", // واحد
      item.receiver || "", // تحویل گیرنده
      item.date || "", // تاریخ ثبت
      item.date !== item.logDate ? item.logDate : "", // تاریخ لاگ
    ])

    const header = [
      "ردیف",
      "نام ماده",
      "مقدار  مواد ورودی",
      "واحد",
      "تحویل گیرنده",
      "تاریخ ثبت",
      "تاریخ لاگ",
    ]

    // ساخت sheet
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...excelData])

    // استایل سلول‌ها: وسط‌چین و رنگ‌بندی
    Object.keys(worksheet).forEach((cellKey) => {
      if (cellKey.startsWith("!")) return

      if (!worksheet[cellKey].s) worksheet[cellKey].s = {}
      worksheet[cellKey].s.alignment = {
        horizontal: "center",
        vertical: "center",
      }

      const col = cellKey.replace(/[0-9]/g, "") // حرف ستون
      const row = parseInt(cellKey.replace(/\D/g, "")) // شماره ردیف

      // ستون موجودی = H
      if (col === "H") {
        if (worksheet[cellKey].v < 0) {
          worksheet[cellKey].s.font = { color: { rgb: "FF0000" } }
        }
      }

      // ستون تاریخ لاگ = G (7)
      if (col === "G") {
        const dateCell = worksheet[`F${row}`] // تاریخ ثبت = F
        if (dateCell && worksheet[cellKey].v !== dateCell.v) {
          worksheet[cellKey].s.font = { color: { rgb: "FF0000" } }
        }
      }
    })

    // تنظیم عرض ستون‌ها
    worksheet["!cols"] = [
      { wch: 5 }, // ردیف
      { wch: 20 }, // نام ماده
      { wch: 10 }, // مقدار
      { wch: 10 }, // واحد
      { wch: 20 }, // تحویل گیرنده
      { wch: 15 }, // تاریخ ثبت
      { wch: 15 }, // تاریخ لاگ
      { wch: 10 }, // موجودی
    ]

    // ایجاد workbook و اضافه کردن sheet
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "گزارش مواد ورودی")

    // ذخیره فایل اکسل
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    })

    saveAs(
      new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      }),
      "materials-report.xlsx",
    )
  }

  //محاسبات pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)

  return (
    <main className="">
      <section className="relative w-full h-90  z-0">
        <div className="absolute w-full h-90  z-10">
          <img src="../../images/headerImage-1.jpg" className="h-90 w-full" />
        </div>
        <div className="absolute w-full h-90 z-100 overla bg-gray-800 opacity-40"></div>
        <nav className=" absolute w-full text-xl p-4 flex items-center justify-between z-100000">
          {/* <div className="flex gap-12">
            <button
              onClick={handleLogout}
              className=" ms-4  bg-red-500 text-gray-900 p-1 px-4 rounded hover:shadow shadow-pink-800 transition-all duration-500">
              خروج
            </button>
            <button
              onClick={enterKitchenPanel}
              className=" ms-4  bg-fuchsia-700 text-gray-900 h-10 p-1 px-4 rounded hover:shadow shadow-amber-900 transition-all duration-500">
              پنل آشپزخانه
            </button>
            <button
              onClick={exportPanel}
              className=" ms-4  bg-amber-500 text-gray-900 h-10 p-1 px-4 rounded hover:shadow shadow-amber-900 transition-all duration-500">
              پنل خروجی
            </button>
            <button
              onClick={processPanel}
              className=" ms-4  bg-blue-500 text-gray-900 h-10 p-1 px-4 rounded hover:shadow shadow-blue-900 transition-all duration-500">
              پنل مصرفی
            </button>
          </div> */}
          <div className="flex gap-12">
            <button
              onClick={handleLogout}
              className=" ms-4  bg-red-500 text-gray-900 p-1 px-4 rounded hover:shadow shadow-pink-800 transition-all duration-500">
              خروج
            </button>
            <Panels />
          </div>

          <div className="flex gap-6 mx-auto ">
            {navs.map((item) => (
              <Link
                key={item.title}
                href={item.link}
                className="text-white hover:text-green-500 text-2xl">
                {item.title}
              </Link>
            ))}
          </div>

          <div className="text-white p-4">
            <p>LOGO</p>
          </div>
        </nav>
        <div className="absolute z-1000 w-full h-90 flex items-center justify-center text-5xl text-white opacity-60 font-extrabold shadow-2xl text-shadow-amber-600">
          <h1 className="h1-titr shadow-xl text-shadow-black">
            سامانه جامع مدیریت زنجیره تامین
          </h1>
        </div>
      </section>

      {/* <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleLogout}
          className=" ms-4 text-lg bg-red-500 text-gray-900 p-1 px-4 rounded hover:shadow shadow-pink-800 transition-all duration-500">
          خروج
        </button>
        <button
          onClick={exportPanel}
          className=" ms-4 text-lg bg-amber-500 text-gray-900 h-10 p-1 px-4 rounded hover:shadow shadow-pink-800 transition-all duration-500">
          پنل خروجی
        </button>
        <button
          onClick={downloadPDF}
          className="bg-gray-800 text-white px-4 py-2 h-10 rounded hover:shadow shadow-pink-800 transition-all duration-500">
          دانلود گزارش PDF
        </button>

        <Link
          href="/in/dashboard/form"
          className="bg-gray-800 text-white px-4 py-2 h-10 rounded hover:shadow shadow-pink-800 transition-all duration-500">
          + ثبت مواد
        </Link>
        <Link
          href="/in/dashboard/register"
          className="bg-green-600 text-white px-4 py-2 h-10 rounded hover:bg-sky-400 hover:text-black transition-all duration-300">
          ثبت کاربر جدید
        </Link>
      </div> */}
      {/* <div>
        <h1 className="h1-titr text-xl text-center font-bold">
          پنل مدیریت زنجیره تامین
        </h1>
      </div> */}
      <div className="  bg-gray-300 p-4 rounded mt-6 mb-6">
        <h3 className=" w-60 mx-auto text-center rounded bg-gray-300 p-1  font-bold text-2xl mb-4">
          گزارش پیشرفته
        </h3>
        <div className="flex justify-center gap-4 mb-4  flex-wrap">
          <button
            onClick={downloadExcel}
            className="bg-green-700 text-white px-4 py-2 h-12 rounded hover:shadow shadow-pink-800 transition-all duration-500">
            خروجی Excel
          </button>
          <button
            onClick={downloadPDF}
            className="bg-gray-800 text-white px-4 py-2 h-12 rounded hover:shadow shadow-pink-800 transition-all duration-500">
            دانلود گزارش PDF
          </button>
          <button
            onClick={handleFilter}
            className="bg-green-600  text-white px-8 h-12 rounded hover:shadow  shadow-green-800 transition-all duration-500 ">
            اعمال فیلتر
          </button>

          <DatePicker
            calendar={persian}
            locale={persian_fa}
            value={fromDate}
            placeholder="از تاریخ "
            onChange={(date) => setFromDate(date?.format("YYYY/MM/DD"))}
            // onChange={(date) => setFromDate(date?.toDate().getTime())}
            inputClass="w-full items-center justify-center  border p-2 mb-4 rounded hover:bg-sky-100 bg-gray-100 text-xl"
          />

          <DatePicker
            calendar={persian}
            locale={persian_fa}
            value={toDate}
            placeholder="تا تاریخ "
            onChange={(date) => setToDate(date?.format("YYYY/MM/DD"))}
            // onChange={(date) => setToDate(date?.toDate().getTime())}
            inputClass="w-full items-center justify-center  border p-2 mb-4 rounded hover:bg-sky-100 bg-gray-100 text-xl"
          />

          {/* <input
            className="border p-2 rounded"
            // className="bg-gray-200 py-1 px-4 border border-gray-600 rounded-lg text-lg text-right focus:outline-none hover:bg-sky-100"
            type="date"
            placeholder="از ناریخ "
            name="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          /> */}
          {/* <input
            className="border p-2 rounded"
            type="date"
            placeholder="تا ناریخ "
            name="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          /> */}
          <select
            value={receiverFilter}
            onChange={(e) => setReceiverFilter(e.target.value)}
            className="border px-4 h-12 rounded">
            <option value="">همه تحویل‌ گیرنده ها</option>
            {receivers.map((receiver, i) => (
              <option key={i} value={receiver}>
                {receiver}
              </option>
            ))}
          </select>
          {/* <input
          className="bg-gray-200 py-1 px-4 border border-gray-600 rounded-lg text-lg text-right hover:bg-sky-100 focus:outline-none"
          type="text"
          placeholder="تحویل دهنده"
          name="supplier"
          value={receiverFilter}
          onChange={(e) => setReceiverFilter(e.target.value)}
        /> */}
        </div>

        {/* 🔹 جدول جمع کل */}
        {report.length > 0 && (
          <div className="mt-4 flex flex-col items-center  justify-center">
            <p
              className="ms-93 hover:cursor-pointer"
              onClick={handleCloseTable}>
              ❌
            </p>
            <table className="w-100 border ">
              <thead>
                <tr className="bg-gray-200 ">
                  <th className="border p-2">نام ماده</th>
                  <th className="border p-2">جمع کل مقدار</th>
                  {/* <th className="border p-2"> تحویل دهنده </th> */}
                </tr>
              </thead>
              <tbody>
                {report.map((r, index) => (
                  <tr key={index} className="bg-green-300">
                    <td className="border p-2">{r.materialName}</td>
                    <td className="border p-2">{r.total}</td>
                    {/* <td className="border p-2">
                      {receiverFilter === ""
                        ? "همه تحویل گیرنده ها"
                        : r.receiver}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* 🔹 جدول اصلی */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full  ">
          <thead className="bg-gray-200 ">
            <tr className="italic text-lg">
              <th className="p-3">نام ماده</th>
              <th>مقدار</th>
              <th>واحد</th>
              <th>تحویل‌گیرنده</th>
              <th>تاریخ</th>
              <th> تاریخ ثبت</th>
              <th>عملیات </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.id} className="border-t text-center text-gray-700">
                <td className="p-2">{item.materialName}</td>
                <td>{item.quantity}</td>
                <td>{item.unit}</td>
                <td>{item.receiver}</td>
                <td>{item.date}</td>
                <td className={"text-red-800"}>
                  {item.date === item.logDate ? "" : item.logDate}
                </td>
                <td className="flex gap-2 justify-center items-center">
                  <button
                    className=" font-semibold rounded-xl ms-4 w-10 h-6 m-2 hover:text-red-500 text-black  hover:shadow hover:cursor-pointer "
                    onClick={() => handleDelete(item.id)}>
                    ❌
                  </button>
                  <Link
                    href={`/in/dashboard/edit/${item.id}`}
                    className=" hover:cursor-pointer">
                    <img
                      src="../edit.webp"
                      className="w-12 h-10"
                      alt="ویرایش"
                    />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50">
            قبلی
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1 ? "bg-gray-800 text-white" : ""
              }`}>
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50">
            بعدی
          </button>
        </div>
      </div>
    </main>
  )
}
