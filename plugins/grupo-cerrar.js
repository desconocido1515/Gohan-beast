let handler = async (m, { conn, text, args, isAdmin, isBotAdmin, groupMetadata }) => {
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

  if (!isBotAdmin || !botIsReallyAdmin) {
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
    await m.react('🔒');
    await m.react('🐉');

    await conn.groupSettingUpdate(m.chat, 'announcement');

    const cierreMsg = await conn.sendMessage(m.chat, {
      text: `🐉 DOJO CERRADO\n\n⏰ Tiempo: ${args[0]} ${unidad}\n\n⏳ Cuenta regresiva iniciada...`
    });

    const formatTiempo = (segundos) => {
      if (segundos < 60) return `${segundos} segundos`;
      if (segundos < 3600) {
        const min = Math.floor(segundos / 60);
        const sec = segundos % 60;
        return `${min} minuto${min !== 1 ? 's' : ''} ${sec > 0 ? sec + ' segundo' + (sec !== 1 ? 's' : '') : ''}`;
      }
      const horas = Math.floor(segundos / 3600);
      const min = Math.floor((segundos % 3600) / 60);
      return `${horas} hora${horas !== 1 ? 's' : ''} ${min > 0 ? min + ' minuto' + (min !== 1 ? 's' : '') : ''}`;
    };

    const crearBarra = (porcentaje) => {
      const barras = 20;
      const lleno = Math.round((porcentaje / 100) * barras);
      const vacio = barras - lleno;
      return '█'.repeat(lleno) + '░'.repeat(vacio);
    };

    let segundosRestantes = tiempoSegundos;

    const cuentaRegresiva = async () => {
      while (segundosRestantes > 0) {
        await delay(20000);
        segundosRestantes -= 20;
        if (segundosRestantes <= 0) break;

        const porcentaje = ((tiempoSegundos - segundosRestantes) / tiempoSegundos) * 100;
        try {
          await conn.sendMessage(m.chat, {
            text: `⏳ TIEMPO RESTANTE\n\n${crearBarra(porcentaje)} ${Math.round(porcentaje)}%\n\n🕐 ${formatTiempo(segundosRestantes)}\n🐉 Abriendo en breve...`,
            edit: cierreMsg.key
          });
        } catch (error) {}
      }
    };

    cuentaRegresiva();

    await delay(tiempoMs);

    try {
      await conn.sendMessage(m.chat, {
        text: `✅ CUENTA REGRESIVA COMPLETADA\n\n████████████████████ 100%\n\n⏰ Tiempo cumplido\n🐉 Abriendo dojo...`,
        edit: cierreMsg.key
      });
    } catch (error) {}

    await delay(1000);

    await conn.groupSettingUpdate(m.chat, 'not_announcement');

    await m.react('✅');
    await m.react('🎉');

    await conn.sendMessage(m.chat, { 
      text: `🎊 DOJO ABIERTO\n\n✅ Cerrado por: ${args[0]} ${unidad}\n⏱️ Tiempo exacto cumplido\n🐉 ¡Todos pueden hablar nuevamente!`
    });

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
handler.botAdmin = true;

export default handler;