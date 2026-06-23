import fetch from 'node-fetch';
import { sticker } from '../../lib/sticker.js';

const handler = async (m, { conn, text, usedPrefix }) => {
  try {
    // Validar mención o respuesta
    let mentionedJid = await m.mentionedJid;
    let usuario = mentionedJid && mentionedJid.length ? mentionedJid[0] : m.quoted && await m.quoted.sender ? await m.quoted.sender : null;
    
    if (!usuario) {
      return conn.reply(m.chat, `☑️ ETIQUETA A LA PERSONA\n\n📌 *Ejemplo:*\n.animo @usuario`, m, rcanal);
    }
    
    if (usuario === m.sender) {
      return conn.reply(m.chat, `☑️ No puedes darte ánimo a ti mismo. Etiqueta a otra persona.`, m, rcanal);
    }
    
    const nombreUsuario = m.pushName || m.sender.split('@')[0];
    const nombreMencionado = await conn.getName(usuario);
    
    // Textos de ánimo aleatorios
    const textosAnimo = [
      `💪 *${nombreMencionado}*, tú puedes con todo. Los momentos difíciles también pasan. ¡Sigue adelante! ✨`,
      
      `🌟 *${nombreMencionado}*, la vida es como una montaña rusa, con subidas y bajadas. Lo importante es no rendirse. ¡Tú eres fuerte! 💪`,
      
      `🌸 *${nombreMencionado}*, recuerda que después de la tormenta siempre sale el sol. Todo va a mejorar. ¡Confía en ti! 💫`,
      
      `🎈 *${nombreMencionado}*, no estás solo/a en esto. Cuenta conmigo y con todos los que te aprecian. ¡Eres importante! ❤️`,
      
      `🌻 *${nombreMencionado}*, a veces necesitamos una pausa para recargar energías. Tómate tu tiempo, pero nunca abandones. 🚀`,
      
      `⭐ *${nombreMencionado}*, cada día es una nueva oportunidad para ser feliz. ¡Sonríe, que la vida es hermosa! 😊`,
      
      `💖 *${nombreMencionado}*, mereces todo lo bueno que te pasa y más. No dejes que nadie te diga lo contrario. 🌈`,
      
      `🦋 *${nombreMencionado}*, los cambios son difíciles, pero siempre traen cosas nuevas y mejores. ¡Ánimo! 🍀`
    ];
    
    const textoAleatorio = textosAnimo[Math.floor(Math.random() * textosAnimo.length)];
    
    // Reaccionar al mensaje
    await conn.sendMessage(m.chat, {
      react: { text: '💫', key: m.key }
    });
    
    // Obtener imagen
    const imageUrl = 'https://raw.githubusercontent.com/desconocido1515/desco/main/media/animo.jpeg';
    
    // Enviar imagen con el mensaje de ánimo
    await conn.sendMessage(m.chat, {
      image: { url: imageUrl },
      caption: `💌 *⌈*  𝑨𝑵𝑰𝑴𝑶 *⌋* 💌\n\n${textoAleatorio}\n\n━━━━━━━━━━━━━━━━━━━\n✨ *${nombreUsuario}* te envió este mensaje de ánimo ✨\n━━━━━━━━━━━━━━━━━━━\n\n© Elite Bot Global - Since 2023®`,
      mentions: [usuario, m.sender]
    });
    
    // Reacción final
    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    });
    
  } catch (error) {
    console.error('Error en comando ánimo:', error);
    await conn.reply(m.chat, `☑️ Ocurrió un error al enviar el mensaje de ánimo.`, m, rcanal);
  }
};

handler.command = /^(animo|ánimo)$/i;
handler.group = true;

export default handler;
