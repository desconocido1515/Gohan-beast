//plugins/welcome.js - VERSIÓN CON AUDIOS COMPATIBLES CON IPHONE

import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import ffmpeg from 'fluent-ffmpeg'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ========== FUNCIÓN DE AUDIO COMPATIBLE IPHONE ==========
async function enviarAudio(conn, chatId, audioUrl) {
    try {
      //  console.log(`🎵 Descargando audio: ${audioUrl}`);
        
        // 1. Descargar el OGG como stream
        const response = await axios({
            method: 'get',
            url: audioUrl,
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        // 2. Convertir OGG → MP3 en memoria (compatible iPhone)
        const stream = response.data;
        const chunks = [];

        await new Promise((resolve, reject) => {
            ffmpeg(stream)
                .toFormat('mp3')
                .audioBitrate(96)
                .on('error', reject)
                .on('end', resolve)
                .pipe()
                .on('data', chunk => chunks.push(chunk))
                .on('error', reject);
        });

        const buffer = Buffer.concat(chunks);
        //console.log(`✅ Audio convertido a MP3 (${buffer.length} bytes)`);

        // 3. Enviar como MP3 (compatible iPhone)
        await conn.sendMessage(chatId, {
            audio: buffer,
            mimetype: 'audio/mpeg',
            fileName: 'audio.mp3',
            ptt: false // Audio normal, no nota de voz
        });

        //console.log('✅ Audio enviado correctamente');
        return true;

    } catch (error) {
        console.error('❌ Error en conversión:', error.message);
        
        // Fallback: enviar como nota de voz directa
        try {
            const fallbackResponse = await fetch(audioUrl);
            const fallbackBuffer = await fallbackResponse.buffer();
            await conn.sendMessage(chatId, {
                audio: fallbackBuffer,
                mimetype: 'audio/mp4',
                ptt: true
            });
            //console.log('⚠️ Fallback: audio enviado como nota de voz');
            return true;
        } catch (_) {
            console.error('❌ Fallback también falló');
            return false;
        }
    }
}

// ========== FUNCIONES ORIGINALES ==========
async function enviarVideoComoGIF(conn, chatId, videoPath, mentions) {
    try {
        if (!fs.existsSync(videoPath)) return false
        const videoBuffer = fs.readFileSync(videoPath)
        await conn.sendMessage(chatId, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            gifPlayback: true,
            mentions: mentions
        })
        return true
    } catch (e) {
        return false
    }
}

async function getFotoPublica(conn, userId) {
    try {
        return await conn.profilePictureUrl(userId, 'image')
    } catch (error) {
        return './media/sinfoto.jpg'
    }
}

function safeUser(userId) {
    if (!userId) return null
    if (!userId.includes('@')) return null
    if (userId.length < 10) return null
    return userId
}

// ========== TEXTOS ORIGINALES ==========
const TEXTOS_DESPEDIDA = [
    '𝗡𝗨𝗡𝗖𝗔 𝗟𝗘 𝗤𝗨𝗜𝗦𝗜𝗠𝗢𝗦 𝗔𝗤𝗨𝗜 🚯',
    '𝗠𝗔𝗡𝗗𝗘𝗡𝗟𝗘 𝗣𝗢𝗟𝗡𝗜𝗧𝗢 𝗔 𝗘𝗦𝗘 𝗕𝗜𝗡𝗔𝗥𝗜𝗢 🚮',
    '𝗡𝗢 𝗦𝗜𝗥𝗩𝗜𝗢 𝗣𝗔𝗥𝗔 𝗡𝗔𝗗𝗔 😴',
    '𝗦𝗘 𝗙𝗨𝗘 𝗔 𝗠𝗢𝗥𝗗𝗘𝗥 𝗘𝗟 𝗣𝗢𝗟𝗩𝗢 💄',
    '𝗬𝗔 𝗘𝗥𝗔 𝗛𝗢𝗥𝗔, 𝗣𝗨𝗥𝗔 𝗕𝗔𝗦𝗨𝗥𝗔 𝗔𝗣𝗘𝗦𝗧𝗔𝗕𝗔 🚮',
    '𝗨𝗡𝗢 𝗠𝗘𝗡𝗢𝗦, 𝗠𝗘𝗝𝗢𝗥 𝗣𝗔𝗥𝗔 𝗘𝗟 𝗚𝗥𝗨𝗣𝗢 💯',
    '𝗦𝗘 𝗙𝗨𝗘 𝗘𝗟 𝗤𝗨𝗘 𝗡𝗔𝗗𝗜𝗘 𝗤𝗨𝗘𝗥𝗜́𝗔 😂',
    '𝗣𝗨𝗘𝗥𝗧𝗔 𝗚𝗥𝗔𝗡𝗗𝗘 𝗣𝗔𝗥𝗔 𝗟𝗢𝗦 𝗤𝗨𝗘 𝗡𝗢 𝗦𝗜𝗥𝗩𝗘𝗡 🚯',
    '𝗙, 𝗡𝗢 𝗟𝗢 𝗩𝗔𝗠𝗢𝗦 𝗔 𝗘𝗫𝗧𝗥𝗔𝗡̃𝗔𝗥 🦗',
    '𝗬𝗔 𝗡𝗢 𝗛𝗔𝗬 𝗘𝗦𝗣𝗔𝗖𝗜𝗢 𝗣𝗔𝗥𝗔 𝗙𝗥𝗔𝗖𝗔𝗦𝗔𝗗𝗢𝗦 💩'
]

const TEXTOS_BIENVENIDA = [
    '¡𝗔𝗛𝗢𝗥𝗔 𝗙𝗢𝗥𝗠𝗔𝗦 𝗣𝗔𝗥𝗧𝗘 𝗗𝗘 𝗟𝗢𝗦 𝗠𝗘𝗝𝗢𝗥𝗘𝗦! 🥇',
    '𝗣𝗥𝗘𝗦𝗘𝗡𝗧𝗔𝗧𝗘: 𝗙𝗢𝗧𝗢, 𝗡𝗢𝗠𝗕𝗥𝗘, 𝗘𝗗𝗔𝗗 𝗬 𝗦𝗜 𝗘𝗦𝗧𝗔𝗦 𝗦𝗢𝗟𝗘𝗧𝗘𝗥𝗢/𝗔 🥵',
    '𝗠𝗜𝗥𝗘𝗡 𝗔 𝗘𝗦𝗘 𝗚𝗨𝗔𝗣𝗢/𝗔 🤤',
    '¡𝗬𝗔 𝗟𝗟𝗘𝗚𝗢 𝗢𝗧𝗥𝗢 𝗔 𝗥𝗢𝗠𝗣𝗘𝗥𝗟𝗔! 💪🏻',
    '𝗖𝗨𝗜𝗗𝗔𝗗𝗢 𝗖𝗢𝗡 𝗘́𝗟/𝗘𝗹𝗹𝗮, 𝗩𝗜𝗘𝗡𝗘 𝗖𝗢𝗡 𝗧𝗢𝗗𝗢 💪🏻',
    '𝗣𝗥𝗘𝗦𝗘𝗡𝗧𝗔𝗧𝗘 𝗢 𝗧𝗘 𝗠𝗨𝗧𝗘𝗔𝗠𝗢𝗦 😂',
    '𝗘𝗖𝗛𝗔𝗟𝗘 𝗚𝗔𝗡𝗔𝗦 𝗢 𝗧𝗘 𝗦𝗔𝗖𝗔𝗠𝗢𝗦 ☠️',
    '𝗢𝗧𝗥𝗢 𝗟𝗢𝗖𝗢 𝗤𝗨𝗘 𝗦𝗘 𝗨𝗡𝗘 𝗔 𝗟𝗔 𝗟𝗢𝗖𝗨𝗥𝗔 🔥',
    '𝗣𝗥𝗘𝗦𝗘𝗡𝗧𝗔𝗧𝗘 𝗔𝗡𝗧𝗘𝗦 𝗗𝗘 𝗤𝗨𝗘 𝗧𝗘 𝗙𝗨𝗡𝗘𝗡 📃'
]

const TEXTOS_BIENVENIDA_ACCION = [
    '✨ 𝗘𝗦𝗣𝗘𝗥𝗢 𝗤𝗨𝗘 𝗗𝗜𝗦𝗙𝗥𝗨𝗧𝗘𝗦 𝗬 𝗖𝗢𝗠𝗣𝗔𝗥𝗧𝗔𝗦 𝗖𝗢𝗦𝗔𝗦 𝗜𝗡𝗖𝗥𝗘𝗜𝗕𝗟𝗘𝗦 𝗘𝗡 𝗘𝗦𝗧𝗘 𝗚𝗥𝗨𝗣𝗢. ¡𝗕𝗜𝗘𝗡𝗩𝗘𝗡𝗜𝗗𝗢/𝗔! 🎉',
    '🌸 𝗤𝗨𝗘́ 𝗕𝗢𝗡𝗜𝗧𝗢 𝗧𝗘𝗡𝗘𝗥𝗧𝗘 𝗣𝗢𝗥 𝗔𝗤𝗨𝗜́. 𝗘𝗦𝗣𝗘𝗥𝗔𝗠𝗢𝗦 𝗤𝗨𝗘 𝗧𝗘 𝗟𝗔 𝗣𝗔𝗦𝗘𝗦 𝗚𝗘𝗡𝗜𝗔𝗟. 💫',
    '🌟 𝗨𝗡𝗔 𝗡𝗨𝗘𝗩𝗔 𝗘𝗦𝗧𝗥𝗘𝗟𝗟𝗔 𝗦𝗘 𝗨𝗡𝗘 𝗔 𝗟𝗔 𝗙𝗔𝗠𝗜𝗟𝗜𝗔. ¡𝗤𝗨𝗘́ 𝗘𝗠𝗢𝗖𝗜𝗢́𝗡 𝗧𝗘𝗡𝗘𝗥𝗧𝗘! 💖',
    '💎 𝗘𝗦𝗣𝗘𝗥𝗢 𝗤𝗨𝗘 𝗦𝗜𝗥𝗩𝗔𝗦 𝗬 𝗔𝗣𝗢𝗥𝗧𝗘𝗦 𝗠𝗨𝗖𝗛𝗢 𝗘𝗡 𝗘𝗦𝗧𝗘 𝗚𝗥𝗨𝗣𝗢. ¡𝗕𝗜𝗘𝗡𝗩𝗘𝗡𝗜𝗗𝗢/𝗔! 🔥',
    '🍭 𝗕𝗜𝗘𝗡𝗩𝗘𝗡𝗜𝗗𝗢/𝗔 𝗔 𝗘𝗦𝗧𝗔 𝗛𝗘𝗥𝗠𝗢𝗦𝗔 𝗖𝗢𝗠𝗨𝗡𝗜𝗗𝗔𝗗. ¡𝗚𝗥𝗔𝗖𝗜𝗔𝗦 𝗣𝗢𝗥 𝗨𝗡𝗜𝗥𝗧𝗘! 🎀',
    '🌺 𝗤𝗨𝗘 𝗧𝗘𝗡𝗚𝗔𝗦 𝗨𝗡𝗔 𝗟𝗜𝗡𝗗𝗔 𝗘𝗦𝗧𝗔𝗗𝗜́𝗔 𝗣𝗢𝗥 𝗔𝗤𝗨𝗜́. ¡𝗔 𝗗𝗜𝗦𝗙𝗥𝗨𝗧𝗔𝗥! 🦋',
    '🎈 𝗟𝗟𝗘𝗚𝗢́ 𝗨𝗡 𝗡𝗨𝗘𝗩𝗢 𝗠𝗜𝗘𝗠𝗕𝗥𝗢 𝗣𝗔𝗥𝗔 𝗔𝗟𝗘𝗚𝗥𝗔𝗥𝗡𝗢𝗦 𝗘𝗟 𝗗𝗜́𝗔. ¡𝗕𝗜𝗘𝗡𝗩𝗘𝗡𝗜𝗗𝗢/𝗔! 🎊',
    '🍃 𝗘𝗦𝗣𝗘𝗥𝗔𝗠𝗢𝗦 𝗤𝗨𝗘 𝗔𝗣𝗥𝗘𝗡𝗗𝗔𝗦, 𝗖𝗢𝗠𝗣𝗔𝗥𝗧𝗔𝗦 𝗬 𝗧𝗘 𝗗𝗜𝗩𝗜𝗘𝗥𝗧𝗔𝗦 𝗠𝗨𝗖𝗛𝗢 𝗔𝗤𝗨𝗜́. ✨',
    '💫 𝗟𝗔 𝗙𝗔𝗠𝗜𝗟𝗜𝗔 𝗖𝗥𝗘𝗖𝗘. ¡𝗤𝗨𝗘́ 𝗕𝗨𝗘𝗡𝗢 𝗧𝗘𝗡𝗘𝗥𝗧𝗘 𝗖𝗢𝗡 𝗡𝗢𝗦𝗢𝗧𝗥𝗢𝗦! 🤗',
    '🎯 𝗕𝗜𝗘𝗡𝗩𝗘𝗡𝗜𝗗𝗢/𝗔 𝗔𝗟 𝗠𝗘𝗝𝗢𝗥 𝗚𝗥𝗨𝗣𝗢. ¡𝗘𝗦𝗣𝗘𝗥𝗢 𝗤𝗨𝗘 𝗟𝗔 𝗣𝗔𝗦𝗘𝗦 𝗜𝗡𝗖𝗥𝗘𝗜𝗕𝗟𝗘! 💪'
]

const TEXTOS_DESPEDIDA_ACCION = [
    '💀 𝗣𝗨𝗥𝗢 𝗔𝗗𝗢𝗥𝗡𝗢́ 𝗘𝗥𝗔. 𝗤𝗨𝗘 𝗦𝗘 𝗩𝗔𝗬𝗔 𝗔 𝗟𝗔 𝗣𝗨𝗧𝗔 𝗠𝗔𝗗𝗥𝗘. 🚮',
    '🗑️ 𝗕𝗔𝗦𝗨𝗥𝗔 𝗗𝗘𝗧𝗘𝗖𝗧𝗔𝗗𝗔. 𝗤𝗨𝗘 𝗡𝗨𝗡𝗖𝗔 𝗩𝗨𝗘𝗟𝗩𝗔. 🔥',
    '👻 𝗡𝗜 𝗦𝗘𝗥𝗩𝗜𝗔 𝗣𝗔𝗥𝗔 𝗔𝗗𝗢𝗥𝗡𝗢. 𝗤𝗨𝗘 𝗦𝗘 𝗩𝗔𝗬𝗔 𝗔 𝗟𝗔 𝗠𝗜𝗘𝗥𝗗𝗔. 🤮',
    '🖕 𝗢𝗧𝗥𝗢 𝗤𝗨𝗘 𝗡𝗢 𝗔𝗣𝗢𝗥𝗧𝗔𝗕𝗔 𝗡𝗔𝗗𝗔. 𝗤𝗨𝗘 𝗦𝗘 𝗩𝗔𝗬𝗔 𝗔 𝗟𝗔 𝗩𝗘𝗥𝗚𝗔. 💩',
    '🚮 𝗘𝗥𝗔 𝗣𝗨𝗥𝗢 𝗘𝗦𝗧𝗢𝗥𝗕𝗢. 𝗤𝗨𝗘 𝗦𝗘 𝗩𝗔𝗬𝗔 𝗔 𝗟𝗔 𝗣𝗨𝗧𝗔 𝗤𝗨𝗘 𝗟𝗢 𝗣𝗔𝗥𝗜𝗢. 🗿',
    '🔥 𝗡𝗜 𝗟𝗢 𝗦𝗘𝗡𝗧𝗜𝗠𝗢𝗦. 𝗘𝗥𝗔 𝗨𝗡 𝗜𝗡𝗦𝗘𝗥𝗩𝗜𝗕𝗟𝗘. 𝗤𝗨𝗘 𝗦𝗘 𝗩𝗔𝗬𝗔 𝗔 𝗟𝗔 𝗠𝗜𝗘𝗥𝗗𝗔. 😂',
    '💀 𝗙𝗔𝗡𝗧𝗔𝗦𝗠𝗔 𝗗𝗘𝗧𝗘𝗖𝗧𝗔𝗗𝗢. 𝗤𝗨𝗘 𝗦𝗘 𝗩𝗔𝗬𝗔 𝗔 𝗟𝗔 𝗣𝗨𝗧𝗔 𝗤𝗨𝗘 𝗟𝗢 𝗣𝗔𝗥𝗜𝗢. 👻',
    '🗑️ 𝗨𝗡𝗔 𝗕𝗔𝗦𝗨𝗥𝗔 𝗠𝗘𝗡𝗢𝗦. 𝗤𝗨𝗘 𝗦𝗘 𝗩𝗔𝗬𝗔 𝗔 𝗟𝗔 𝗩𝗘𝗥𝗚𝗔. 🗑️',
    '🤮 𝗡𝗨𝗡𝗖𝗔 𝗔𝗣𝗢𝗥𝗧𝗢 𝗡𝗔𝗗𝗔. 𝗤𝗨𝗘 𝗦𝗘 𝗩𝗔𝗬𝗔 𝗔 𝗟𝗔 𝗠𝗜𝗘𝗥𝗗𝗔 𝗗𝗘 𝗗𝗢𝗡𝗗𝗘 𝗩𝗜𝗡𝗢. 🚮',
    '💀 𝗣𝗨𝗥𝗢 𝗔𝗗𝗢𝗥𝗡𝗢 𝗘𝗥𝗔. 𝗤𝗨𝗘 𝗦𝗘 𝗩𝗔𝗬𝗔 𝗔 𝗟𝗔 𝗣𝗨𝗧𝗔 𝗠𝗔𝗗𝗥𝗘 𝗬 𝗡𝗢 𝗩𝗨𝗘𝗟𝗩𝗔 𝗠𝗔́𝗦. 🔥'
]

// ========== AUDIOS ==========
const AUDIO_SALIDA_URLS = [
    'https://files.catbox.moe/3yu5xi.ogg',
    'https://files.catbox.moe/qgluzi.ogg',
    'https://files.catbox.moe/z6gc2j.ogg'
]
const AUDIO_BIENVENIDA_URL = 'https://files.catbox.moe/ijf0ex.ogg'

// ========== VIDEOS ==========
let VIDEO_WELCOME = join(__dirname, 'src', 'welcome.mp4')
if (!fs.existsSync(VIDEO_WELCOME)) {
    VIDEO_WELCOME = join(__dirname, 'media', 'welcome.mp4')
}
if (!fs.existsSync(VIDEO_WELCOME)) {
    VIDEO_WELCOME = join(process.cwd(), 'welcome.mp4')
}
if (!fs.existsSync(VIDEO_WELCOME)) {
    VIDEO_WELCOME = '/home/container/src/welcome.mp4'
}

let VIDEO_BYE = join(__dirname, 'src', 'despedida.mp4')
if (!fs.existsSync(VIDEO_BYE)) {
    VIDEO_BYE = join(__dirname, 'media', 'despedida.mp4')
}
if (!fs.existsSync(VIDEO_BYE)) {
    VIDEO_BYE = join(process.cwd(), 'despedida.mp4')
}
if (!fs.existsSync(VIDEO_BYE)) {
    VIDEO_BYE = '/home/container/src/despedida.mp4'
}

// ========== FUNCIONES DE GENERACIÓN ==========
async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
    userId = safeUser(userId)
    if (!userId) return null

    const username = `@${userId.split('@')[0]}`
    
    let baseMsg = chat.sWelcome || null
    let texto
    
    if (baseMsg && baseMsg.trim() !== '') {
        texto = baseMsg
            .replace(/@user/gi, username)
            .replace(/@subject/gi, groupMetadata.subject)
            .replace(/@desc/gi, groupMetadata.desc || 'Sin descripción')
    } else {
        const textoAleatorio = TEXTOS_BIENVENIDA[Math.floor(Math.random() * TEXTOS_BIENVENIDA.length)]
        texto = `╭━━━━━━━━⋆⋆━━━━━━━━─
┃ ⏤͟͟͞͞𝗕𝗜𝗘𝗡𝗩𝗘𝗡𝗜𝗗𝗢 🌟
┃ 👤 ${username}
┃ 
┃ 𝗖𝗟𝗔𝗡 : ${groupMetadata.subject}
┃ ${textoAleatorio}
┃ ❙❘❙❙❘❙❚❙❘❙❙❚❙❘❙❘❙❚❙❘❙❙❚❙❘❙❙❘❙❚❙❘
╰━━━━━━━━⋆⋆━━━━━━━━─`
    }

    let mediaUrl = await getFotoPublica(conn, userId)
    const esVideo = chat.welcomeEsVideo || false
    
    if (chat.imgWelcome && chat.imgWelcome.trim() !== '') {
        mediaUrl = chat.imgWelcome
    }

    const buttons = [
        { buttonId: `welcome_${userId}`, buttonText: { displayText: `𝗗𝗔𝗥 𝗕𝗜𝗘𝗡𝗩𝗘𝗡𝗜𝗗𝗔 👋🏻` }, type: 1 }
    ]

    return { mediaUrl, esVideo, caption: texto, mentions: [userId], buttons }
}

async function generarDespedida({ conn, userId, groupMetadata, chat }) {
    userId = safeUser(userId)
    if (!userId) return null

    const username = `@${userId.split('@')[0]}`
    
    let baseMsg = chat.sBye || null
    let texto
    
    if (baseMsg && baseMsg.trim() !== '') {
        texto = baseMsg
            .replace(/@user/gi, username)
            .replace(/@subject/gi, groupMetadata.subject)
            .replace(/@desc/gi, groupMetadata.desc || 'Sin descripción')
    } else {
        const textoAleatorio = TEXTOS_DESPEDIDA[Math.floor(Math.random() * TEXTOS_DESPEDIDA.length)]
        texto = `╭━━━━━━━━⋆⋆━━━━━━━━─
┃ 𝗦𝗘 𝗦𝗔𝗟𝗜𝗢 𝗨𝗡𝗔 𝗕𝗔𝗦𝗨𝗥𝗔.
┃ *-1* 𝗜𝗡𝗦𝗘𝗥𝗩𝗜𝗕𝗟𝗘 🚮
┃ ${username}
┃ ${textoAleatorio}
╰━━━━━━━━⋆⋆━━━━━━━━─`
    }

    let mediaUrl = await getFotoPublica(conn, userId)
    const esVideo = chat.byeEsVideo || false
    
    if (chat.imgBye && chat.imgBye.trim() !== '') {
        mediaUrl = chat.imgBye
    }

    const buttons = [
        { buttonId: `spit_${userId}`, buttonText: { displayText: `🗡️ 𝗠𝗔𝗧𝗔𝗥 🗡️` }, type: 1 }
    ]

    return { mediaUrl, esVideo, caption: texto, mentions: [userId], buttons }
}

// ========== HANDLER PRINCIPAL ==========
const handler = m => m

handler.before = async function (m, { conn }) {
    if (!m.isGroup) return

    const chat = global.db.data.chats[m.chat]
    if (!chat) return
    if (!chat.welcome) return

    // ========== VERIFICACIÓN DE BOT PRIMARIO ==========
    const chatConfig = global.db.data.chats[m.chat] || {}
    const primaryBot = chatConfig.primaryBot
    if (primaryBot && conn.user.jid !== primaryBot) {
        console.log(`🚫 [TYPES] Bot ${conn.user.jid} no es primario en ${m.chat}, omitiendo`)
        return
    }

    const usuario = m.sender
    const users = m.messageStubParameters?.[0] || ''

    // ========== BIENVENIDA TYPE 27 ==========
    if (m.messageStubType === 27) {
        const groupMetadata = await conn.groupMetadata(m.chat)
        const data = await generarBienvenida({ conn, userId: users, groupMetadata, chat })
        
        if (data && data.mediaUrl) {
            if (data.esVideo) {
                await conn.sendMessage(m.chat, {
                    video: { url: data.mediaUrl },
                    gifPlayback: true,
                    caption: data.caption,
                    buttons: data.buttons,
                    mentions: data.mentions
                }, { quoted: null })
            } else {
                await conn.sendMessage(m.chat, {
                    image: { url: data.mediaUrl },
                    caption: data.caption,
                    buttons: data.buttons,
                    mentions: data.mentions,
                    viewOnce: true
                }, { quoted: null })
            }
        }
        
        setTimeout(() => enviarAudio(conn, m.chat, AUDIO_BIENVENIDA_URL), 1000)
        console.log(`✅ [BIENVENIDA] ${users} SE UNIÓ A ${groupMetadata.subject}`)
    }

    // ========== EXPULSADO TYPE 28 ==========
    if (m.messageStubType === 28) {
        const groupMetadata = await conn.groupMetadata(m.chat)
        const data = await generarDespedida({ conn, userId: users, groupMetadata, chat })
        
        if (data && data.mediaUrl) {
            if (data.esVideo) {
                await conn.sendMessage(m.chat, {
                    video: { url: data.mediaUrl },
                    gifPlayback: true,
                    caption: data.caption,
                    buttons: data.buttons,
                    mentions: data.mentions
                }, { quoted: null })
            } else {
                await conn.sendMessage(m.chat, {
                    image: { url: data.mediaUrl },
                    caption: data.caption,
                    buttons: data.buttons,
                    mentions: data.mentions,
                    viewOnce: true
                }, { quoted: null })
            }
        }
        
        setTimeout(async () => {
            const audioRandom = AUDIO_SALIDA_URLS[Math.floor(Math.random() * AUDIO_SALIDA_URLS.length)]
            await enviarAudio(conn, m.chat, audioRandom)
        }, 1000)
        console.log(`✅ [EXPULSADO] ${users} FUE EXPULSADO DE ${groupMetadata.subject}`)
    }

    // ========== SALIDA VOLUNTARIA TYPE 32 ==========
    if (m.messageStubType === 32) {
        const groupMetadata = await conn.groupMetadata(m.chat)
        const data = await generarDespedida({ conn, userId: users, groupMetadata, chat })
        
        if (data && data.mediaUrl) {
            if (data.esVideo) {
                await conn.sendMessage(m.chat, {
                    video: { url: data.mediaUrl },
                    gifPlayback: true,
                    caption: data.caption,
                    buttons: data.buttons,
                    mentions: data.mentions
                }, { quoted: null })
            } else {
                await conn.sendMessage(m.chat, {
                    image: { url: data.mediaUrl },
                    caption: data.caption,
                    buttons: data.buttons,
                    mentions: data.mentions,
                    viewOnce: true
                }, { quoted: null })
            }
        }
        
        setTimeout(async () => {
            const audioRandom = AUDIO_SALIDA_URLS[Math.floor(Math.random() * AUDIO_SALIDA_URLS.length)]
            await enviarAudio(conn, m.chat, audioRandom)
        }, 1000)
        console.log(`✅ [SALIDA VOLUNTARIA] ${users} SALIO DE ${groupMetadata.subject}`)
    }

    // ========== BOTONES ==========
    if (m.message?.buttonsResponseMessage) {
        const buttonId = m.message.buttonsResponseMessage.selectedButtonId
        const sender = m.sender
        const senderName = sender.split('@')[0]

        if (buttonId.startsWith('welcome_')) {
            const targetUserId = buttonId.replace('welcome_', '')
            const targetName = targetUserId.split('@')[0]
            
            const textoAleatorio = TEXTOS_BIENVENIDA_ACCION[Math.floor(Math.random() * TEXTOS_BIENVENIDA_ACCION.length)]
            const texto = `@${senderName} 𝗗𝗜𝗢́ 𝗟𝗔 𝗕𝗜𝗘𝗡𝗩𝗘𝗡𝗜𝗗𝗔 𝗔 @${targetName}\n\n${textoAleatorio}`
            
            const buttons = [
                { buttonId: `welcome_${targetUserId}`, buttonText: { displayText: `𝗗𝗔𝗥 𝗕𝗜𝗘𝗡𝗩𝗘𝗡𝗜𝗗𝗔 👋🏻` }, type: 1 }
            ]
            const mentions = [sender, targetUserId]
            
            await enviarVideoComoGIF(conn, m.chat, VIDEO_WELCOME, mentions)
            await conn.sendMessage(m.chat, {
                text: texto,
                buttons: buttons,
                mentions: mentions
            }, { quoted: null })
            await m.react('👋🏻')
            return
        }

        if (buttonId.startsWith('spit_')) {
            const targetUserId = buttonId.replace('spit_', '')
            const targetName = targetUserId.split('@')[0]
            
            const textoAleatorio = TEXTOS_DESPEDIDA_ACCION[Math.floor(Math.random() * TEXTOS_DESPEDIDA_ACCION.length)]
            const texto = `@${senderName} 𝗠𝗔𝗧𝗢́ 𝗔 @${targetName} ☠️\n\n${textoAleatorio}`
            
            const buttons = [
                { buttonId: `spit_${targetUserId}`, buttonText: { displayText: `🗡️ 𝗠𝗔𝗧𝗔𝗥 🗡️` }, type: 1 }
            ]
            const mentions = [sender, targetUserId]
            
            await enviarVideoComoGIF(conn, m.chat, VIDEO_BYE, mentions)
            await conn.sendMessage(m.chat, {
                text: texto,
                buttons: buttons,
                mentions: mentions
            }, { quoted: null })
            await m.react('🩸')
            return
        }
    }
}

export default handler
