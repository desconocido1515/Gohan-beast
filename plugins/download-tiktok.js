import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`🎵 *TIKTOK DOWNLOADER - GOHAN BEAST*

🐉 *Uso:* ${usedPrefix + command} <enlace o búsqueda>

📝 *Ejemplos:* 
${usedPrefix + command} https://vm.tiktok.com/xxxxx
${usedPrefix + command} goku edit`);
    }

    await m.react('🎵');

    let query = text.trim();
    let isDirectLink = query.includes('tiktok.com') || query.includes('vm.tiktok.com');

    try {
        if (!isDirectLink) {
            const searchUrl = `https://api-gohan-v1.onrender.com/search/tiktok?q=${encodeURIComponent(query)}`;
            const searchRes = await fetch(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const searchData = await searchRes.json();

            if (!searchData.status || !searchData.resultados?.length) {
                throw new Error('No se encontraron resultados');
            }

            const video = searchData.resultados[0];
            const videoUrl = video.url || video.tiktok_url;
            
            const downloadUrl = `https://api-gohan-v1.onrender.com/download/tiktok?url=${encodeURIComponent(videoUrl)}`;
            const response = await fetch(downloadUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const data = await response.json();

            if (!data.status || !data.url) {
                throw new Error('No se pudo obtener el video');
            }

            const caption = `🎵 *TIKTOK - GOHAN BEAST*

🐉 *Título:* ${data.titulo || video.titulo || 'Sin título'}
👤 *Autor:* ${data.autor || video.autor || 'Desconocido'}
⏱️ *Duración:* ${data.duracion || video.duracion || '?'}s

> 🐉 *GOHAN BEAST MODE*`;

            await conn.sendMessage(m.chat, {
                video: { url: data.url },
                caption: caption,
                mimetype: 'video/mp4'
            }, { quoted: m });

            await m.react('✅');
            return;
        }

        await conn.sendMessage(m.chat, { text: '🐉 Procesando video...' }, { quoted: m });

        const downloadUrl = `https://api-gohan-v1.onrender.com/download/tiktok?url=${encodeURIComponent(query)}`;
        const response = await fetch(downloadUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const data = await response.json();

        if (!data.status || !data.url) {
            throw new Error('No se pudo obtener el video');
        }

        const caption = `🎵 *TIKTOK - GOHAN BEAST*

🐉 *Título:* ${data.titulo || 'Sin título'}
👤 *Autor:* ${data.autor || 'Desconocido'}
⏱️ *Duración:* ${data.duracion || '?'}s

> 🐉 *GOHAN BEAST MODE*`;

        await conn.sendMessage(m.chat, {
            video: { url: data.url },
            caption: caption,
            mimetype: 'video/mp4'
        }, { quoted: m });

        await m.react('✅');

    } catch (error) {
        console.error(error);
        await m.react('❌');
        m.reply(`🐉 *ERROR EN GOHAN BEAST*

No se pudo procesar tu solicitud.

📝 *Posibles soluciones:*
▸ Verifica que el enlace sea válido
▸ Intenta con otro video
▸ El video debe ser público

> ${error.message}`);
    }
};

handler.help = ['tiktok <url>'];
handler.tags = ['downloader'];
handler.command = ['tiktok', 'tt', 'tik'];

export default handler;