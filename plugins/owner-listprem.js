import { listPremiumUsers, getPremiumStats } from '../database/premium.js';

let handler = async (m, { conn }) => {
    const users = listPremiumUsers();
    const stats = getPremiumStats();
    
    if (users.length === 0) {
        return m.reply('📋 *USUARIOS PREMIUM*\n\nNo hay usuarios premium activos en este momento.');
    }
    
    let caption = `🌟 *USUARIOS PREMIUM ACTIVOS* 🌟\n\n`;
    caption += `📊 *Total:* ${stats.activeUsers}\n`;
    caption += `📅 *Días totales:* ${stats.totalDays}\n\n`;
    caption += `📋 *LISTA:*\n`;
    
    for (const user of users) {
        caption += `\n👤 @${user.userId}\n`;
        caption += `📅 Días: ${user.days}\n`;
        caption += `⏰ Restantes: ${user.remainingDays} días\n`;
        caption += `🎫 Otorgado por: @${user.grantedBy}\n`;
        caption += `────────────────\n`;
    }
    
    const mentions = [...users.map(u => u.userId + '@s.whatsapp.net'), ...users.map(u => u.grantedBy + '@s.whatsapp.net')];
    await conn.sendMessage(m.chat, { text: caption, mentions });
};

handler.command = /^(listprem|premiumlist)$/i;
handler.owner = true;
export default handler;