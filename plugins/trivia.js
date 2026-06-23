// plugins/trivia.js

const triviaImages = [
  'https://cdn.yupra.my.id/yp/o720p39m.jpg',
  'https://cdn.yupra.my.id/yp/ey5l5cct.jpg',
  'https://i.pinimg.com/originals/b3/67/d5/b367d513d861de468305c32c6cd22756.jpg'
]

const questions = [
    {
        question: "¿Quién fue el padre de Melquisedec?",
        options: ["Abraham", "Noé", "Ninguno, Melquisedec no tenía padre"],
        answer: "C"
    },
    {
        question: "¿Cuál es el nombre del rey que pidió que se escribieran los Salmos?",
        options: ["David", "Salomón", "Ezequías"],
        answer: "A"
    },
    {
        question: "¿En qué libro de la Biblia se describe la creación del mundo?",
        options: ["Éxodo", "Génesis", "Levítico"],
        answer: "B"
    },
    {
        question: "¿Qué profeta desafió a los profetas de Baal en el monte Carmelo?",
        options: ["Isaías", "Elías", "Jeremías"],
        answer: "B"
    },
    {
        question: "¿Quién fue el último juez de Israel antes de que se estableciera la monarquía?",
        options: ["Samuel", "Débora", "Sansón"],
        answer: "A"
    }
]

let triviaSessions = new Map()
let userScores = new Map()

let handler = m => m

handler.before = async function (m, { conn, usedPrefix }) {
  // DETECTAR RESPUESTA DE BOTÓN (igual que en la prueba)
  if (m.message?.buttonsResponseMessage) {
    const buttonId = m.message.buttonsResponseMessage.selectedButtonId
    const chat = m.chat
    
    console.log('Botón trivia presionado:', buttonId) // Debug
    
    // Verificar si es una respuesta de trivia (empieza con .trivia)
    if (buttonId.startsWith('.trivia ')) {
      const userAnswer = buttonId.replace('.trivia ', '').trim()
      const session = triviaSessions.get(chat)
      
      if (!session || session.answered) {
        await conn.reply(chat, `☑️ No hay una trivia activa. Usa *.trivia* para comenzar una nueva.`, m)
        return
      }
      
      const correctAnswer = questions[session.index].answer
      const isCorrect = userAnswer === correctAnswer
      
      const userId = m.sender
      if (!userScores.has(userId)) userScores.set(userId, 0)
      if (isCorrect) userScores.set(userId, userScores.get(userId) + 1)
      
      const points = userScores.get(userId)
      
      let respuestaTexto
      if (isCorrect) {
        respuestaTexto = `✅ *¡CORRECTO!*\n\nLa respuesta correcta es: *${questions[session.index].options[correctAnswer === 'A' ? 0 : correctAnswer === 'B' ? 1 : 2]}*\n\n🏅 Tu puntaje: *${points}* puntos\n\nUsa *.trivia* para la siguiente pregunta`
      } else {
        respuestaTexto = `❌ *INCORRECTO*\n\nTu respuesta: *${userAnswer}*\nRespuesta correcta: *${correctAnswer}* - ${questions[session.index].options[correctAnswer === 'A' ? 0 : correctAnswer === 'B' ? 1 : 2]}\n\n🏅 Tu puntaje: *${points}* puntos\n\nUsa *.trivia* para la siguiente pregunta`
      }
      
      await conn.reply(chat, respuestaTexto, m)
      await conn.sendMessage(chat, { react: { text: isCorrect ? '✅' : '❌', key: m.key } })
      
      triviaSessions.set(chat, { ...session, answered: true })
      return
    }
  }
  
  // COMANDO PARA NUEVA PREGUNTA
  if (m.text === '.trivia') {
    let currentSession = triviaSessions.get(m.chat)
    let availableQuestions = [...questions]
    
    if (currentSession?.asked?.length) {
      availableQuestions = availableQuestions.filter((_, i) => !currentSession.asked.includes(i))
    }
    
    if (availableQuestions.length === 0) {
      triviaSessions.delete(m.chat)
      return conn.reply(m.chat, `🎉 *¡Felicitaciones!* Respondiste todas las preguntas. Usa *.trivia* para reiniciar.`, m)
    }
    
    const randomIndex = Math.floor(Math.random() * availableQuestions.length)
    const questionIndex = questions.indexOf(availableQuestions[randomIndex])
    const q = questions[questionIndex]
    const img = triviaImages[Math.floor(Math.random() * triviaImages.length)]
    
    triviaSessions.set(m.chat, {
      index: questionIndex,
      answered: false,
      asked: currentSession?.asked ? [...currentSession.asked, questionIndex] : [questionIndex]
    })
    
    const caption = `*🎓 TRIVIA DE CULTURA 🎓*\n\n📖 ${q.question}\n\n*OPCIONES:*\nA) ${q.options[0]}\nB) ${q.options[1]}\nC) ${q.options[2]}\n\n🎯 Presiona un botón para responder`
    
    const buttons = [
      { buttonId: `.trivia A`, buttonText: { displayText: `A) ${q.options[0].substring(0, 15)}` }, type: 1 },
      { buttonId: `.trivia B`, buttonText: { displayText: `B) ${q.options[1].substring(0, 15)}` }, type: 1 },
      { buttonId: `.trivia C`, buttonText: { displayText: `C) ${q.options[2].substring(0, 15)}` }, type: 1 }
    ]
    
    await conn.sendMessage(m.chat, { image: { url: img }, caption, buttons, viewOnce: true }, { quoted: m })
    await conn.sendMessage(m.chat, { react: { text: '🎯', key: m.key } })
    return
  }
  
  // COMANDO PARA VER PUNTAJE
  if (m.text === '.triviascore') {
    if (userScores.size === 0) {
      return conn.reply(m.chat, "📭 Nadie ha participado aún en la trivia.", m)
    }
    
    const sorted = [...userScores.entries()].sort((a, b) => b[1] - a[1])
    const top = sorted.slice(0, 10)
    const mentions = top.map(([u]) => u)
    
    let ranking = `*🏆 RANKING TRIVIA 🏆*\n\n`
    for (let i = 0; i < top.length; i++) {
      ranking += `${i + 1}. @${top[i][0].split("@")[0]} — 🏅 *${top[i][1]} pts*\n`
    }
    
    const img = triviaImages[Math.floor(Math.random() * triviaImages.length)]
    await conn.sendMessage(m.chat, { image: { url: img }, caption: ranking, mentions }, { quoted: m })
    await conn.sendMessage(m.chat, { react: { text: '🏆', key: m.key } })
    return
  }
}

export default handler
