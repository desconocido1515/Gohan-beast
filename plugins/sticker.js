import fs from 'fs'
import { sticker } from '../../lib/sticker.js'
import uploadFile from '../../lib/uploadFile.js'
import uploadImage from '../../lib/uploadImage.js'
import { webp2png } from '../../lib/webp2mp4.js'

// ========== FKONTAK ==========
function getFkontak(sender) {
    return {
        key: {
            participants: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast',
            fromMe: false,
            id: 'Halo'
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD
VERSION:3.0
N:Sy;Bot;;;
FN:Bot
item1.TEL;waid=${sender.split('@')[0]}:${sender.split('@')[0]}
item1.X-ABLabel:Ponsel
END:VCARD`
            }
        },
        participant: '0@s.whatsapp.net'
    }
}
// ==========================================

// 🔧 CREAR CARPETA TMP AUTOMÁTICAMENTE
const tmpDir = '/home/container/tmp'
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true })
  console.log('✅ Carpeta tmp creada automáticamente')
}
// ====================================

let handler = async (m, { conn, args }) => {
let stiker = false
let userId = m.sender
let packstickers = global.db.data.users[userId] || {}
let texto1 = packstickers.text1 || global.packsticker
let texto2 = packstickers.text2 || global.packsticker2

const fkontak = getFkontak(m.sender)

try {
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || q.mediaType || ''
let txt = args.join(' ')
if (/webp|image|video/g.test(mime) && q.download) {
if (/video/.test(mime) && (q.msg || q).seconds > 16)
return conn.sendMessage(m.chat, {
    text: '✧ El video no puede durar más de *15 segundos*',
    ...global.rcanal,
    ...fkontak
}, { quoted: fkontak })
let buffer = await q.download()
await m.react('🕓')
let marca = txt ? txt.split(/[\u2022|]/).map(part => part.trim()) : [texto1, texto2]
stiker = await sticker(buffer, false, marca[0], marca[1])
} else if (args[0] && isUrl(args[0])) {
let buffer = await sticker(false, args[0], texto1, texto2)
stiker = buffer
} else {
return conn.sendMessage(m.chat, {
    text: 'Envía una imagen o vídeo para convertir en sticker',
    ...global.rcanal,
    ...fkontak
}, { quoted: fkontak })
}} catch (e) {
await conn.sendMessage(m.chat, {
    text: '⚠︎ Ocurrió un Error: ' + e.message,
    ...global.rcanal,
    ...fkontak
}, { quoted: fkontak })
await m.react('✖️')
} finally {
if (stiker) {
await conn.sendMessage(m.chat, {
    sticker: stiker,
    ...global.rcanal,
    ...fkontak
}, { quoted: fkontak })
await m.react('✅')
}}}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = ['s', 'sticker']

export default handler

const isUrl = (text) => {
return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(jpe?g|gif|png)/, 'gi'))
}
