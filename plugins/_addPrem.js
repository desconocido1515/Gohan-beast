import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const premiumFile = path.resolve(__dirname, "../json/premium.json");
const expFile = path.resolve(__dirname, "../json/premium_exp.json");

// Función segura para leer JSON
function readJSON(file, def) {
  try {
    if (!fs.existsSync(file)) return def;
    let data = fs.readFileSync(file);
    return JSON.parse(data.toString() || JSON.stringify(def));
  } catch {
    return def;
  }
}

// Función segura para guardar JSON
function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // Verificar que el usuario sea owner
  if (!global.owner.map(v => v.replace(/[^0-9]/g, "")).includes(m.sender.split("@")[0])) {
    return conn.reply(m.chat, `
╔══════════════════════════════════╗
║   🐉 GOHAN BEAST - ACCESO DENEGADO 🐉
╠══════════════════════════════════╣
║                                    ║
║   ⚡ *Poder insuficiente*          ║
║                                    ║
║   Solo el *Saiyajin Supremo*       ║
║   puede otorgar poder premium      ║
║                                    ║
╚══════════════════════════════════╝
    `.trim(), m);
  }

  let numero = args[0]?.replace(/[@+]/g, ""); // limpio (sin @ ni +)
  let dias = parseInt(args[1]);
  
  if (!numero || isNaN(dias) || dias <= 0) {
    return conn.reply(m.chat, `
╔══════════════════════════════════╗
║   🐉 GOHAN BEAST - OTORGAR PODER  🐉
╠══════════════════════════════════╣
║                                    ║
║   *Uso correcto:*                  ║
║   ${usedPrefix + command} <número> <días> ║
║                                    ║
║   *Ejemplo:*                       ║
║   ${usedPrefix + command} 584125877491 30 ║
║                                    ║
╚══════════════════════════════════╝
    `.trim(), m);
  }

  let userJid = numero + "@s.whatsapp.net";
  let time = dias * 24 * 60 * 60 * 1000; // días → ms
  let expireAt = Date.now() + time;
  let fechaExpiracion = new Date(expireAt).toLocaleDateString('es-VE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // premium.json = array de números limpios
  let premium = readJSON(premiumFile, []);
  // premium_exp.json = objeto con JID completo
  let premiumExp = readJSON(expFile, {});

  if (!premium.includes(numero)) {
    premium.push(numero);
  }

  premiumExp[userJid] = expireAt;

  saveJSON(premiumFile, premium);
  saveJSON(expFile, premiumExp);

  // Mensaje épico estilo Gohan Beast
  const mensajeExito = `
╔══════════════════════════════════╗
║     🐉 𝐆𝐎𝐇𝐀𝐍 𝐁𝐄𝐀𝐒𝐓 - 𝐏𝐎𝐃𝐄𝐑 𝐃𝐈𝐕𝐈𝐍𝐎 🐉
╠══════════════════════════════════╣
║                                         ║
║   ✨ *¡PODER PREMIUM OTORGADO!* ✨      ║
║                                         ║
║   👤 *Guerrero:* @${numero}             ║
║   ⚡ *Días de poder:* ${dias} días      ║
║   🗡️ *Nivel:* PREMIUM DIVINO            ║
║   📅 *Expira:* ${fechaExpiracion}       ║
║                                         ║
║   🔥 *Beneficios:*                      ║
║   ┃ ➩ Comandos exclusivos              ║
║   ┃ ➩ Sin límites de uso               ║
║   ┃ ➩ Prioridad en el servidor         ║
║   ┃ ➩ Protección divina                ║
║                                         ║
╠═════════════════════════════════╣
║🐉 *Que el poder te acompañe, guerrero* 🐉
╚═════════════════════════════════╝
  `.trim();

  await conn.reply(m.chat, mensajeExito, m, { mentions: [userJid] });
  
  // Reacciones de poder
  await m.react('🐉');
  await m.react('⚡');
  await m.react('✨');
  
  console.log(chalk.green(`🐉 [POWER UP] ${numero} ahora es premium por ${dias} días`));
};

handler.help = ["addprem"];
handler.tags = ["owner"];
handler.command = ["addprem", "+prem", "darprem", "otorgarprem"];
handler.rowner = true;

export default handler;