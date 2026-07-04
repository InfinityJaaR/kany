export type OnboardingProfile = {
  onboarding_completed: boolean | null
  home_latitude: number | null
  home_longitude: number | null
}

export function needsOnboarding(profile: OnboardingProfile | null): boolean {
  if (!profile) return true
  return (
    profile.onboarding_completed !== true ||
    profile.home_latitude === null ||
    profile.home_longitude === null
  )
}
