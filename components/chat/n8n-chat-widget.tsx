'use client'

import { useEffect } from 'react'
import '@n8n/chat/style.css'

let chatInitialized = false

export function N8nChatWidget() {
  useEffect(() => {
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL?.trim()
    if (!webhookUrl || webhookUrl.includes('your-n8n') || chatInitialized) return
    chatInitialized = true

    // Import dinámico: @n8n/chat usa APIs de navegador (Vue) que fallan
    // si se evalúan durante el renderizado en el servidor (SSR).
    import('@n8n/chat').then(({ createChat }) => {
      createChat({
        webhookUrl,
        mode: 'window',
        showWelcomeScreen: false,
        initialMessages: [
          '¡Hola! 👋',
          'Soy el asistente veterinario de Kany. ¿En qué puedo ayudarte hoy?',
        ],
        i18n: {
          en: {
            title: 'Asistente Veterinario',
            subtitle: 'Resolvemos tus dudas sobre el cuidado de tu mascota.',
            footer: '',
            getStarted: 'Nueva conversación',
            inputPlaceholder: 'Escribe tu mensaje...',
            closeButtonTooltip: 'Cerrar chat',
          },
        },
      })
    })
  }, [])

  return null
}
