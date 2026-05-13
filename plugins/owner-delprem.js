import { removePremium, isPremium } from '../../database/premium.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Solo owner puede usar este comando
    if (!global.owner.includes(m.sender.split('@')[0]) && !m.isOwner) {
        return m.reply('❌ *Acceso Denegado*\n\nEste comando solo puede ser usado por el *Propietario* del bot.');
    }
    
    if (!text) return m.reply(`🔧 *Quitar Premium*\n\nUso correcto:\n${usedPrefix + command} @usuario\n\nEjemplo:\n${usedPrefix + command} @user`);
    
    let user = m.mentionedJid[0] || text.split(' ')[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    
    if (!user) return m.reply('❌ Menciona al usuario o envía su número.');
    
    // Verificar si es premium
    const hasPremium = isPremium(user.split('@')[0]);
    if (!hasPremium) {
        return m.reply(`❌ El usuario @${user.split('@')[0]} no tiene premium activo.`, null, { mentions: [user] });
    }
    
    // Remover premium
    const removed = removePremium(user.split('@')[0]);
    
    if (removed) {
        let caption = `⚠️ *PREMIUM REMOVIDO* ⚠️\n\n`;
        caption += `✅ Se ha removido el premium de:\n`;
        caption += `👤 @${user.split('@')[0]}\n`;
        caption += `👑 Removido por: @${m.sender.split('@')[0]}\n\n`;
        caption += `> 💔 El usuario ya no tiene acceso a comandos premium.`;
        
        await conn.sendMessage(m.chat, {
            text: caption,
            mentions: [user, m.sender]
        });
        
        // Opcional: Notificar al usuario
        await conn.sendMessage(user, {
            text: `⚠️ *Premium Revocado* ⚠️\n\nTu acceso premium ha sido removido.\n\nSi crees que es un error, contacta al propietario.`
        });
    } else {
        m.reply('❌ Error al remover premium.');
    }
};

handler.help = ['delprem @user'];
handler.tags = ['owner'];
handler.command = /^(delprem|quitarprem|removeprem)$/i;
handler.rowner = true;
handler.owner = true;

export default handler;