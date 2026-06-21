import { getUser, getCooldown, formatTime } from './economy.js'

let handler = async (m, { conn }) => {
  const userId = m.sender
  const user = getUser(userId)
  
  if (!user.registered) {
    return conn.reply(m.chat, '❌ Debes registrarte primero.', m)
  }

  const commands = ['daily', 'mine', 'run', 'slut']
  let info = commands.map(cmd => {
    const cooldown = getCooldown(userId, cmd)
    const status = cooldown > 0 ? `⏳ ${formatTime(cooldown)}` : '✅ Listo'
    return `┃ .${cmd} → ${status}`
  }).join('\n')

  await conn.reply(m.chat, `
🐉 GOHAN BEAST — ESTADO ECONÓMICO

📊 Cooldowns:

${info}

💰 Coins: ${user.coins} ${global.coin}
🏦 Banco: ${user.bank} ${global.coin}
    `.trim(), m)
  await m.react('📊')
}

handler.command = ['einfo']
handler.tags = ['economy']
handler.help = ['einfo']

export default handler