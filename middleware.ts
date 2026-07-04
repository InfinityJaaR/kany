import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getThirdModule, isRemovedRoute } from '@/lib/modules'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isRemovedRoute(pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const third = getThirdModule()

  if (pathname === '/precios' || pathname.startsWith('/precios/')) {
    if (third !== 'prices') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (pathname === '/veterinarias' || pathname.startsWith('/veterinarias/')) {
    if (third !== 'vets') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/precios/:path*',
    '/veterinarias/:path*',
    '/adopciones/:path*',
    '/transporte/:path*',
    '/marketplace/:path*',
    '/ia/:path*',
    '/admin/:path*',
    '/fundaciones/:path*',
    '/dashboard/:path*',
    '/roles/:path*',
    '/perros/:path*',
    '/gatos/:path*',
    '/settings/:path*',
    '/auth/:path*',
  ],
}
