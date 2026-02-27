"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import toast from "react-hot-toast"

import DatePicker from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"

export default function EditMaterial({ params }) {
  const { id } = useParams()

  const router = useRouter()

  const [form, setForm] = useState(null)
  useEffect(() => {
    fetch("/api/process/materials")
      .then((res) => res.json())
      .then((data) => {
        const item = data.find((i) => i.id == id)
        setForm(item)
      })
  }, [id])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    await fetch("/api/process/materials", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    router.push("/process/dashboard")
  }
  if (!form) return <p className="p-10 text-center">در حال بارگذاری...</p>

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded-xl shadow">
      <h2 className="text-lg font-bold mb-6">ویرایش مواد مصرفی</h2>

      {Object.keys(form).map((key) =>
        key === "date" ? (
          <DatePicker
            key={key}
            calendar={persian}
            locale={persian_fa}
            value={form[key]}
            placeholder="تاریخ"
            onChange={(d) => {
              setForm({ ...form, date: d?.format("YYYY/MM/DD") })
              // setForm({ ...form, date: d?.toDate().getTime() })
            }}
            inputClass="w-128 items-center justify-center  border p-2 mb-4 rounded hover:bg-sky-100 bg-gray-100 text-xl"
          />
        ) : (
          key !== "id" && (
            <input
              key={key}
              name={key}
              value={form[key]}
              disabled={key === "consumer" || key === "logDate"}
              onChange={handleChange}
              type="text"
              className={
                key === "logDate"
                  ? " bg-gray-200 text-gray-600 w-full border p-2 mb-4 rounded"
                  : "w-full border p-2 mb-4 rounded"
              }
            />
          )
        ),
      )}

      <button
        className="w-full bg-gray-800 text-white py-2 rounded"
        onClick={handleSubmit}>
        ذخیره تغییرات
      </button>
    </div>
  )
}
