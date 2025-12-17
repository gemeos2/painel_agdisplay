import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Configurações manuais (carregando do .env)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env')
const envConfig = fs.readFileSync(envPath, 'utf8')

const env = {}
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) env[key.trim()] = value.trim()
})

const SUPABASE_URL = env.VITE_SUPABASE_URL
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY // Em produção usar SERVICE_ROLE_KEY
const VAPID_PUBLIC_KEY = env.VITE_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = env.VAPID_PRIVATE_KEY

if (!VAPID_PRIVATE_KEY || !VAPID_PUBLIC_KEY) {
    console.error('ERRO: Chaves VAPID não encontradas no .env')
    process.exit(1)
}

webpush.setVapidDetails(
    'mailto:admin@appdieta.com', // Email de contato para o serviço de push
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
)

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function sendPush() {
    console.log('Buscando inscrições...')

    // Buscar todas as inscrições (em produção, filtrar por usuário)
    const { data: subscriptions, error } = await supabase
        .from('push_subscriptions')
        .select('*')

    if (error) {
        console.error('Erro ao buscar inscrições:', error)
        return
    }

    if (!subscriptions || subscriptions.length === 0) {
        console.log('Nenhuma inscrição encontrada. Ative as notificações no app primeiro.')
        return
    }

    console.log(`Encontradas ${subscriptions.length} inscrições. Enviando...`)

    const payload = JSON.stringify({
        title: 'Teste do App Dieta',
        body: 'Se você está vendo isso, as notificações funcionam!',
        url: 'http://localhost:5173/app'
    })

    let successCount = 0

    for (const sub of subscriptions) {
        const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
            }
        }

        try {
            await webpush.sendNotification(pushSubscription, payload)
            console.log(`[SUCESSO] Notificação enviada para ${sub.id}`)
            successCount++
        } catch (err) {
            console.error(`[ERRO] Falha ao enviar para ${sub.id}:`, err.message)
            if (err.statusCode === 410 || err.statusCode === 404) {
                console.log('Inscrição inválida/expirada. Removendo do banco...')
                await supabase.from('push_subscriptions').delete().eq('id', sub.id)
            }
        }
    }

    console.log(`\nResumo: ${successCount} enviadas com sucesso de ${subscriptions.length} tentativas.`)
}

sendPush()
