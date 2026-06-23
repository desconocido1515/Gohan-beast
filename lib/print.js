import { WAMessageStubType } from '@whiskeysockets/baileys'
import chalk from 'chalk'
import { watchFile } from 'fs'

const terminalImage = global.opts['img'] ? require('terminal-image') : ''
const urlRegex = (await import('url-regex-safe')).default({ strict: false })

export default async function (m, conn = { user: {} }) {
let _name = await conn.getName(m.sender)
let sender = '+' + m.sender.replace('@s.whatsapp.net', '') + (_name ? ' ~ ' + _name : '')
let chat = await conn.getName(m.chat)
let img
try {
if (global.opts['img'])
img = /sticker|image/gi.test(m.mtype) ? await terminalImage.buffer(await m.download()) : false
} catch (e) {
console.error(e)
}
let filesize = (m.msg ?
m.msg.vcard ?
m.msg.vcard.length :
m.msg.fileLength ?
m.msg.fileLength.low || m.msg.fileLength :
m.msg.axolotlSenderKeyDistributionMessage ?
m.msg.axolotlSenderKeyDistributionMessage.length :
m.text ?
m.text.length :
0
: m.text ? m.text.length : 0) || 0

let user = global.db.data.users[m.sender]
let chatName = chat ? (m.isGroup ? 'Grupo ~ ' + chat : 'Privado ~ ' + chat) : ''
let me = '+' + (conn.user?.jid || '').replace('@s.whatsapp.net', '')
const userName = conn.user.name || conn.user.verifiedName || "Desconocido"
if (m.sender === conn.user?.jid) return

// ========== DETECTAR TIPO DE MENSAJE (FORZADO) ==========
let tipoMensaje = 'Desconocido'

// Detectar ViewOnce (prioridad)
if (m.message?.viewOnceMessageV2?.message) {
    tipoMensaje = 'VIEWONCE 📸'
} else if (m.message?.viewOnceMessageV2Extension?.message) {
    tipoMensaje = 'VIEWONCE 2 🔒'
} else if (m.message?.viewOnceMessage?.message) {
    tipoMensaje = 'VIEWONCE 🕶️'
} else if (m.message?.ephemeralMessage?.message?.viewOnceMessageV2?.message) {
    tipoMensaje = 'VIEWONCE (EFÍMERO) 📷'
}
// Detectar otros tipos
else if (m.mtype) {
    tipoMensaje = m.mtype.replace(/message$/i, '').replace('audio', m.msg?.ptt ? 'PTT' : 'audio').replace(/^./, v => v.toUpperCase())
}
// Detectar por m.message directamente
else if (m.message?.conversation) {
    tipoMensaje = 'TEXTO'
} else if (m.message?.imageMessage) {
    tipoMensaje = 'IMAGEN'
} else if (m.message?.videoMessage) {
    tipoMensaje = 'VIDEO'
} else if (m.message?.stickerMessage) {
    tipoMensaje = 'STICKER'
} else if (m.message?.audioMessage) {
    tipoMensaje = m.message.audioMessage.ptt ? 'PTT' : 'AUDIO'
} else if (m.message?.documentMessage) {
    tipoMensaje = 'DOCUMENTO'
} else if (m.message?.contactMessage) {
    tipoMensaje = 'CONTACTO'
} else if (m.message?.locationMessage) {
    tipoMensaje = 'UBICACIÓN'
} else if (m.message?.buttonsMessage) {
    tipoMensaje = 'BOTONES'
} else if (m.message?.templateMessage) {
    tipoMensaje = 'TEMPLATE'
} else if (m.message?.listMessage) {
    tipoMensaje = 'LISTA'
} else if (m.message?.pollCreationMessage) {
    tipoMensaje = 'ENCUESTA'
} else if (m.message?.reactionMessage) {
    tipoMensaje = 'REACCIÓN'
}
// =======================================================

// Detectar BOT PRINCIPAL o SUB BOT
const esPrincipal = conn.user.jid === global.conn.user.jid
const tipoBot = esPrincipal ? '(BOT PRINCIPAL 🔰)' : '(SUB BOT)'

// NUEVO LOG ESTILO CAJA
console.log(`
╭━━━━━━━━━━━━━━𖡼
┃ ❖ ${chalk.white.bold('Bot:')} ${chalk.cyan.bold('%s')} ${chalk.green(tipoBot)}
┃ ❖ ${chalk.white.bold('Horario:')} ${chalk.black.bgGreen('%s')}
┃ ❖ ${chalk.white.bold('Usuario:')} ${chalk.white('%s')}
┃ ❖ ${m.chat.includes('@g.us') ? chalk.magentaBright('Grupo: ' + chat) : chalk.greenBright('Privado')}
┃ ❖ ${chalk.white.bold('Tipo:')} ${chalk.bgBlueBright.bold(`[${tipoMensaje}]`)}
╰━━━━━━━━━━━━━━𖡼`.trim(),

me + ' ~ ' + userName,
new Date(m.messageTimestamp ? 1000 * (m.messageTimestamp.low || m.messageTimestamp) : Date.now()).toLocaleString(),
sender
)

if (img) console.log(img.trimEnd())

if (typeof m.text === 'string' && m.text) {
let log = m.text.replace(/\u200e+/g, '')
let mdRegex = /(?<=(?:^|[\s\n])\S?)(?:([*_~`])(?!`)(.+?)\1|```((?:.|[\n\r])+?)```|`([^`]+?)`)(?=\S?(?:[\s\n]|$))/g

let mdFormat = (depth = 4) => (_, type, text, monospace) => {
let types = {
'_': 'italic',
'*': 'bold',
'~': 'strikethrough',
'`': 'bgGray'
}
text = text || monospace
let formatted = !types[type] || depth < 1 ? text : chalk[types[type]](
text.replace(/`/g, '').replace(mdRegex, mdFormat(depth - 1))
)
return formatted
}

log = log.replace(mdRegex, mdFormat(4))

log = log.split('\n').map(line => {
if (line.trim().startsWith('>')) {
return chalk.bgGray.dim(line.replace(/^>/, '┃'))
} else if (/^([1-9]|[1-9][0-9])\./.test(line.trim())) {
return line.replace(/^(\d+)\./, (match, number) => {
const padding = number.length === 1 ? '  ' : ' '
return padding + number + '.'
})
} else if (/^[-*]\s/.test(line.trim())) {
return line.replace(/^[*-]/, '  •')
}
return line
}).join('\n')

if (log.length < 1024)
log = log.replace(urlRegex, (url, i, text) => {
let end = url.length + i
return i === 0 || end === text.length || (/^\s$/.test(text[end]) && /^\s$/.test(text[i - 1])) ? chalk.blueBright(url) : url
})

log = log.replace(mdRegex, mdFormat(4))

const testi = await m.mentionedJid
if (testi) {
for (let user of testi)
log = log.replace('@' + user.split`@`[0], chalk.blueBright('@' + await conn.getName(user)))
}

console.log(
m.error != null ? chalk.red(log) :
m.isCommand ? chalk.yellow(log) :
log
)
}

if (m.messageStubParameters) {
console.log(
m.messageStubParameters.map(jid => {
jid = conn.decodeJid(jid)
let name = conn.getName(jid)
return chalk.gray('+' + jid.replace('@s.whatsapp.net', '') + (name ? ' ~' + name : ''))
}).join(', ')
)
}

if (/document/i.test(m.mtype)) console.log(`🝮 ${m.msg.fileName || m.msg.displayName || 'Document'}`)
else if (/ContactsArray/i.test(m.mtype)) console.log(`᯼ ${' ' || ''}`)
else if (/contact/i.test(m.mtype)) console.log(`✎ ${m.msg.displayName || ''}`)
else if (/audio/i.test(m.mtype)) {
const duration = m.msg.seconds
console.log(`${m.msg.ptt ? '☄ (PTT ' : '𝄞 ('}AUDIO) ${Math.floor(duration / 60).toString().padStart(2, 0)}:${(duration % 60).toString().padStart(2, 0)}`)
}
// ========== LOG ESPECIAL PARA VIEWONCE ==========
else if (m.message?.viewOnceMessageV2?.message || m.message?.viewOnceMessageV2Extension?.message) {
    console.log(chalk.magenta('📸 Mensaje de VER UNA VEZ detectado'))
}
// ================================================

console.log()
}

let file = global.__filename(import.meta.url)
watchFile(file, () => {
console.log(chalk.redBright("Update 'lib/print.js'"))
})
