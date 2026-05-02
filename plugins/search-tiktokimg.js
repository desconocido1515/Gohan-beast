import axios from 'axios'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    let query = text ? text.trim() : (m.quoted?.text || null)
    if (!query) return conn.reply(m.chat, `🐉 *¿Qué imágenes de TikTok buscas?*\n\n> *Ejemplo:* ${usedPrefix + command} Chaewon`, m)

    await m.react('🐉')

    try {
        const { data } = await axios.get(`https://api.delirius.store/search/tiktoksearchimages?query=${encodeURIComponent(query)}`)

        if (!data.status || !data.data.length) {
            await m.react('🐉')
            return m.reply('🌀 No encontré resultados.')
        }

        const res = data.data[0]
        const fotos = res.download 

        let info = `🐉 *TIKTOK SEARCH — DvWilkerOFC*\n\n`
        info += `📝 *Descripción:* ${res.title || 'Sin descripción'}\n`
        info += `👤 *Usuario:* ${res.author}\n`
        info += `❤️ *Likes:* ${res.likes.toLocaleString()}\n`
        info += `📸 *Fotos encontradas:* ${fotos.length}\n\n`
        info += `> *By: DvWilkerOFC*`

        await conn.sendMessage(m.chat, { 
            image: { url: fotos[0] }, 
            caption: info 
        }, { quoted: m })

        if (fotos.length > 1) {
            for (let i = 1; i < fotos.length; i++) {
                if (i >= 6) break 
                await new Promise(resolve => setTimeout(resolve, 800)) 
                await conn.sendMessage(m.chat, { image: { url: fotos[i] } }, { quoted: m })
            }
        }

        await m.react('🌀')

    } catch (e) {
        await m.react('🐉')
        m.reply('🌀 Error al procesar.')
    }
}

handler.help = ['tiktokimg']
handler.tags = ['search']
handler.command = /^(tiktokimg|ttimg|ttsearch)$/i

export default handler