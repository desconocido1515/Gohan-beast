import fetch from 'node-fetch';

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`🎵 *TIKTOK DOWNLOADER - GOHAN BEAST*

🐉 *Uso:* ${usedPrefix + command} <enlace>

📝 *Ejemplo:* 
${usedPrefix + command} https://vm.tiktok.com/xxxxx

> 🐉 Envía un enlace de TikTok para descargar el video`);
    }

    await m.react('🎵');

    let query = text.trim();
    let isDirectLink = query.includes('tiktok.com') || query.includes('vm.tiktok.com');

    try {

        if (!isDirectLink) {
            const searchUrl = `https://api-gohan-v1.onrender.com/search/tiktok?query=${encodeURIComponent(query)}`;
            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();

            if (!searchData.status || !searchData.resultados?.length) {
                throw new Error('No se encontraron resultados');
            }

            // Tomar el primer resultado
            const video = searchData.resultados[0];
            const videoUrl = video.tiktok_url;
            
            const downloadUrl = `https://api-gohan-v1.onrender.com/download/tiktok?url=${encodeURIComponent(videoUrl)}`;
            const response = await fetch(downloadUrl);
            const data = await response.json();

            if (!data.status || !data.tiktok_url) {
                throw new Error('No se pudo obtener el video');
            }

            const { titulo, autor, descargar, duracion } = data;
            const videoFinalUrl = `https://api-gohan-v1.onrender.com${descargar}`;

            const caption = `🎵 *TIKTOK - GOHAN BEAST*

🐉 *Título:* ${titulo || 'Sin título'}
👤 *Autor:* ${autor || 'Desconocido'}
⏱️ *Duración:* ${duracion || '?'}s

> 🐉 *GOHAN BEAST MODE*`;

            await conn.sendMessage(m.chat, {
                video: { url: videoFinalUrl },
                caption: caption,
                mimetype: 'video/mp4'
            }, { quoted: m });

            await m.react('✅');
            return;
        }

        await conn.sendMessage(m.chat, { text: '🐉 Procesando video en GOHAN BEAST...' }, { quoted: m });

        const downloadUrl = `https://api-gohan-v1.onrender.com/download/tiktok?url=${encodeURIComponent(query)}`;
        const response = await fetch(downloadUrl);
        const data = await response.json();

        if (!data.status || !data.tiktok_url) {
            throw new Error('No se pudo obtener el video');
        }

        const { titulo, autor, cover, descargar, duracion } = data;
        const videoUrl = `https://api-gohan-v1.onrender.com${descargar}`;

        const caption = `🎵 *TIKTOK - GOHAN BEAST*

🐉 *Título:* ${titulo || 'Sin título'}
👤 *Autor:* ${autor || 'Desconocido'}
⏱️ *Duración:* ${duracion || '?'}s

> 🐉 *GOHAN BEAST MODE*`;

        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: caption,
            mimetype: 'video/mp4'
        }, { quoted: m });

        await m.react('✅');

    } catch (error) {
        console.error(error);
        await m.react('❌');
        m.reply(`🐉 *ERROR EN GOHAN BEAST*

No se pudo procesar tu solicitud.

📝 *Asegúrate de:* 
▸ Enviar un enlace válido de TikTok
▸ El video sea público

> ${error.message || 'Intenta de nuevo más tarde'}`);
    }
};

handler.help = ['tiktok <url>'];
handler.tags = ['downloader'];
handler.command = ['tiktok', 'tt', 'tik'];

export default handler;