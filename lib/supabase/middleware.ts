import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { needsOnboarding } from '@/lib/auth/onboarding'

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/callback']
const ONBOARDING_PATH = '/auth/onboarding'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('onboarding_completed, home_latitude, home_longitude')
        .eq('id', user.id)
        .maybeSingle()
    : { data: null }
  const incompleteProfile = user ? needsOnboarding(profile) : false

  if (
    user &&
    incompleteProfile &&
    pathname !== ONBOARDING_PATH &&
    !AUTH_PATHS.includes(pathname)
  ) {
    const url = request.nextUrl.clone()
    url.pathname = ONBOARDING_PATH
    return NextResponse.redirect(url)
  }

  if (user && !incompleteProfile && pathname === ONBOARDING_PATH) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (user && AUTH_PATHS.includes(pathname) && pathname !== '/auth/callback') {
    const url = request.nextUrl.clone()
    url.pathname = incompleteProfile ? ONBOARDING_PATH : '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
