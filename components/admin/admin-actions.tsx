'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  deleteFoundPet,
  deleteVet,
  purgeStaleFoundPets,
  restoreCampaign,
  restoreVet,
  revokeCampaign,
  revokeVet,
} from '@/lib/admin/actions'

function ActionFeedback({ message, error }: { message?: string; error?: string }) {
  if (!message && !error) return null
  return (
    <p className={`mt-2 text-sm ${error ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}>
      {error ?? message}
    </p>
  )
}

export function CampaignAdminActions({
  campaignId,
  status,
}: {
  campaignId: number
  status: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ message?: string; error?: string }>({})

  function run(action: () => Promise<{ success: boolean; error?: string }>, confirmMsg: string) {
    if (!window.confirm(confirmMsg)) return
    startTransition(async () => {
      const result = await action()
      if (result.success) {
        setFeedback({ message: 'Cambios guardados.' })
        router.refresh()
      } else {
        setFeedback({ error: result.error ?? 'Error desconocido' })
      }
    })
  }

  if (status === 'revoked') {
    return (
      <div>
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => run(() => restoreCampaign(campaignId), '¿Restaurar esta campaña?')}
        >
          Restaurar
        </Button>
        <ActionFeedback {...feedback} />
      </div>
    )
  }

  return (
    <div>
      <Button
        size="sm"
        variant="destructive"
        disabled={pending}
        onClick={() =>
          run(
            () => revokeCampaign(campaignId),
            '¿Revocar esta campaña? Dejará de aceptar donaciones y no aparecerá en el listado público.',
          )
        }
      >
        Revocar
      </Button>
      <ActionFeedback {...feedback} />
    </div>
  )
}

export function VetAdminActions({
  vetId,
  listingStatus,
}: {
  vetId: number
  listingStatus: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ message?: string; error?: string }>({})

  function run(action: () => Promise<{ success: boolean; error?: string }>, confirmMsg: string) {
    if (!window.confirm(confirmMsg)) return
    startTransition(async () => {
      const result = await action()
      if (result.success) {
        setFeedback({ message: 'Cambios guardados.' })
        router.refresh()
      } else {
        setFeedback({ error: result.error ?? 'Error desconocido' })
      }
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      {listingStatus === 'revoked' ? (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => run(() => restoreVet(vetId), '¿Restaurar esta veterinaria?')}
        >
          Restaurar
        </Button>
      ) : (
        <Button
          size="sm"
          variant="destructive"
          disabled={pending}
          onClick={() =>
            run(
              () => revokeVet(vetId),
              '¿Revocar esta veterinaria? Dejará de aparecer en el directorio público.',
            )
          }
        >
          Revocar
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          run(
            () => deleteVet(vetId),
            '¿Eliminar permanentemente esta veterinaria? Esta acción no se puede deshacer.',
          )
        }
      >
        Eliminar
      </Button>
      <ActionFeedback {...feedback} />
    </div>
  )
}

export function FoundPetAdminActions({
  petId,
  stale,
}: {
  petId: number
  stale: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ message?: string; error?: string }>({})

  return (
    <div>
      <Button
        size="sm"
        variant={stale ? 'destructive' : 'outline'}
        disabled={pending}
        onClick={() => {
          if (!window.confirm('¿Eliminar este registro de mascota encontrada?')) return
          startTransition(async () => {
            const result = await deleteFoundPet(petId)
            if (result.success) {
              setFeedback({ message: 'Eliminado.' })
              router.refresh()
            } else {
              setFeedback({ error: result.error ?? 'Error desconocido' })
            }
          })
        }}
      >
        Eliminar
      </Button>
      <ActionFeedback {...feedback} />
    </div>
  )
}

export function PurgeStaleFoundPetsButton({
  count,
  retentionDays,
}: {
  count: number
  retentionDays: number
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ message?: string; error?: string }>({})

  if (count === 0) return null

  return (
    <div>
      <Button
        variant="destructive"
        disabled={pending}
        onClick={() => {
          if (
            !window.confirm(
              `¿Eliminar ${count} registro(s) con más de ${retentionDays} días? Esta acción no se puede deshacer.`,
            )
          ) {
            return
          }
          startTransition(async () => {
            const result = await purgeStaleFoundPets()
            if (result.success) {
              setFeedback({ message: `Se eliminaron ${result.count ?? 0} registro(s).` })
              router.refresh()
            } else {
              setFeedback({ error: result.error ?? 'Error desconocido' })
            }
          })
        }}
      >
        Limpiar antiguas ({count})
      </Button>
      <ActionFeedback {...feedback} />
    </div>
  )
}
