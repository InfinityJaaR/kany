import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getThirdModule, isRemovedRoute } from '@/lib/modules'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const supabaseResponse = await updateSession(request)
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

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
