import { Toaster } from "react-hot-toast"
import "./globals.css"

export const metadata = {
  title: "سیستم جامع زنجیره تامین",
  description: "Kitchen Inventory System",
  manifest: "/manifest.json",
}

export default function RootLayout({ children }) {
  return (
    <html lang="fa">
      <body className="bg-gray-100 text-gray-800">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
