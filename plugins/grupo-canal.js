const handler = async (m, { conn }) => {
  const canalInfo = `╔══════════════════════════════╗
║     🐉 𝐊𝐀𝐌𝐄 𝐇𝐎𝐔𝐒𝐄 - 𝐂𝐀𝐍𝐀𝐋 𝐎𝐅𝐈𝐂𝐈𝐀𝐋 🗡️
╚════════════════════════════════╝

🌀 *Únete al poder del dragón*

✨ *CANAL:* 𝙶𝙾𝙷𝙰𝙽 𝙱𝙴𝙰𝚂𝚃 𝙱𝙾𝚃 𝟷.𝟶.𝟶

📜 *¿Qué encontrarás?*
• ⚡ Actualizaciones épicas
• 🗡️ Nuevos comandos divinos
• 🔥 Tutoriales y guías
• 🌟 Soporte exclusivo
• 🐉 Noticias del ecosistema

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 *LINK OFICIAL:*
https://whatsapp.com/channel/0029Vb7ntULLY6d8uOvyDy0C

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ *¡Únete guerrero! El poder te espera* ✨

🐉 _Gohan Beast - Poder Máximo Activado_ 🗡️`

  await conn.sendMessage(m.chat, { text: canalInfo }, { quoted: m })
  await m.react('🐉')
}

handler.command = ['canal', 'channel', 'kamehouse']
handler.tags = ['grupo']
handler.help = ['canal']

export default handler