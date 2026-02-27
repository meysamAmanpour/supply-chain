import { NextResponse } from "next/server"

export function middleware(req) {
  const { pathname } = req.nextUrl

  const authIn = req.cookies.get("authIn")?.value
  const authOut = req.cookies.get("authOut")?.value

  if (
    pathname.startsWith("/in/login") ||
    pathname.startsWith("/export/login")
  ) {
    return NextResponse.next()
  }

  /* =======================
     مسیر ورود مواد
  ======================= */
  if (pathname.startsWith("/in")) {
    if (!authIn) {
      return NextResponse.redirect(new URL("/in/login", req.url))
    }
    return NextResponse.next()
  }

  /* =======================
     مسیر خروج مواد
  ======================= */
  if (pathname.startsWith("/export")) {
    if (!authOut) {
      return NextResponse.redirect(new URL("/export/login", req.url))
    }
    return NextResponse.next()
  }

  /* =======================
     بقیه مسیرها
  ======================= */
  return NextResponse.next()
}

export const config = {
  matcher: ["/in/:path*", "/export/:path*"],
}

// import { NextResponse } from "next/server"

// export function middleware(req) {
//   const { pathname } = req.nextUrl

//   const auth = req.cookies.get("auth")?.value
//   const role = req.cookies.get("role")?.value

//   // مسیرهای محافظت شده
//   const protectedRoutes =
//     pathname.startsWith("/in") || pathname.startsWith("/out")

//   // اگر مسیر عمومی است
//   if (!protectedRoutes) {
//     return NextResponse.next()
//   }

//   // اگر لاگین نیست
//   if (!auth) {
//     return NextResponse.redirect(new URL("/login", req.url))
//   }

//   // 🔹 مثال دسترسی‌ها

//   // user → فقط فرم‌ها
//   if (role === "user") {
//     if (pathname === "/dashboard") {
//       return NextResponse.redirect(new URL("/in/form", req.url))
//     }
//   }

//   // admin → همه چیز
//   if (role === "admin") {
//     return NextResponse.next()
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: ["/dashboard/:path*", "/in/:path*", "/out/:path*"],
// }

// // import { NextResponse } from "next/server"

// // export function middleware(req) {
// //   const { pathname } = req.nextUrl
// //   const auth = req.cookies.get("auth")?.value
// //   const role = req.cookies.get("role")?.value

// //   if (!pathname.startsWith("/in/dashboard")) return NextResponse.next()

// //   if (!auth) return NextResponse.redirect(new URL("/in/login", req.url))

// //   // user فقط فرم
// //   if (role === "user" && pathname === "/in/dashboard") {
// //     return NextResponse.redirect(new URL("/in/dashboard/form", req.url))
// //   }

// //   return NextResponse.next()
// // }

// // export const config = {
// //   matcher: ["/in/dashboard/:path*"],
// // }
