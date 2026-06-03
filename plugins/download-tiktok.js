import fetch from 'node-fetch';

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    if (!args.length || !args[0].includes("tiktok.com")) {
        return m.reply(`🐉 Ingresa algún *URL* válido de TikTok.\n\nEjemplo: *${usedPrefix + command}* https://vt.tiktok.com/...`);
    }

    const url = args[0];
    const apikey = "freeApikey";

    try {
        const apiUrl = `https://anabot.my.id/api/download/tiktok?url=${encodeURIComponent(url)}&apikey=${apikey}`;
        const res = await fetch(apiUrl);
        
        if (!res.ok) throw new Error(`Error en el servidor: ${res.status}`);
        
        const json = await res.json();

        if (!json.success || !json.data?.result) {
            return m.reply(`🐉 No se pudo obtener el video. Verifica que el enlace sea público.`);
        }

        const { 
            username, 
            description, 
            nowatermark, 
            video, 
            audio 
        } = json.data.result;

        const caption = `🐉 TikTok 🐉

> 🐉*Usuario:* ${username || 'Desconocido'}
> 🐉*Descripción:* ${description || 'Sin descripción'}`.trim();

        const videoUrl = nowatermark || video;

        if (videoUrl) {
            await conn.sendMessage(m.chat, { 
                video: { url: videoUrl }, 
                caption: caption
            }, { quoted: m });
        } else {
            await m.reply(`🐉 No se encontró un enlace de descarga de video.`);
        }

    } catch (e) {
        console.error(e);
        await m.reply("🐉 El servicio proceso no está disponible en este momento.");
    }
};

handler.help = ['tiktok <url>'];
handler.tags = ['downloader'];
handler.command = /^(tiktok|tt)$/i;

export default handler;