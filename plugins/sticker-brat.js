import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(`🐉 GOHAN BEAST - STICKER BRAT

Uso correcto:
.brat <texto>

Ejemplo:
.brat Hola guerrero

El texto se convertira en un sticker estilo BRAT.
Fondo blanco, texto negro.`)
  }

  try {
    await m.react('⏳')
    await conn.sendMessage(m.chat, { text: '🔄 *Generando sticker Brat...*' }, { quoted: m })

    const apiUrl = `https://api.agatz.xyz/api/brat?text=${encodeURIComponent(text)}`
    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })
    
    const imageBuffer = Buffer.from(response.data)
    
    await conn.sendMessage(m.chat, {
      sticker: imageBuffer,
      packname: 'Gohan Beast',
      author: 'Dvwilker'
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error('Error en brat:', e)
    await m.reply(`❌ Error al generar el sticker.`)
    await m.react('❌')
  }
}

handler.help = ['brat']
handler.tags = ['sticker']
handler.command = ['brat']

export default handler