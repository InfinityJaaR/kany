import { createClient } from '@/lib/supabase/server'
import { needsOnboarding } from '@/lib/auth/onboarding'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = user
        ? await supabase
            .from('profiles')
            .select('onboarding_completed, home_latitude, home_longitude')
            .eq('id', user.id)
            .maybeSingle()
        : { data: null }
      const destination = user && needsOnboarding(profile) ? '/auth/onboarding' : next
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
}
