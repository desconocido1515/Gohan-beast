import fs from 'fs'
import path from 'path'
import Jimp from 'jimp'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let handler = async (m, { conn, command }) => {
  const logFile = path.resolve(__dirname, '../database/logs.txt')
  const errorFile = path.resolve(__dirname, '../database/errores.txt')
  
  let contenido = ''
  let titulo = ''

  if (command === 'logs') {
    titulo = 'LOGS DE LA CONSOLA'
    if (!fs.existsSync(logFile)) return m.reply('No hay logs guardados aún.')
    contenido = fs.readFileSync(logFile, 'utf-8')
  } else if (command === 'errores') {
    titulo = 'ERRORES DE COMANDOS'
    if (!fs.existsSync(errorFile)) return m.reply('No hay errores registrados aún.')
    contenido = fs.readFileSync(errorFile, 'utf-8')
  }

  if (!contenido.trim()) return m.reply('El archivo está vacío.')

  const lineas = contenido.split('\n')
  const ultimasLineas = lineas.slice(-25).join('\n')

  try {
    await m.react('⏳')
    
    const width = 800
    const height = 600
    const image = new Jimp(width, height, '#1e1e1e')

    const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)
    
    const textoCompleto = `${titulo}\n\n${ultimasLineas}`
    
    image.print(font, 20, 20, {
      text: textoCompleto,
      alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
      alignmentY: Jimp.VERTICAL_ALIGN_TOP
    }, width - 40, height - 40)

    const buffer = await image.getBufferAsync(Jimp.MIME_PNG)

    await conn.sendMessage(m.chat, { image: buffer, caption: `✅ Aquí tienes: ${titulo}` }, { quoted: m })
    await m.react('✅')

  } catch (e) {
    console.error(e)
    m.reply('Error al generar la imagen. Asegúrate de tener instalado "jimp".')
    await m.react('❌')
  }
}

handler.help = ['logs', 'errores']
handler.tags = ['owner']
handler.command = ['logs', 'errores']
handler.rowner = true

export default handler