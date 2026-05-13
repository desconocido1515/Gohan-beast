import { getPremiumInfo } from '../../database/premium.js';

let handler = async (m, { conn }) => {
    const userId = m.sender.split('@')[0];
    const info = getPremiumInfo(userId);
    
    if (!info) {
        return m.reply(`⭐ *ESTADO PREMIUM*\n\n❌ No tienes premium activo.\n\n✨ *Beneficios premium:*\n• Acceso a comandos exclusivos\n• Descargas sin límites\n• Mayor velocidad\n• Y más...\n\n💎 Contacta al propietario para obtener premium.`);
    }
    
    const remainingMs = info.remainingMs;
    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    
    let caption = `⭐ *TU ESTADO PREMIUM* ⭐\n\n`;
    caption += `✅ *Estado:* ACTIVO\n`;
    caption += `👑 *Usuario:* ${info.grantedBy === 'system' ? 'Sistema' : '@' + info.grantedBy}\n`;
    caption += `📅 *Días otorgados:* ${info.days}\n`;
    caption += `📆 *Inicio:* ${info.startDate}\n`;
    caption += `⏰ *Expira:* ${info.expiredIn}\n\n`;
    caption += `⏳ *Tiempo restante:*\n`;
    caption += `▸ ${remainingDays} días\n`;
    caption += `▸ ${remainingHours} horas\n`;
    caption += `▸ ${remainingMinutes} minutos\n\n`;
    caption += `✨ *Beneficios activos:*\n`;
    caption += `✓ Comandos exclusivos\n`;
    caption += `✓ Descargas prioritarias\n`;
    caption += `✓ Soporte VIP\n\n`;
    caption += `> 🎉 ¡Gracias por ser premium! 🎉`;
    
    const mentions = info.grantedBy !== 'system' ? [info.grantedBy + '@s.whatsapp.net'] : [];
    
    await conn.sendMessage(m.chat, {
        text: caption,
        mentions: mentions
    });
};

handler.help = ['preminfo'];
handler.tags = ['info'];
handler.command = /^(preminfo|checkprem|mipremium)$/i;

export default handler;