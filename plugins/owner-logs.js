import fs from 'fs'
import path from 'path'
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
    
    const textoCompleto = `╔════════════════════╗\n║  ${titulo}  ║\n╚════════════════════╝\n\n${ultimasLineas}`

    await conn.sendMessage(m.chat, { text: textoCompleto }, { quoted: m })
    await m.react('✅')

  } catch (e) {
    console.error(e)
    m.reply('Error al enviar los logs.')
    await m.react('❌')
  }
}

handler.help = ['logs', 'errores']
handler.tags = ['owner']
handler.command = ['logs', 'errores']
handler.rowner = true

export default handler