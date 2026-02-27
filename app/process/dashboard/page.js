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

import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts"

import DatePicker from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import ReportChart from "@/utils/reportChart"
import Panels from "@/components/Panels"
import ReportMonthlyChart from "@/utils/ReportMontlyChart"

export default function Dashboard() {
  const [materials, setMaterials] = useState([])
  const [consumerFilter, setConsumerFilter] = useState("")
  const [filtered, setFiltered] = useState([])
  const [selectedMaterial, setSelectedMaterial] = useState("")

  const router = useRouter()
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [report, setReport] = useState([])
  const [inMaterials, setInMaterials] = useState([])
  const [discrepancy, setDiscrepancy] = useState([])
  const [chart, setChart] = useState([])
  const [selectMonth, setSelectMonth] = useState("")

  const [debounceSearch, setDebounceSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const navs = [
    {
      title: "ایجاد کاربر جدید",
      link: "/process/dashboard/register",
    },
    {
      title: "ثبت مواد",
      link: "/process/dashboard/form",
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

    if (!role) router.push("/process/login")
    if (role !== "admin") router.push("/process/dashboard/form")

    fetchMaterials()
  }, [router])

  const fetchMaterials = async () => {
    try {
      const res = await fetch("/api/process/materials")
      const data = await res.json()
      setMaterials(data)
      setFiltered(data)
    } catch {
      toast.error("خطا در بارگذاری رکوردها")
    }
  }

  // const processMaterials = materials
  useEffect(() => {
    fetch("/api/in/materials")
      .then((res) => res.json())
      .then((data) => setInMaterials(data))
  }, [])

  const calculateDiscrepancy = (inList) => {
    //ایجاد فیلتر
    let resultFilter = [...materials]

    // فیلتر بازه زمانی
    if (fromDate && toDate) {
      resultFilter = resultFilter.filter(
        (m) => m.date >= fromDate && m.date <= toDate,
      )
    }

    // فیلتر تحویل گیرنده
    if (consumerFilter) {
      resultFilter = resultFilter.filter((m) => m.consumer === consumerFilter)
    }

    setFiltered(resultFilter)

    const result = {}
    //جمع مقدار ورودی برای هر مواد
    inList.map((item) => {
      if (!result[item.materialName]) {
        result[item.materialName] = { in: 0, process: 0 }
      }
      result[item.materialName].in += Number(item.quantity)
    })
    //جمع مقدار مصرفی برای هر مواد

    resultFilter.map((item) => {
      if (!result[item.materialName]) {
        result[item.materialName] = { in: 0, process: 0 }
      }
      result[item.materialName].process += Number(item.quantity)
    })
    return Object.keys(result).map((name) => ({
      materialName: name,
      in: result[name].in,
      process: result[name].process,
      remain: result[name].in - result[name].process,
      status:
        result[name].in - result[name].process > 0 &&
        result[name].in - result[name].process < 11
          ? "درحال اتمام"
          : result[name].in - result[name].process > 10
            ? "تایید"
            : "مغایرت",
    }))
  }

  //نمایش موجودی (ورودی-مصرفی)

  const remainMap = {}

  inMaterials.forEach((i) => {
    if (!remainMap[i.materialName]) remainMap[i.materialName] = 0
    remainMap[i.materialName] += Number(i.quantity)
  })

  materials.forEach((o) => {
    if (!remainMap[o.materialName]) remainMap[o.materialName] = 0
    remainMap[o.materialName] -= Number(o.quantity)
  })

  // 🔹 گرفتن لیست تحویل‌دهنده‌ها برای select
  const consumers = [...new Set(materials.map((m) => m.consumer))]

  const handleLogout = async () => {
    if (!confirm("خارج می شوید؟")) return
    await fetch("/api/process/logout", { method: "POST" })
    window.location.href = "/process/login"
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceSearch(consumerFilter)
    }, 1000) //1000ms تاخیر

    return () => {
      clearTimeout(handler)
    }
  }, [consumerFilter])

  const handleDelete = async (id) => {
    if (!confirm("آیا مطمئن هستید حذف شود؟")) return

    const res = await fetch("/api/process/materials", {
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
          (consumerFilter === "" || item.consumer.includes(debounceSearch)) &&
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
      (consumerFilter === "" || item.consumer.includes(debounceSearch)) &&
      (!fromDate || !toDate || (item.date >= fromDate && item.date <= toDate))
    )
  })

  const exportPanel = () => {
    router.push("/export/dashboard")
  }
  const enterPanel = () => {
    router.push("/in/dashboard")
  }
  const enterKitchenPanel = () => {
    router.push("/kitchen/dashboard")
  }
  //خروجی pdf
  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" })

    // اضافه کردن فونت فارسی
    doc.addFileToVFS("BNAZANB.TTF", nazaninBase64)
    doc.addFont("BNAZANB.TTF", "BNAZANB", "normal")
    doc.setFont("BNAZANB")

    // بازه زمانی گزارش

    // عنوان گزارش
    doc.setFontSize(18)
    doc.text("گزارش  مغایرت در مواد مصرفی", 105, 15, { align: "center" })

    doc.setFontSize(12)

    const from = fromDate || "_"
    const to = toDate || "_"
    const consumer = consumerFilter || "همه"

    doc.text(`از تاریخ: ${from}`, 190, 25, { align: "right" })
    doc.text(`تا تاریخ: ${to}`, 190, 32, { align: "right" })

    doc.text(`مصرف کننده:  ${consumer}`, 190, 39, { align: "right" })

    // جدول گزارش
    const tableRows = discrepancy.map((item, i) => [
      i + 1,
      item.materialName,
      item.in,
      item.process,
      item.remain,
      item.status,
    ])

    autoTable(doc, {
      head: [
        [
          "ردیف",
          "نام ماده",
          "مقدار  ورودی",
          "مقدار  مصرفی",
          "باقی مانده",
          "وضعیت",
        ],
      ],
      body: tableRows,
      startY: 45,
      styles: { font: "BNAZANB", halign: "center", fontSize: 12 },
      headStyles: {
        fillColor: [41, 25, 120],
        textColor: 255,
        fontStyle: "normal",
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 },
        6: { cellWidth: 30 },
      },
      didDrawPage: (data) => {
        doc.setFont("BNAZANB")
      },
    })

    doc.save("report.pdf")
  }
  const reportMontlyPDF = () => {
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" })

    // اضافه کردن فونت فارسی
    doc.addFileToVFS("BNAZANB.TTF", nazaninBase64)
    doc.addFont("BNAZANB.TTF", "BNAZANB", "normal")
    doc.setFont("BNAZANB")

    // بازه زمانی گزارش

    // عنوان گزارش
    doc.setFontSize(18)
    doc.text("گزارش ماهانه زنجیره تامین", 105, 15, { align: "center" })

    doc.setFontSize(12)

    // جدول گزارش
    const tableRows = filterMonthlyReport.map((item, i) => [
      i + 1,
      item.materialName,
      item.start,
      item.in,
      item.process,
      item.remain,
      item.status,
    ])

    autoTable(doc, {
      head: [
        [
          "ردیف",
          "نام ماده",
          "مانده ماه قبل",
          "مقدار  ورودی",
          "مقدار  مصرفی",
          "باقی مانده",
          "وضعیت",
        ],
      ],
      body: tableRows,
      startY: 45,
      styles: { font: "BNAZANB", halign: "center", fontSize: 12 },
      headStyles: {
        fillColor: [41, 25, 120],
        textColor: 255,
        fontStyle: "normal",
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 },
        6: { cellWidth: 20 },
      },
      didDrawPage: (data) => {
        doc.setFont("BNAZANB")
      },
    })

    doc.save("reportMontly.pdf")
  }
  // خروجی اکسل

  const downloadExcel = () => {
    // آماده سازی داده‌ها برای اکسل
    const excelData = filteredData.map((item, i) => [
      i + 1, // ردیف
      item.materialName || "", // نام ماده
      item.quantity + remainMap[item.materialName],
      item.quantity || 0, // مقدار
      item.unit || "", // واحد
      item.consumer || "", // تحویل گیرنده
      item.date || "", // تاریخ ثبت
      item.date !== item.logDate ? item.logDate : "", // تاریخ لاگ
      remainMap[item.materialName] != null ? remainMap[item.materialName] : 0,
      remainMap[item.materialName] > 0 && remainMap[item.materialName] < 11
        ? "درحال اتمام"
        : remainMap[item.materialName] > 10
          ? "OK"
          : "ERROR", // موجودی
    ])

    const header = [
      "ردیف",
      "نام ماده",
      "مقدار ورودی",
      "مقدار مصرف شده",
      "واحد",
      "تحویل گیرنده",
      "تاریخ ثبت",
      "تاریخ لاگ",
      "موجودی",
      "وضعیت",
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
      { wch: 20 }, // مقدار ورودی
      { wch: 10 }, // مقدار مصرفی
      { wch: 10 }, // واحد
      { wch: 20 }, // تحویل گیرنده
      { wch: 15 }, // تاریخ ثبت
      { wch: 15 }, // تاریخ لاگ
      { wch: 10 }, // موجودی
    ]

    // ایجاد workbook و اضافه کردن sheet
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "گزارش مواد مصرفی")

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
  //گزارش نموداری

  // ایجاد و محاسبات مغایرت
  const handleDiscrepancy = () => {
    const data = calculateDiscrepancy(inMaterials)
    setDiscrepancy(data)
  }
  const handleCloseTable = () => {
    setDiscrepancy([])
    setFiltered(materials)
  }

  //گزارش ماهانه
  const allMaterials = [
    ...inMaterials.map((i) => ({ ...i, type: "in" })),
    ...materials.map((i) => ({ ...i, type: "out" })),
  ]
  const materialOptions = [...new Set(allMaterials.map((t) => t.materialName))]

  const getMonth = (date) => date?.slice(0, 7) // YYYY/MM

  const filterMonthlyReport = selectMonth
    ? report.filter((r) => r.month === selectMonth)
    : report
  const calculateMonthlyReport = () => {
    const result = {}

    const all = [
      ...inMaterials.map((i) => ({ ...i, type: "in" })),
      ...materials.map((i) => ({ ...i, type: "out" })),
    ]

    const filteredAll = all.map((item) => item)

    filteredAll.sort((a, b) => a.date.localeCompare(b.date))

    const filteredTransactions = selectedMaterial
      ? filteredAll.filter((t) => t.materialName === selectedMaterial)
      : filteredAll

    // const materialOptions = [...new Set(filteredAll.map((t) => t.materialName))]
    //فیلتر بر اساس نام مواد
    // مرتب سازی بر اساس تاریخ

    filteredTransactions.forEach((item) => {
      const month = getMonth(item.date)
      const name = item.materialName

      if (!result[name]) result[name] = {}

      if (!result[name][month]) {
        result[name][month] = {
          start: 0,
          in: 0,
          process: 0,
          remain: 0,
        }
      }

      if (item.type === "in") result[name][month].in += Number(item.quantity)
      else result[name][month].process += Number(item.quantity)
    })

    // محاسبه start/end
    Object.keys(result).forEach((name) => {
      let lastRemain = 0

      Object.keys(result[name])
        .sort()
        .forEach((month) => {
          const m = result[name][month]
          m.start = lastRemain
          m.remain = m.start + m.in - m.process
          lastRemain = m.remain
        })
    })

    // تبدیل به آرایه جدول
    const table = []

    Object.keys(result).forEach((name) => {
      Object.keys(result[name]).forEach((month) => {
        const m = result[name][month]

        table.push({
          materialName: name,
          month,
          start: m.start,
          in: m.in,
          process: m.process,
          remain: m.remain,
          status:
            m.remain > 10 ? "تایید" : m.remain < 0 ? "خطا" : "در حال اتمام",
        })
      })
    })

    setReport(table)
  }
  const months = [...new Set(report.map((r) => r.month))]

  const handleCloseTableReportMontly = () => {
    setReport([])
  }

  //محاسبات pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)

  console.log(filterMonthlyReport)
  return (
    <main className="">
      <section className="relative w-full h-90  z-0">
        <div className="absolute w-full h-90 z-10">
          <img
            src="../../images/restaurant-kitchen.jpg"
            className="h-90 w-full"
          />
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
              className=" ms-4  bg-fuchsia-700 text-gray-900 h-10 p-1 px-4 rounded hover:shadow shadow-pink-800 transition-all duration-500">
              پنل آشپزخانه
            </button>
            <button
              onClick={exportPanel}
              className=" ms-4  bg-amber-500 text-gray-900 h-10 p-1 px-4 rounded hover:shadow shadow-pink-800 transition-all duration-500">
              پنل خروجی
            </button>
            <button
              onClick={enterPanel}
              className=" ms-4  bg-green-500 text-gray-900 h-10 p-1 px-4 rounded hover:shadow shadow-pink-800 transition-all duration-500">
              پنل ورودی
            </button>
            <button
              onClick={enterPanel}
              className=" ms-4  bg-blue-500 text-gray-900 h-10 p-1 px-4 rounded hover:shadow shadow-pink-800 transition-all duration-500">
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
            onClick={handleDiscrepancy}
            className="bg-amber-500  px-8 py-2 h-12 rounded hover:shadow shadow-pink-800 transition-all duration-500">
            گزارش کلی
          </button>
          <button
            onClick={calculateMonthlyReport}
            className="bg-amber-500  px-8 py-2 h-12 rounded hover:shadow shadow-pink-800 transition-all duration-500">
            گزارش ماهانه
          </button>

          {/* <button
            onClick={handleFilter}
            className="bg-green-600  text-white px-8 h-12 rounded hover:shadow  shadow-green-800 transition-all duration-500 ">
            اعمال فیلتر
          </button> */}

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
            value={consumerFilter}
            onChange={(e) => setConsumerFilter(e.target.value)}
            className="border px-4 h-12 rounded">
            <option value="">همه مصرف کننده ها</option>
            {consumers.map((consumer, i) => (
              <option key={i} value={consumer}>
                {consumer}
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

        {discrepancy.length > 0 && (
          <section className="flex gap-4">
            <ReportChart data={discrepancy} />

            <div className="mt-4 flex flex-col items-center  justify-center">
              <p
                className="ms-134 hover:cursor-pointer"
                onClick={handleCloseTable}>
                ❌
              </p>

              <table className="w-140 border ">
                <thead>
                  <tr className="bg-amber-200 ">
                    <th className="border p-2">نام ماده</th>
                    <th className="border p-2">مقدار مواد ورودی</th>
                    <th className="border p-2">مقدار مواد مصرفی</th>
                    <th className="border p-2">باقی مانده</th>
                    <th className="border p-2">وضعیت</th>

                    {/* <th className="border p-2"> تحویل دهنده </th> */}
                  </tr>
                </thead>
                <tbody>
                  {discrepancy.map((d, index) =>
                    d.process ? (
                      <tr key={index} className="text-center bg-blue-100">
                        <td className="border p-2">{d.materialName}</td>
                        <td className="border p-2">{d.in}</td>
                        <td className="border p-2">{d.process}</td>
                        <td className="border p-2">{d.remain}</td>
                        <td
                          className={
                            d.remain > 0 && d.remain < 11
                              ? "border border-black p-2 text-yellow-500"
                              : d.remain > 10
                                ? "text-green-500 border-black border p-2"
                                : "text-red-700 border border-black p-2"
                          }>
                          {d.remain > 0 && d.remain < 11
                            ? "درحال اتمام"
                            : d.remain > 10
                              ? "OK"
                              : "ERROR"}
                        </td>
                        {/* <td className="border p-2">
                      {receiverFilter === ""
                        ? "همه تحویل گیرنده ها"
                        : r.receiver}
                    </td> */}
                      </tr>
                    ) : (
                      ""
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {filterMonthlyReport.length > 0 && (
        <div className="flex flex-col items-center">
          <div className="flex gap-12">
            <div className="flex gap-3 mb-4">
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="border rounded-xl px-3 py-2">
                <option value="">همه مواد</option>

                {materialOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={reportMontlyPDF}
              className="bg-gray-800 text-white px-4 py-2 h-12 rounded hover:shadow shadow-pink-800 transition-all duration-500">
              دانلود گزارش PDF
            </button>
            <select
              value={selectMonth}
              onChange={(e) => setSelectMonth(e.target.value)}
              className="border  px-12 h-10 rounded   ">
              <option value="">همه ماه‌ها</option>
              {months.map((m, i) => (
                <option key={i} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <p
            className="ms-195 mb-0 hover:cursor-pointer"
            onClick={handleCloseTableReportMontly}>
            ❌
          </p>
          <table className=" w-200 text-center border  mb-8 border-2">
            <thead>
              <tr className="bg-gray-300 border ">
                <th className="border">ماه</th>
                <th className="border">نام ماده</th>
                <th className="border">موجودی از ماه قبل</th>
                <th className="border">ورودی</th>
                <th className="border">مصرف شده</th>
                <th className="border">موجودی پایان ماه</th>
                <th className="border">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {filterMonthlyReport.map((r, i) => (
                <tr key={i} className="text-center  h-8 ">
                  <td className="border ">{r.month}</td>
                  <td className="border">{r.materialName}</td>
                  <td className="border"> {r.start}</td>
                  <td className="border">{r.in}</td>
                  <td className="border">{r.process}</td>
                  <td className="border">{r.remain}</td>
                  <td className="border">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <ReportMonthlyChart data={filterMonthlyReport} />
        </div>
      )}

      {/* 🔹 جدول اصلی */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full  ">
          <thead className="bg-gray-200 ">
            <tr className="italic text-lg">
              <th className="p-3">نام ماده</th>
              <th>مقدارمصرفی</th>
              <th>واحد</th>
              <th>موجودی</th>
              <th>مصرف کننده</th>
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
                <td
                  className={
                    (remainMap[item.materialName] ?? 0) < 0
                      ? "text-red-600 font-bold"
                      : (remainMap[item.materialName] ?? 0) > 10
                        ? ""
                        : "text-yellow-600 font-bold"
                  }>
                  {remainMap[item.materialName] ?? 0}
                </td>
                <td>{item.consumer}</td>
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
                    href={`/process/dashboard/edit/${item.id}`}
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
