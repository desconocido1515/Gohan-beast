const handler = async (m, { args, conn, usedPrefix }) => {
  try {

    if (!args[0]) {
      return conn.reply(
        m.chat,
        '🐉 *GOHAN BEAST — FACEBOOK* 🐉\n\n⚡ Por favor, proporciona un enlace válido de Facebook.\n\n📌 Ejemplo:\n.fb https://facebook.com/watch?v=...',
        m
      )
    }

    let data = []

    if (m.react) await m.react('🐉')

    try {
      const api = `${global.APIs.delirius.url}/download/facebook?url=${encodeURIComponent(args[0])}`
      const res = await fetch(api)
      const json = await res.json()

      if (Array.isArray(json?.data)) {
        data = json.data.map(v => v.url)
      }

    } catch (e) {
      console.log('Delirius FB error:', e.message)
    }

    if (!data.length) {
      try {
        const api = `${global.APIs.vreden.url}/api/fbdownload?url=${encodeURIComponent(args[0])}`
        const res = await fetch(api)
        const json = await res.json()

        if (Array.isArray(json?.resultado?.respuesta?.datos)) {
          data = json.resultado.respuesta.datos.map(v => v.url)
        }

      } catch (e) {
        console.log('Vreden FB error:', e.message)
      }
    }

    if (!data.length) {
      return conn.reply(
        m.chat,
        '🐉 *GOHAN BEAST* 🐉\n\n❌ No se pudo obtener el contenido del enlace.\n\n💡 Posibles causas:\n➤ El video es privado\n➤ Link incorrecto\n➤ API no disponible',
        m
      )
    }

    for (let media of data) {
      await conn.sendFile(
        m.chat,
        media,
        'facebook.mp4',
        '🐉 *GOHAN BEAST — FACEBOOK* 🐉\n\n✅ Aquí tienes tu video guerrero.\n\n⚡ Poder Máximo Activado',
        m
      )

      if (m.react) await m.react('✅')
    }

  } catch (error) {
    if (m.react) await m.react('❌')
    await m.reply(`🐉 *GOHAN BEAST* 🐉\n\n❌ Error: ${error.message}`)
  }
}

handler.command = ['facebook', 'fb', 'gohanfb']
handler.tags = ['descargas']
handler.help = ['facebook', 'fb']

export default handler