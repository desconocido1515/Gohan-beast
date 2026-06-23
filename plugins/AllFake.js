import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg
var handler = m => m
handler.all = async function (m) {
// • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
global.canalIdM = [
"120363407475582973@newsletter",
"120363407475582973@newsletter",
"120363407475582973@newsletter"
]
// • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
global.canalNombreM = [
"𝘌𝘓𝘐𝘛𝘌 𝘉𝘖𝘛 𝘎𝘓𝘖𝘉𝘈𝘓 - 𝘚𝘐𝘕𝘊𝘌 2023®",
"𝘌𝘓𝘐𝘛𝘌 𝘉𝘖𝘛 𝘎𝘓𝘖𝘉𝘈𝘓 - 𝘚𝘐𝘕𝘊𝘌 2023®",
"𝘌𝘓𝘐𝘛𝘌 𝘉𝘖𝘛 𝘎𝘓𝘖𝘉𝘈𝘓 - 𝘚𝘐𝘕𝘊𝘌 2023®"
]
// • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
global.channelRD = await getRandomChannel()
global.d = new Date(new Date + 3600000)
global.locale = 'es'
global.dia = d.toLocaleDateString(locale, { weekday: 'long' })
global.fecha = d.toLocaleDateString('es', {
day: 'numeric',
month: 'numeric',
year: 'numeric'
})
global.mes = d.toLocaleDateString('es', {
month: 'long'
})
global.año = d.toLocaleDateString('es', {
year: 'numeric'
})
global.tiempo = d.toLocaleString('en-US', {
hour: 'numeric',
minute: 'numeric',
second: 'numeric',
hour12: true
})
// • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
var canal = 'https://whatsapp.com/channel/0029VbCUT9R7YScuSbDdT51u'
var canal2 = 'https://whatsapp.com/channel/0029VbCUT9R7YScuSbDdT51u'
var comunidad = 'https://whatsapp.com/channel/0029VbCUT9R7YScuSbDdT51u'
var git = 'https://whatsapp.com/channel/0029VbCUT9R7YScuSbDdT51u'
var github = 'https://whatsapp.com/channel/0029VbCUT9R7YScuSbDdT51u'
var correo = 'https://whatsapp.com/channel/0029VbCUT9R7YScuSbDdT51u'
global.redes = [canal, comunidad, git, github, correo].getRandom()
// • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
let nombreUsuario = m.pushName;
if (!nombreUsuario) {
  try {
    nombreUsuario = await this.getName(m.sender) || 'Anónimo';
  } catch {
    nombreUsuario = 'Anónimo';
  }
}
global.nombre = nombreUsuario;
global.packsticker = `${nombre}
📆 Fecha: ${fecha}`;
global.packsticker2 = `\n${dev}`; 
// • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
global.fake = {
contextInfo: {
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterJid: channelRD.id,
newsletterName: channelRD.name,
serverMessageId: -1
}
}}, { quoted: m }

global.fkontak = {
key: {
participants: "0@s.whatsapp.net",
remoteJid: "status@broadcast",
fromMe: false,
id: "Halo"
},
message: {
contactMessage: {
vcard: `BEGIN:VCARD
VERSION:3.0
N:Sy;Bot;;;
FN:y
item1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}
item1.X-ABLabel:Ponsel
END:VCARD`
}},
participant: "0@s.whatsapp.net"
}

// ========== RCANAL CORREGIDO ==========
global.rcanal = {
contextInfo: {
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterJid: channelRD.id,
serverMessageId: '',
newsletterName: channelRD.name
},
mentionedJid: []  // ✅ CORREGIDO: null → []
}
// =====================================
}
}

export default handler

function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}

async function getRandomChannel() {
let randomIndex = Math.floor(Math.random() * canalIdM.length)
let id = canalIdM[randomIndex]
let name = canalNombreM[randomIndex]
return { id, name }
}
