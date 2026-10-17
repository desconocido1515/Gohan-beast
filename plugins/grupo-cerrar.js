let handler = async (m, { conn, text, args, isAdmin, groupMetadata }) => {
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  if (!m.isGroup) {
    return conn.reply(m.chat, '🐉 Solo en grupos\nEste poder solo funciona en dojos (grupos).', m);
  }

  if (!isAdmin) {
    return conn.reply(m.chat, '❌ Poder insuficiente\nSolo los maestros (admins) pueden cerrar el dojo.', m);
  }

  const participants = groupMetadata?.participants || [];
  const botJid = conn.user.jid;
  const botIsReallyAdmin = participants.some(p => {
    const pid = p.id || p.jid || '';
    return pid === botJid && (p.admin === 'admin' || p.admin === 'superadmin' || p.admin === true);
  });

  if (!botIsReallyAdmin) {
    return conn.reply(m.chat, '⚠️ Sin poder\nNecesito ser maestro (admin) para cerrar.', m);
  }

  if (!args[0]) {
    return conn.reply(m.chat, '🐉 Uso:\n.cerrar 10 segundos\n.cerrar 5 minutos\n.cerrar 1 hora', m);
  }

  let tiempoTexto = text.toLowerCase();
  let tiempoMs;
  let unidad = '';
  let tiempoSegundos = 0;

  if (tiempoTexto.includes("segundo")) {
    let segundos = parseInt(args[0]);
    if (isNaN(segundos) || segundos <= 0) return conn.reply(m.chat, '❌ Segundos inválidos', m);
    tiempoMs = segundos * 1000;
    tiempoSegundos = segundos;
    unidad = segundos === 1 ? 'segundo' : 'segundos';
  } 
  else if (tiempoTexto.includes("minuto")) {
    let minutos = parseInt(args[0]);
    if (isNaN(minutos) || minutos <= 0) return conn.reply(m.chat, '❌ Minutos inválidos', m);
    tiempoMs = minutos * 60 * 1000;
    tiempoSegundos = minutos * 60;
    unidad = minutos === 1 ? 'minuto' : 'minutos';
  } 
  else if (tiempoTexto.includes("hora")) {
    let horas = parseInt(args[0]);
    if (isNaN(horas) || horas <= 0) return conn.reply(m.chat, '❌ Horas inválidas', m);
    tiempoMs = horas * 60 * 60 * 1000;
    tiempoSegundos = horas * 60 * 60;
    unidad = horas === 1 ? 'hora' : 'horas';
  } 
  else {
    return conn.reply(m.chat, '❓ Especifica tiempo\nsegundos / minutos / horas', m);
  }

  try {
    await conn.groupSettingUpdate(m.chat, 'announcement');

    await conn.reply(m.chat, `🐉 DOJO CERRADO\n\n⏰ Tiempo: ${args[0]} ${unidad}\n\n⏳ Cuenta regresiva iniciada...`, m);

    let segundosRestantes = tiempoSegundos;

    const cuentaRegresiva = async () => {
      while (segundosRestantes > 0) {
        await delay(60000); 
        segundosRestantes -= 60;
        if (segundosRestantes <= 0) break;

        let min = Math.floor(segundosRestantes / 60);
        let sec = segundosRestantes % 60;
        let tiempoRestanteStr = min > 0 ? `${min}m ${sec}s` : `${sec}s`;

        try {
          await conn.reply(m.chat, `⏳ TIEMPO RESTANTE\n\n🕐 Quedan ${tiempoRestanteStr}\n🐉 Abriendo en breve...`, m);
        } catch (error) {}
      }
    };

    cuentaRegresiva();

    await delay(tiempoMs);

    await conn.groupSettingUpdate(m.chat, 'not_announcement');

    await conn.reply(m.chat, `🎊 DOJO ABIERTO\n\n✅ Cerrado por: ${args[0]} ${unidad}\n⏱️ Tiempo exacto cumplido\n🐉 ¡Todos pueden hablar nuevamente!`, m);

    const celebraciones = ['✨', '🎉', '⚡', '🔥', '🌟'];
    for (let emoji of celebraciones) {
      await delay(500);
      await m.react(emoji);
    }

  } catch (error) {
    console.error('Error en cerrar grupo:', error);
    await m.react('❌');
    try { await conn.groupSettingUpdate(m.chat, 'not_announcement'); } catch {}
    await conn.reply(m.chat, '❌ Error en la cuenta regresiva\nEl dojo ha sido reabierto.', m);
  }
};

handler.help = ['cerrar <tiempo> segundos/minutos/horas'];
handler.tags = ['grupo'];
handler.command = /^cerrar$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = false;

export default handler;