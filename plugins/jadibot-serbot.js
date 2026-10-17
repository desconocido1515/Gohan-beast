const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"));
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import * as ws from 'ws'
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (global.conns instanceof Array) console.log()
else global.conns = []

let rtx = `
🖥️ *VINCULACIÓN POR QR GOHAN BEAST*

👾 *Pasos para vincularte a Gohan*:
1️⃣ Abre 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 en tu teléfono  
2️⃣ Pulsa ⋮ *Más opciones* → *Dispositivos vinculados*  
3️⃣ Presiona *"Vincular un dispositivo"*  
4️⃣ Escanea el código QR que se mostrará aquí
`.trim()

let rtx2 = `
🖥️ *VINCULACIÓN POR CÓDIGO DE 8 DÍGITOS*

👾 *Pasos para vincularte a Gohan*:
1️⃣ Abre 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 en tu teléfono  
2️⃣ Pulsa ⋮ *Más opciones* → *Dispositivos vinculados*  
3️⃣ Presiona *"Vincular un dispositivo"*  
4️⃣ Selecciona *"Con número"* e introduce el código mostrado  
`.trim()

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (command === 'code') {
    if (!args[0]) {
      return m.reply(`🐉 GOHAN BEAST - SUBBOT

Uso correcto:
.code <numero>

Ejemplo:
.code 584125877491

El numero debe ser sin espacios, sin + y sin @.
El codigo se generara SOLO para ese numero.`)
    }

    let numero = args[0].replace(/[^0-9]/g, '')
    if (numero.length < 10) {
      return m.reply(`Numero invalido. Debe tener al menos 10 digitos.`)
    }

    let pathYukiJadiBot = path.join(`./${global.jadi || 'JadiBots'}`, numero)
    if (!fs.existsSync(pathYukiJadiBot)) {
      fs.mkdirSync(pathYukiJadiBot, { recursive: true })
    }

    const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
    if (subBots.length >= 30) {
      return m.reply(`No hay espacios disponibles para mas Sub-Bots. Limite: 30`)
    }

    await yukiJadiBot({
      pathYukiJadiBot,
      m,
      conn,
      args: [],
      usedPrefix,
      command: 'code',
      numero
    })
    return
  }

  if (command === 'qr') {
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
    let id = who.split('@')[0]
    let pathYukiJadiBot = path.join(`./${global.jadi || 'JadiBots'}`, id)
    if (!fs.existsSync(pathYukiJadiBot)) {
      fs.mkdirSync(pathYukiJadiBot, { recursive: true })
    }

    const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
    if (subBots.length >= 30) {
      return m.reply(`No hay espacios disponibles para mas Sub-Bots. Limite: 30`)
    }

    await yukiJadiBot({
      pathYukiJadiBot,
      m,
      conn,
      args: [],
      usedPrefix,
      command: 'qr',
      numero: null
    })
  }
}

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']

export default handler

export async function yukiJadiBot(options) {
  let { pathYukiJadiBot, m, conn, args, usedPrefix, command, numero } = options

  const isCode = command === 'code'
  const isQR = command === 'qr'

  let { version } = await fetchLatestBaileysVersion()
  const msgRetryCache = new NodeCache()
  const { state, saveCreds } = await useMultiFileAuthState(pathYukiJadiBot)

  const connectionOptions = {
    logger: pino({ level: "fatal" }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    msgRetryCache,
    browser: isCode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Gohan Beast SubBot', 'Chrome', '2.0.0'],
    version: version,
    generateHighQualityLinkPreview: true,
    defaultQueryTimeoutMs: undefined,
    keepAliveIntervalMs: 30000,
    connectTimeoutMs: 60000,
    syncFullHistory: false,
    markOnlineOnConnect: false,
    patchMessageBeforeSending: false
  };

  let sock = makeWASocket(connectionOptions)
  sock.isInit = false
  let isInit = true
  let qrSent = false
  let codeSent = false
  let notificacionEnviada = false

  async function connectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin, qr } = update

    if (isNewLogin) sock.isInit = false

    if (qr && isQR && !qrSent) {
      qrSent = true
      try {
        const qrImage = await qrcode.toBuffer(qr, { scale: 8 })
        await conn.sendMessage(m.chat, {
          image: qrImage,
          caption: rtx
        }, { quoted: m })
      } catch (e) {
        console.error('Error enviando QR:', e.message)
      }
      return
    }

    if (isCode && !codeSent && numero) {
      codeSent = true
      try {
        await new Promise(resolve => setTimeout(resolve, 3000))
        let secret = await sock.requestPairingCode(numero)
        secret = secret.match(/.{1,4}/g)?.join("-") || secret

        await conn.sendMessage(m.chat, {
          text: `
${rtx2}

🔑 *CODIGO:* ${secret}

📱 *Numero:* ${numero}

⚡ Gohan Beast - Poder Maximo Activado
          `.trim()
        }, { quoted: m })
      } catch (e) {
        console.error('Error al generar codigo:', e)
        try {
          await conn.reply(m.chat, `❌ Error al generar el codigo para ${numero}. Usa .qr en su lugar.`, m)
        } catch {}
      }
      return
    }

    const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

    if (connection === 'close') {
      if (reason === 428 || reason === 408 || reason === 500 || reason === 515) {
        console.log(chalk.yellow(`Reconectando subbot: ${path.basename(pathYukiJadiBot)}`))
        setTimeout(() => creloadHandler(true).catch(console.error), 5000)
      }
      if (reason === 405 || reason === 401 || reason === 403) {
        console.log(chalk.red(`Sesion cerrada: ${path.basename(pathYukiJadiBot)}`))
        try {
          fs.rmSync(pathYukiJadiBot, { recursive: true, force: true })
        } catch {}
        const index = global.conns.indexOf(sock)
        if (index > -1) {
          global.conns.splice(index, 1)
        }
      }
    }

    if (connection === 'open' && !notificacionEnviada) {
      notificacionEnviada = true
      let userName = sock.authState.creds.me.name || 'Anonimo'

      console.log(chalk.green(`Subbot conectado: ${userName} (${path.basename(pathYukiJadiBot)})`))

      sock.isInit = true

      const yaExiste = global.conns.some(c => c.user?.jid === sock.user?.jid)
      if (!yaExiste) {
        global.conns.push(sock)
      }

      try {
        await conn.sendMessage(m.chat, {
          text: `
🐉 *SUBBOT CONECTADO* 🐉

Usuario: ${userName}
Numero: ${path.basename(pathYukiJadiBot)}
Fecha: ${new Date().toLocaleString()}

El subbot esta listo.
          `.trim()
        }, { quoted: m })
      } catch (e) {
        console.error('Error al notificar subbot:', e)
      }

      await joinChannels(sock)
    }
  }

  let handlerMod = await import('../handler.js')
  let creloadHandler = async function (restatConn) {
    try {
      const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
      if (Object.keys(Handler || {}).length) handlerMod = Handler
    } catch (e) {
      console.error('Error recargando handler:', e)
    }

    if (restatConn) {
      const oldChats = sock.chats
      try { sock.ws.close() } catch { }
      sock.ev.removeAllListeners()
      sock = makeWASocket(connectionOptions, { chats: oldChats })
      isInit = true
    }

    if (!isInit) {
      sock.ev.off("messages.upsert", sock.handler)
      sock.ev.off("connection.update", sock.connectionUpdate)
      sock.ev.off('creds.update', sock.credsUpdate)
    }

    sock.handler = handlerMod.handler.bind(sock)
    sock.connectionUpdate = connectionUpdate.bind(sock)
    sock.credsUpdate = saveCreds.bind(sock, true)
    sock.ev.on("messages.upsert", sock.handler)
    sock.ev.on("connection.update", sock.connectionUpdate)
    sock.ev.on("creds.update", sock.credsUpdate)
    isInit = false
    return true
  }

  creloadHandler(false)
}

async function joinChannels(conn) {
  for (const channelId of Object.values(global.ch || {})) {
    await conn.newsletterFollow(channelId).catch(() => {})
  }
}