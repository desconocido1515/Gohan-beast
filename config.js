import { watchFile, unwatchFile } from "fs"
import chalk from "chalk"
import { fileURLToPath } from "url"
import fs from "fs"

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

//BETA: Si quiere evitar escribir el número que será bot en la consola, agregué desde aquí entonces:
//Sólo aplica para opción 2 (ser bot con código de texto de 8 digitos)
global.botNumber = "" //Ejemplo: 573218138672

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.owner = ["593993370003", "593959553079", "59398929429"]
global.suittag = ["593993370003"] 
global.prems = []

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.libreria = "Baileys Multi Device"
global.vs = "^1.8.2 • Latest"
global.nameqr = "ɢᴏᴊᴏ-ʙᴏᴛ ᴍᴅ"
global.sessions = "Sessions/Principal"
global.jadi = "Sessions/SubBot"
global.kanekiAIJadibts = true

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.botname = "𝙀𝙇𝙄𝙏𝙀 𝘽𝙊𝙏 𝙂𝙇𝙊𝘽𝘼𝙇"
global.textbot = "𝙀𝙇𝙄𝙏𝙀 𝘽𝙊𝙏 𝙂𝙇𝙊𝘽𝘼𝙇\nSince - 2023®"
global.dev = "Elite Bot Global - Since 2023®"
global.music = "Elite Bot Global - Since 2023®"
global.author = "© mᥲძᥱ ᥕі𝗍һ ᑲᥡ ƈαɾʅσʂ.ɾʋ"
global.etiqueta = "✫ᴄᴀʀʟᴏs ʀᴀᴍɪʀᴇᴢ❄️ ⊹꙰ "
global.currency = "g᥆𝗍іᥴᥲs"
global.banner = "https://raw.githubusercontent.com/desconocido1515/desco/main/media/icono.jpg"
global.icono = "https://raw.githubusercontent.com/desconocido1515/desco/main/media/icono.jpg"
global.catalogo = fs.readFileSync('./lib/catalogo.jpg')

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.group = "https://chat.whatsapp.com/CUvfFfsbHBGJ1RQBGcALNC?mode=gi_t"
global.community = "https://chat.whatsapp.com/CUvfFfsbHBGJ1RQBGcALNC?mode=gi_t"
global.channel = "https://chat.whatsapp.com/CUvfFfsbHBGJ1RQBGcALNC?mode=gi_t"
global.github = "https://chat.whatsapp.com/CUvfFfsbHBGJ1RQBGcALNC?mode=gi_t"
global.gmail = "EliteBot@gmail.com"
global.ch = {
ch1: "120363407475582973@newsletter"
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.APIs = {
xyro: { url: "https://xyro.site", key: null },
yupra: { url: "https://api.yupra.my.id", key: null },
vreden: { url: "https://api.vreden.web.id", key: null },
delirius: { url: "https://api.delirius.store", key: null },
zenzxz: { url: "https://api.zenzxz.my.id", key: null },
siputzx: { url: "https://api.siputzx.my.id", key: null },
adonix: { url: "https://api-adonix.ultraplus.click", key: 'shadow.xyz' },
stellar: { url: "https://api.stellarwa.xyz", key: "this-xyz"},
light: { url: "https://api--shadowcorexyz.replit.app", key: null }
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
unwatchFile(file)
console.log(chalk.redBright("Update 'configXD.js'"))
import(`${file}?update=${Date.now()}`)
})
// ========== CONFIGURACIÓN DE CANAL (rcanal) ==========
global.rcanal = {
  contextInfo: {
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363407475582973@newsletter",
      serverMessageId: '',
      newsletterName: "𝘌𝘓𝘐𝘛𝘌 𝘉𝘖𝘛 𝘎𝘓𝘖𝘉𝘈𝘓 - 𝘚𝘐𝘕𝘊𝘌 2023®"
    },
    externalAdReply: {
      title: global.botname || 'Elite Bot',
      body: global.music || 'Elite Bot Global',
      mediaUrl: null,
      description: null,
      previewType: "PHOTO",
      thumbnail: null,
      thumbnail: "https://raw.githubusercontent.com/desconocido1515/desco/main/media/icono.jpg" ,  // Cambia "tu_imagen.jpg" por el nombre de tu archivo
      sourceUrl: "https://whatsapp.com/channel/0029VbCUT9R7YScuSbDdT51u",
      mediaType: 1,
      renderLargerThumbnail: false
    }
  }
};

// También puedes agregar una versión simple como texto (para comandos como frases)
global.rcanalText = 'Ver canal\nWhatsApp';
