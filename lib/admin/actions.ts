'use server'

import { revalidatePath } from 'next/cache'
import { assertAdmin, getFoundPetRetentionDays } from '@/lib/auth/admin'
import { createClient } from '@/lib/supabase/server'

export type AdminActionResult =
  | { success: true; count?: number }
  | { success: false; error: string }

function revalidateModerationPaths() {
  revalidatePath('/admin')
  revalidatePath('/admin/campaigns')
  revalidatePath('/admin/veterinarias')
  revalidatePath('/admin/encontradas')
  revalidatePath('/donaciones')
  revalidatePath('/veterinarias')
  revalidatePath('/encontradas')
  revalidatePath('/')
}

export async function revokeCampaign(
  campaignId: number,
  reason?: string,
): Promise<AdminActionResult> {
  try {
    const { userId } = await assertAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('campaigns')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoked_by: userId,
        revoke_reason: reason?.trim() || null,
      })
      .eq('id', campaignId)

    if (error) return { success: false, error: error.message }

    revalidateModerationPaths()
    return { success: true }
  } catch {
    return { success: false, error: 'No autorizado' }
  }
}

export async function restoreCampaign(campaignId: number): Promise<AdminActionResult> {
  try {
    await assertAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('campaigns')
      .update({
        status: 'normal',
        revoked_at: null,
        revoked_by: null,
        revoke_reason: null,
      })
      .eq('id', campaignId)

    if (error) return { success: false, error: error.message }

    revalidateModerationPaths()
    return { success: true }
  } catch {
    return { success: false, error: 'No autorizado' }
  }
}

export async function revokeVet(vetId: number, reason?: string): Promise<AdminActionResult> {
  try {
    const { userId } = await assertAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('vets')
      .update({
        listing_status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoked_by: userId,
        revoke_reason: reason?.trim() || null,
      })
      .eq('id', vetId)

    if (error) return { success: false, error: error.message }

    revalidateModerationPaths()
    return { success: true }
  } catch {
    return { success: false, error: 'No autorizado' }
  }
}

export async function restoreVet(vetId: number): Promise<AdminActionResult> {
  try {
    await assertAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('vets')
      .update({
        listing_status: 'active',
        revoked_at: null,
        revoked_by: null,
        revoke_reason: null,
      })
      .eq('id', vetId)

    if (error) return { success: false, error: error.message }

    revalidateModerationPaths()
    return { success: true }
  } catch {
    return { success: false, error: 'No autorizado' }
  }
}

export async function deleteVet(vetId: number): Promise<AdminActionResult> {
  try {
    await assertAdmin()
    const supabase = await createClient()

    const { error } = await supabase.from('vets').delete().eq('id', vetId)

    if (error) return { success: false, error: error.message }

    revalidateModerationPaths()
    return { success: true }
  } catch {
    return { success: false, error: 'No autorizado' }
  }
}

export async function deleteFoundPet(petId: number): Promise<AdminActionResult> {
  try {
    await assertAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('lost_pets')
      .delete()
      .eq('id', petId)
      .eq('status', 'found')

    if (error) return { success: false, error: error.message }

    revalidateModerationPaths()
    return { success: true }
  } catch {
    return { success: false, error: 'No autorizado' }
  }
}

export async function purgeStaleFoundPets(): Promise<AdminActionResult> {
  try {
    await assertAdmin()
    const supabase = await createClient()
    const days = getFoundPetRetentionDays()
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffIso = cutoff.toISOString()

    const { data, error } = await supabase
      .from('lost_pets')
      .delete()
      .eq('status', 'found')
      .lt('created_at', cutoffIso)
      .select('id')

    if (error) return { success: false, error: error.message }

    revalidateModerationPaths()
    return { success: true, count: data?.length ?? 0 }
  } catch {
    return { success: false, error: 'No autorizado' }
  }
}
