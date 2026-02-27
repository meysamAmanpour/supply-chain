"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Home() {
  const [selectUnit, setSelectUnit] = useState(false)
  const [selectKitchen, setSelectKitchen] = useState(false)
  const router = useRouter()

  function enterPosition() {
    router.push("/in/login")
  }
  function exportPosition() {
    router.push("/export/login")
  }
  function processPosition() {
    router.push("/process/login")
  }
  function enterKitchen() {
    router.push("/kitchen/login")
  }
  function exportKitchen() {
    router.push("/kitchen/login")
  }

  return (
    <div className="flex flex-col  bg-home h-180  justify-center items-center gap-20 ">
      <div className="flex gap-6 mt-10 ">
        <button
          type="button"
          className="bg-red-500 py-2 px-6 m-2 rounded text-xl shadow-lg hover:shadow-green-950 hover:text-2xl transition-all duration-600"
          onClick={() => {
            setSelectKitchen(false)
            setSelectUnit(true)
          }}>
          واحد آماده سازی
        </button>

        <button
          type="button"
          className="bg-red-500 py-2 px-6 m-2 rounded text-xl shadow-lg hover:shadow-green-950 hover:text-2xl transition-all duration-600"
          onClick={() => {
            setSelectKitchen(true)
            setSelectUnit(false)
          }}>
          واحد آشپزخانه
        </button>
      </div>

      {selectUnit && (
        <div className="flex flex-col lg:flex-row  h-180  justify-center items-center gap-20 ">
          <button
            type="button"
            className="bg-red-500 py-2 px-6 m-2 rounded text-xl shadow-lg hover:shadow-green-950 hover:text-2xl transition-all duration-600"
            onClick={enterPosition}>
            ثبت مواد ورودی
          </button>
          <button
            type="button"
            className="bg-green-600 py-2 px-6 m-2 rounded text-xl hover:text-2xl shadow-lg hover:shadow-green-950 transition-all duration-600"
            onClick={processPosition}>
            ثبت مواد مصرفی
          </button>
          <button
            type="button"
            className="bg-amber-500 py-2 px-6 m-2 rounded text-xl shadow-lg hover:shadow-amber-950 hover:text-2xl transition-all duration-600"
            onClick={exportPosition}>
            ثبت مواد خروجی
          </button>
        </div>
      )}

      {selectKitchen && (
        <div className="flex flex-col lg:flex-row  h-180  justify-center items-center gap-40 ">
          <button
            type="button"
            className="bg-red-500 py-2 px-6 m-2 rounded text-xl shadow-lg hover:shadow-green-950 hover:text-2xl transition-all duration-600"
            onClick={enterKitchen}>
            ثبت مواد ورودی
          </button>

          <button
            type="button"
            className="bg-amber-500 py-2 px-6 m-2 rounded text-xl shadow-lg hover:shadow-amber-950 hover:text-2xl transition-all duration-600"
            // onClick={exportKitchen}>
          >
            ثبت مواد خروجی
          </button>
        </div>
      )}
    </div>
  )
}
