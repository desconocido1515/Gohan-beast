import { listPremiumUsers, getPremiumStats } from '../../database/premium.js';

let handler = async (m, { conn, usedPrefix, command }) => {
    const activeUsers = listPremiumUsers();
    const stats = getPremiumStats();
    
    if (activeUsers.length === 0) {
        return m.reply(`📋 *USUARIOS PREMIUM*\n\nNo hay usuarios premium activos en este momento.\n\n📊 *Estadísticas:*\n▸ Total premium otorgados: ${stats.totalUsers}\n▸ Expirados: ${stats.expiredUsers}`);
    }
    
    let caption = `🌟 *LISTA DE USUARIOS PREMIUM* 🌟\n\n`;
    caption += `📊 *Estadísticas:*\n`;
    caption += `▸ 👑 *Activos:* ${stats.activeUsers}\n`;
    caption += `▸ ⏰ *Total días premium:* ${stats.totalPremiumDays}\n\n`;
    caption += `📋 *Lista de usuarios:*\n`;
    
    let mentions = [];
    let count = 1;
    
    for (const user of activeUsers) {
        const username = user.userId;
        mentions.push(username + '@s.whatsapp.net');
        caption += `${count}. @${username}\n`;
        caption += `   📅 *Días:* ${user.days}\n`;
        caption += `   ⏰ *Restantes:* ${user.remainingDays} días\n`;
        caption += `   🎫 *Otorgado por:* @${user.grantedBy}\n\n`;
        count++;
    }
    
    caption += `✨ *Comandos premium:*\n`;
    caption += `▸ .premiuminfo - Ver tu estado\n`;
    caption += `▸ Y más comandos exclusivos\n\n`;
    caption += `> 📌 *Los usuarios premium tienen acceso a comandos exclusivos*`;
    
    // Agregar mentions de los usuarios premium y los que otorgaron
    const otherMentions = activeUsers.map(u => u.userId + '@s.whatsapp.net');
    const grantByMentions = [...new Set(activeUsers.map(u => u.grantedBy + '@s.whatsapp.net'))];
    
    await conn.sendMessage(m.chat, {
        text: caption,
        mentions: [...otherMentions, ...grantByMentions]
    });
};

handler.help = ['listprem'];
handler.tags = ['info'];
handler.command = /^(listprem|premiumlist|vip)$/i;

export default handler;