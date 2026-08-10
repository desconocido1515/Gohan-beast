import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import fluent_ffmpeg from 'fluent-ffmpeg'
import webp from 'node-webpmux'
import axios from 'axios'
import { createCanvas } from '@napi-rs/canvas'

const tmp = path.join(process.cwd(), 'tmp')
if (!fs.existsSync(tmp)) fs.mkdirSync(tmp)

async function addExif(webpSticker, packname, author) {
  const img = new webp.Image()
  const stickerPackId = crypto.randomBytes(32).toString('hex')
  const json = {
    'sticker-pack-id': stickerPackId,
    'sticker-pack-name': packname,
    'sticker-pack-publisher': author,
    'emojis': ['']
  }
  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x00, 0x00, 0x00
  ])
  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
  const exif = Buffer.concat([exifAttr, jsonBuffer])
  exif.writeUIntLE(jsonBuffer.length, 14, 4)
  await img.load(webpSticker)
  img.exif = exif
  return await img.save(null)
}

async function pngToStickerWebp(pngBuffer, packname, author) {
  const tmpFile = path.join(tmp, `${Date.now()}.png`)
  const outFile = `${tmpFile}.webp`
  await fs.promises.writeFile(tmpFile, pngBuffer)

  await new Promise((resolve, reject) => {
    fluent_ffmpeg(tmpFile)
      .input(tmpFile)
      .addOutputOptions([
        `-vcodec`, `libwebp`, `-vf`,
        `scale='min(512,iw)':min'(512,ih)':force_original_aspect_ratio=decrease,fps=15, pad=512:512:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`
      ])
      .toFormat('webp')
      .save(outFile)
      .on('error', reject)
      .on('end', resolve)
  })

  const buffer = await fs.promises.readFile(outFile)
  fs.promises.unlink(tmpFile).catch(() => {})
  fs.promises.unlink(outFile).catch(() => {})

  return await addExif(buffer, packname, author)
}

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

    let pngBuffer

    try {
      const apiUrl = `https://api.ryzumi.vip/api/canvas/brat?text=${encodeURIComponent(text)}`
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 8000 })
      pngBuffer = Buffer.from(response.data)
    } catch (apiError) {
      console.error('API brat falló, usando generador local:', apiError.message)
      pngBuffer = generateBratLocal(text)
    }

    const packname = 'Gohan Beast'
    const author = 'Dvwilker'

    const stiker = await pngToStickerWebp(pngBuffer, packname, author)

    if (!Buffer.isBuffer(stiker)) throw new Error('No se pudo generar el sticker')

    await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
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