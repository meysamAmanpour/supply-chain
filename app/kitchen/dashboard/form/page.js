"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

import DatePicker from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"

import dayjs from "dayjs"
import jalaliday from "jalaliday"

export default function MaterialForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [logToday, setLogToday] = useState("")

  // dayjs.extend(jalaliday)
  // const todayDate = dayjs().calendar("jalali").format("YYYY/MM/DD")

  const [form, setForm] = useState({
    materialName: "",
    quantity: "",
    unit: "",
    receiver: "",
    logDate: "",
    date: "",
  })

  useEffect(() => {
    const today = new Date()
    const formatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    const jalaliToday = formatter.format(today)
    setLogToday(jalaliToday)
    setForm((prev) => ({ ...prev, logDate: jalaliToday }))
  }, [])

  console.log(form)

  const [username, setUsername] = useState("")

  // 🔹 گرفتن کاربر جاری از cookie
  useEffect(() => {
    const cookieUser = document.cookie
      .split("; ")
      .find((row) => row.startsWith("username="))
      ?.split("=")[1]

    if (!cookieUser) {
      router.push("/in/login")
      return
    }
    const decoded = decodeURIComponent(cookieUser)
    setUsername(decoded)
    setForm((prev) => ({ ...prev, receiver: decoded }))
  }, [router])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    console.log(form.logDate === form.date)
    if (Object.values(form).some((v) => v === "")) {
      toast.error("همه فیلدها الزامی هستند ⛔")
      setLoading(false)
      return
    }

    const res = await fetch("/api/kitchen/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, receiver: username }),
    })
    console.log(form.date === form.logDate)
    if (res.ok) {
      toast.success("با موفقیت ثبت شد")
      setForm({
        materialName: "",
        quantity: "",
        unit: "",
        receiver: username,
        logDate: logToday,
        date: "",
      })
    } else {
      toast.error("خطا در ثبت اطلاعات")
    }

    setLoading(false)
  }

  return (
    <div className="p-6">
      <button
        onClick={async () => {
          if (!confirm("خارج می شوید؟")) return

          await fetch("/api/kitchen/logout", { method: "POST" })
          router.push("/kitchen/login")
        }}
        className="ms-4 text-lg bg-red-500 text-gray-900 p-1 px-4 rounded hover:shadow shadow-pink-800 transition-all duration-500">
        خروج
      </button>

      <h2 className=" w-120 mx-auto p-1 rounded text-2xl  text-center font-semibold mb-6">
        ثبت ورود مواد اولیه
      </h2>

      <form
        className="space-y-4 bg-gray-300 w-160 p-8 rounded-2xl hover:shadow-lg shadow-black mx-auto transition-all duration-300"
        onSubmit={handleSubmit}>
        {Object.keys(form).map((key) =>
          key === "date" ? (
            <DatePicker
              key={key}
              calendar={persian}
              locale={persian_fa}
              value={form[key]}
              placeholder="تاریخ"
              onChange={
                (d) =>
                  setForm((prev) => ({
                    ...prev,
                    date: d?.format("YYYY/MM/DD") || "",
                  }))
                // setForm({ ...form, date: d.toDate().getTime() })
              }
              inputClass="w-144 items-center justify-center  border p-2 mb-4 rounded hover:bg-sky-100 bg-gray-100 text-xl"
            />
          ) : key === "logDate" ? (
            <DatePicker
              type="hidden"
              key={key}
              calendar={persian}
              locale={persian_fa}
              value={form.logDate}
              disabled
              placeholder="تاریخ"
              inputClass="w-144 items-center justify-center  border p-2 mb-4 rounded hover:bg-sky-100 bg-gray-100 text-xl"
            />
          ) : (
            <input
              key={key}
              name={key}
              type="text"
              placeholder={key}
              value={key === "receiver" ? username : form[key]}
              onChange={handleChange}
              disabled={key === "receiver"}
              className=" w-full items-center justify-center  border p-2 mb-4 rounded hover:bg-sky-100 bg-gray-100 text-xl"
            />
          ),
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700">
          {!loading ? "ثبت" : "در حال ذخیره..."}
        </button>
      </form>
    </div>
  )
}
