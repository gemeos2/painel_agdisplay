/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

self.skipWaiting()
clientsClaim()

cleanupOutdatedCaches()

// Precache resources
precacheAndRoute(self.__WB_MANIFEST)

// Handle Push Notifications
self.addEventListener('push', (event) => {
    let data = { title: 'Nova Notificação', body: 'Você tem uma nova mensagem.' }

    if (event.data) {
        try {
            data = event.data.json()
        } catch (e) {
            data = { title: 'Nova Notificação', body: event.data.text() }
        }
    }

    const options = {
        body: data.body,
        icon: '/icon.svg', // Fallback icon
        badge: '/vite.svg', // Small icon for status bar
        data: data.url || '/', // URL to open on click
        vibrate: [100, 50, 100]
    }

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    )
})

// Handle Notification Click
self.addEventListener('notificationclick', (event) => {
    event.notification.close()

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If a window is already open, focus it
            for (const client of clientList) {
                if (client.url === event.notification.data && 'focus' in client) {
                    return client.focus()
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data)
            }
        })
    )
})
