console.clear()
console.log('🐉⚡ Iniciando Gohan Beast Bot - Modo Bestia Activado ⚡🐉')

import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)

// Banner principal épico de Gohan Bestia
cfonts.say('🐉 GOHAN BEAST ⚡', {
  font: 'block',
  align: 'center',
  gradient: ['red', 'yellow'],
  background: 'Black',
  letterSpacing: 1,
  lineHeight: 1,
  space: true,
  maxLength: '0',
  env: 'node'
})

// Línea de poder (efecto visual)
console.log('\x1b[36m%s\x1b[0m', '═' * 60)
console.log('\x1b[33m%s\x1b[0m', '   ⚡ MODO BESTIA ACTIVADO - PODER MÁXIMO ⚡')
console.log('\x1b[36m%s\x1b[0m', '═' * 60)

// Información del creador con estilo
cfonts.say('👊 CREADO POR: WILKER OFC 👊', {
  font: 'console',
  align: 'center',
  gradient: ['cyan', 'magenta'],
  env: 'node'
})

// Cita épica de Gohan
console.log('\x1b[32m%s\x1b[0m', '\n"¡Este es mi poder definitivo! ¡GOHAN BESTIA!"')
console.log('\x1b[36m%s\x1b[0m', '═' * 60 + '\n')

let isWorking = false
let restartCount = 0

async function launch(scripts) {
  if (isWorking) return
  isWorking = true
  restartCount++

  for (const script of scripts) {
    const args = [join(__dirname, script), ...process.argv.slice(2)]

    console.log('\x1b[35m%s\x1b[0m', `🌀 Despertando el poder Bestia - Intento #${restartCount}`)
    console.log('\x1b[33m%s\x1b[0m', '⚡ Cargando poder de Gohan... ⚡\n')

    setupMaster({
      exec: args[0],
      args: args.slice(1),
    })

    let child = fork()

    child.on('exit', (code) => {
      console.log('\x1b[31m%s\x1b[0m', `\n⚠️ El poder ha disminuido temporalmente (Código: ${code})`)

      if (code === 0) {
        console.log('\x1b[32m%s\x1b[0m', '✅ Gohan Bestia se ha retirado pacíficamente')
        return
      }

      isWorking = false
      
      // Efecto de transformación Bestia
      console.log('\x1b[33m%s\x1b[0m', '🔄 Transformación Bestia reiniciándose...')
      console.log('\x1b[36m%s\x1b[0m', '⚡ ¡El poder está despertando de nuevo! ⚡\n')

      setTimeout(() => {
        launch(scripts)
      }, 1000)

      watchFile(args[0], () => {
        unwatchFile(args[0])
        console.log('\x1b[35m%s\x1b[0m', '🔄 ¡Poder Bestia actualizado! Reiniciando transformación...')
        launch(scripts)
      })
    })
    
    child.on('message', (msg) => {
      if (msg === 'ready') {
        console.log('\x1b[32m%s\x1b[0m', '✨ GOHAN BESTIA HA DESPERTADO ✨')
        console.log('\x1b[33m%s\x1b[0m', '⚡ Poder máximo alcanzado ⚡\n')
      }
    })
  }
}

// Iniciar con estilo épico
console.log('\x1b[36m%s\x1b[0m', '🌟 Invocando a Gohan Bestia... 🌟\n')

launch(['main.js'])

// Mensaje especial de transformación
setTimeout(() => {
  console.log('\x1b[35m%s\x1b[0m', `
╔════════════════════════════════════╗
║    ¡GOHAN HA ALCANZADO EL NIVEL    ║
║         💥 BESTIA 💥               ║
╚════════════════════════════════════╝
  `)
}, 2000)

// Manejo de errores épico
process.on('uncaughtException', (err) => {
  console.log('\x1b[31m%s\x1b[0m', '💥 ¡El poder es demasiado intenso! 💥')
  console.log('\x1b[33m%s\x1b[0m', '🔄 Gohan está controlando su poder...')
  console.error(err)
})

process.on('unhandledRejection', (err) => {
  console.log('\x1b[31m%s\x1b[0m', '⚡ ¡El poder Bestia está fluyendo salvajemente! ⚡')
  console.log('\x1b[33m%s\x1b[0m', '🔄 Gohan está estabilizando su energía...')
  console.error(err)
})