import axios from 'axios'
import { createCanvas } from '@napi-rs/canvas'

const generateBratLocal = (text) => {
  const size = 512
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#8ACE00'
  ctx.fillRect(0, 0, size, size)

  ctx.fillStyle = '#111111'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  const padding = 40
  const maxWidth = size - padding * 2
  let fontSize = 100

  const wrapText = (fs) => {
    ctx.font = `bold ${fs}px Arial`
    const words = text.trim().split(/\s+/)
    const lines = []
    let line = ''

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word
      if (ctx.measureText(testLine).width > maxWidth && line) {
        lines.push(line)
        line = word
      } else {
        line = testLine
      }
    }
    if (line) lines.push(line)
    return lines
  }

  let lines = wrapText(fontSize)
  while (
    (lines.length * fontSize * 1.1 > size - padding * 2 ||
      lines.some((l) => ctx.measureText(l).width > maxWidth)) &&
    fontSize > 20
  ) {
    fontSize -= 4
    lines = wrapText(fontSize)
  }

  const lineHeight = fontSize * 1.1
  const totalHeight = lines.length * lineHeight
  let y = (size - totalHeight) / 2 + fontSize

  for (const line of lines) {
    ctx.font = `bold ${fontSize}px Arial`
    const lineWidth = ctx.measureText(line).width
    const x = (size - lineWidth) / 2
    ctx.fillText(line, x, y)
    y += lineHeight
  }

  return canvas.toBuffer('image/png')
}

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(`🐉 GOHAN BEAST - STICKER BRAT

Uso correcto:
.brat <texto>

Ejemplo:
.brat Hola

El texto se convertira en un sticker estilo BRAT.`)
  }

  try {
    await m.react('⏳')

    let imageBuffer

    try {
      const apiUrl = `https://api.ryzumi.vip/api/canvas/brat?text=${encodeURIComponent(text)}`
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 8000 })
      imageBuffer = Buffer.from(response.data)
    } catch (apiError) {
      console.error('API brat falló, usando generador local:', apiError.message)
      imageBuffer = generateBratLocal(text)
    }

    await conn.sendImageAsSticker(m.chat, imageBuffer, m, {
      packname: 'Gohan Beast',
      author: 'Dvwilker'
    })

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