import path from 'path'
let user = a => '@' + a.split('@')[0]

function handler(m, { groupMetadata, command, conn, text }) {
  if (!text) return conn.reply(m.chat, `🐉 ¿Top de qué?\n\nEjemplo: *${command} usuarios más activos*`, m)

  let ps = groupMetadata.participants.map(v => v.id)
  let [a, b, c, d, e, f, g, h, i, j] = Array.from({ length: 10 }, () => ps.getRandom())

  let intro = pickRandom([
    `📊 *Top 10 de ${text.toUpperCase()}*`,
    `🏆 *Ranking de ${text}*`,
    `🐉 *Lista de los más saiyans en ${text}*`,
  ])

  let top = 
`${intro}

1. 🥇 ${user(a)}
2. 🥈 ${user(b)}
3. 🥉 ${user(c)}
4. 🎖️ ${user(d)}
5. ✨ ${user(e)}
6. 🐉 ${user(f)}
7. 📈 ${user(g)}
8. 🌀 ${user(h)}
9. ⚽ ${user(i)}
10. ⛄ ${user(j)}`

  conn.reply(m.chat, top, m, { mentions: [a, b, c, d, e, f, g, h, i, j] })
}

handler.help = ['top *<texto>*']
handler.command = ['top']
handler.tags = ['group']
handler.group = true
handler.register = false

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}