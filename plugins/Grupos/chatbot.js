// Comando: bot (escribir "bot" en el chat)

// ========== FKONTAK ==========
function getFkontak(sender) {
    return {
        key: {
            participants: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast',
            fromMe: false,
            id: 'Halo'
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD
VERSION:3.0
N:Sy;Bot;;;
FN:Bot
item1.TEL;waid=${sender.split('@')[0]}:${sender.split('@')[0]}
item1.X-ABLabel:Ponsel
END:VCARD`
            }
        },
        participant: '0@s.whatsapp.net'
    }
}
// ==========================================

// Función para formatear tiempo (formato: 0d 0h 25m 19s)
function formatearTiempo(ms) {
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
  const seconds = Math.floor((ms % (60 * 1000)) / 1000)

  return `${days}d ${hours}h ${minutes}m ${seconds}s`
}

// Inicializar uptime
function initUptime(userId) {
  if (!global.db.data.uptimes) {
    global.db.data.uptimes = {}
  }
  if (!global.db.data.uptimes[userId]) {
    global.db.data.uptimes[userId] = {
      start: Date.now()
    }
    global.db.write()
  }
}

export async function before(m, { conn }) {
  if (!m.text) return
  if (m.isBaileys) return

  const chat = global.db.data.chats[m.chat] || {}
  if (chat.primaryBot && conn.user.jid !== chat.primaryBot) return

  if (m.text.trim().toLowerCase() === 'bot') {
    const userId = conn.user.jid.split('@')[0]
    const isMainBot = conn.user.jid === global.conn.user?.jid
    
    initUptime(userId)
    
    const uptimeMs = Date.now() - global.db.data.uptimes[userId].start
    const tiempo = formatearTiempo(uptimeMs)
    
    await conn.sendMessage(m.chat, {
      text: `\`Hola estoy activo\` ☑️\n> ${tiempo}`,
      ...global.rcanal,
      ...getFkontak(m.sender)
    }, { quoted: getFkontak(m.sender) })
    return true
  }
  return
}
