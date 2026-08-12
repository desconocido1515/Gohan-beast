import axios from 'axios'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(`🐉 GOHAN BEAST - FREE FIRE

Uso correcto:
.freefire <ID>

Ejemplo:
.freefire 1234567890

Muestra informacion completa del perfil de Free Fire:
- Nombre
- Nivel
- ID
- Rango actual
- Diamantes totales
- Diamantes recargados
- Nivel Prime
- Descripcion del perfil
- Me gustas del perfil
- Fecha de creacion
- Ultima conexion
- Foto de perfil`)
  }

  const id = text.trim()

  try {
    await m.react('⏳')
    await conn.sendMessage(m.chat, { text: '🔄 *Buscando perfil de Free Fire...*' }, { quoted: m })

    const apiUrl = `https://api.agatz.xyz/api/ff?userid=${encodeURIComponent(id)}`
    const response = await axios.get(apiUrl, { timeout: 10000 })
    const data = response.data

    if (!data.status || !data.data) {
      return m.reply(`❌ No se encontro el perfil.
Verifica que el ID sea correcto.`)
    }

    const user = data.data

    const info = `
🐉 GOHAN BEAST - FREE FIRE

🎮 Nombre: ${user.nickname || 'Desconocido'}
🆔 ID: ${user.id || text}
📊 Nivel: ${user.level || 'N/A'}
🏆 Rango: ${user.rank || 'N/A'}

💎 Diamantes totales: ${user.diamonds || '0'}
💎 Diamantes recargados: ${user.recharged_diamonds || user.diamonds || '0'}

👑 Nivel Prime: ${user.prime || 'Sin Prime'}
📝 Descripcion: ${user.description || 'Sin descripcion'}

❤️ Me gustas: ${user.likes || '0'}

📅 Creado: ${user.created || 'N/A'}
📆 Ultima conexion: ${user.last_online || 'N/A'}
📌 Region: ${user.region || 'N/A'}

⚡ Gohan Beast - Poder Maximo Activado`

    if (user.avatar) {
      await conn.sendMessage(m.chat, {
        image: { url: user.avatar },
        caption: info
      }, { quoted: m })
    } else {
      await m.reply(info)
    }

    await m.react('✅')
  } catch (e) {
    console.error('Error en freefire:', e)
    await m.reply(`❌ Error al buscar el perfil.
${e.message || 'Intenta con otro ID.'}`)
    await m.react('❌')
  }
}

handler.help = ['freefire']
handler.tags = ['tools']
handler.command = ['freefire', 'ff', 'mifree', 'ffid']

export default handler