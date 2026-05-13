import { addPremium, getPremiumInfo } from '../../database/premium.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const userId = m.sender.split('@')[0];
    const isUserPremium = isPremium(userId);
    const userInfo = isUserPremium ? getPremiumInfo(userId) : null;
    
    // Si no hay texto, mostrar menú de tienda
    if (!text) {
        let caption = `🛒 *TIENDA PREMIUM - GOHAN BEAST* 🛒
        
╔══════════════════════════╗
║   🐉 *MÉTODOS DE PAGO*   ║
╠══════════════════════════╣
║ 💳 *PayPal*              ║
║ 🔫 *Diamantes Free Fire* ║
║ 💰 *Transferencia*       ║
╚══════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━

💰 *PAGOS CON PAYPAL*
╔══════════════════════════╗
║ 💵 $2 USD → 15 días      ║
║ 💵 $5 USD → 50 días      ║
║ 💵 $10 USD → 120 días    ║
║ 💵 $20 USD → 300 días    ║
╚══════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━

🔫 *DIAMANTES FREE FIRE*
╔══════════════════════════╗
║ 💎 100 diamantes → 15 días║
║ 💎 300 diamantes → 40 días║
║ 💎 500 diamantes → 70 días║
║ 💎 1000 diamantes → 150 días║
╚══════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━

📌 *CÓMO COMPRAR:*

1️⃣ Elige tu método de pago
2️⃣ Usa el comando:
   ${usedPrefix + command} <método> <cantidad>

📝 *Ejemplos:*
▸ ${usedPrefix + command} paypal 2
▸ ${usedPrefix + command} diamantes 500
▸ ${usedPrefix + command} ff 100

━━━━━━━━━━━━━━━━━━━━━━━━━

📞 *CONTACTO PARA MÁS INFO:*
╔══════════════════════════╗
║ 👑 *Owner:* wa.me/5492644138998
║ 📧 *Info:* Sistema Premium
║ 🐉 *Bot:* Gohan Beast V1
╚══════════════════════════╝

${isUserPremium ? `⭐ *TU ESTADO ACTUAL:* ⭐
▸ Días restantes: ${userInfo?.remainingDays || 0}
▸ Expira: ${userInfo?.expiredIn || 'N/A'}` : '💎 *¡Activa tu premium hoy!*'}

> 🐉 *GOHAN BEAST MODE - PODER SIN LÍMITES* 🐉`;

        await conn.sendMessage(m.chat, {
            text: caption,
            contextInfo: {
                externalAdReply: {
                    title: '🛒 TIENDA PREMIUM GOHAN BEAST',
                    body: '¡Activa tu poder máximo!',
                    thumbnail: null,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });
        return;
    }
    
    // Procesar compra
    const args = text.split(' ');
    const metodo = args[0].toLowerCase();
    const cantidad = parseInt(args[1]);
    
    // Definir precios y días
    const planes = {
        // PayPal
        paypal: {
            2: { usd: 2, days: 15, precio: '$2 USD', metodo: 'PayPal' },
            5: { usd: 5, days: 50, precio: '$5 USD', metodo: 'PayPal' },
            10: { usd: 10, days: 120, precio: '$10 USD', metodo: 'PayPal' },
            20: { usd: 20, days: 300, precio: '$20 USD', metodo: 'PayPal' }
        },
        // Diamantes Free Fire
        diamantes: {
            100: { diamantes: 100, days: 15, precio: '100 diamantes FF', metodo: 'Free Fire' },
            300: { diamantes: 300, days: 40, precio: '300 diamantes FF', metodo: 'Free Fire' },
            500: { diamantes: 500, days: 70, precio: '500 diamantes FF', metodo: 'Free Fire' },
            1000: { diamantes: 1000, days: 150, precio: '1000 diamantes FF', metodo: 'Free Fire' }
        },
        ff: {
            100: { diamantes: 100, days: 15, precio: '100 diamantes FF', metodo: 'Free Fire' },
            300: { diamantes: 300, days: 40, precio: '300 diamantes FF', metodo: 'Free Fire' },
            500: { diamantes: 500, days: 70, precio: '500 diamantes FF', metodo: 'Free Fire' },
            1000: { diamantes: 1000, days: 150, precio: '1000 diamantes FF', metodo: 'Free Fire' }
        }
    };
    
    // Buscar el plan
    let plan = null;
    let metodoNombre = '';
    
    if (metodo === 'paypal' && planes.paypal[cantidad]) {
        plan = planes.paypal[cantidad];
        metodoNombre = 'PayPal';
    } else if ((metodo === 'diamantes' || metodo === 'ff') && planes.diamantes[cantidad]) {
        plan = planes.diamantes[cantidad];
        metodoNombre = 'Diamantes Free Fire';
    } else {
        return m.reply(`❌ *OPCIÓN NO VÁLIDA*

Métodos disponibles:
▸ ${usedPrefix + command} paypal 2|5|10|20
▸ ${usedPrefix + command} diamantes 100|300|500|1000
▸ ${usedPrefix + command} ff 100|300|500|1000

📞 *Más info:* wa.me/5492644138998`);
    }
    
    // Confirmar compra
    let compraMsg = `🛒 *SOLICITUD DE COMPRA PREMIUM*

╔══════════════════════════╗
║ 👤 *Usuario:* @${m.sender.split('@')[0]}
║ 💰 *Método:* ${plan.metodo}
║ 💵 *Monto:* ${plan.precio}
║ 📅 *Días premium:* ${plan.days} días
╚══════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━

📝 *INSTRUCCIONES DE PAGO:*

${metodoNombre === 'PayPal' ? 
`💳 *PAGO CON PAYPAL:*
1️⃣ Envía ${plan.usd} USD a la cuenta de PayPal del owner
2️⃣ Captura de pantalla del comprobante
3️⃣ Envía el comprobante al owner

📌 *Cuenta PayPal:* (contactar al owner)` : 

`🔫 *PAGO CON DIAMANTES FF:*
1️⃣ Compra ${plan.diamantes} diamantes en Free Fire
2️⃣ Envía los diamantes al ID del owner
3️⃣ Captura de pantalla de la transacción

📌 *ID Free Fire:* (contactar al owner)`}

━━━━━━━━━━━━━━━━━━━━━━━━━

📞 *CONTACTO DEL OWNER:*
╔══════════════════════════╗
║ 👑 *WhatsApp:* wa.me/5492644138998
║ 💬 *Info:* Gohan Beast Premium
╚══════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ *IMPORTANTE:*
▸ Una vez confirmado el pago, se activará automáticamente
▸ El premium se añadirá a tu tiempo actual
▸ Si tienes premium activo, se sumarán los días

✨ *¡Esperamos tu pago para activar tu poder GOHAN BEAST!* ✨

> 🐉 *Una vez realizado el pago, contacta al owner con el comando .confirmar <código>* 🐉`;

    await conn.sendMessage(m.chat, {
        text: compraMsg,
        mentions: [m.sender]
    });
    
    // Generar código de confirmación único
    const codigoConfirmacion = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Guardar solicitud pendiente (opcional, para seguimiento)
    if (!global.pendingPremiums) global.pendingPremiums = {};
    global.pendingPremiums[codigoConfirmacion] = {
        userId: m.sender.split('@')[0],
        days: plan.days,
        metodo: metodoNombre,
        cantidad: cantidad,
        timestamp: Date.now()
    };
    
    // Enviar mensaje privado al owner con la solicitud
    const ownerMsg = `🛒 *NUEVA SOLICITUD PREMIUM*

👤 *Usuario:* @${m.sender.split('@')[0]}
💰 *Método:* ${plan.metodo}
💵 *Monto:* ${plan.precio}
📅 *Días:* ${plan.days}
🔑 *Código:* ${codigoConfirmacion}

📝 *Para activar, usa:*
.addprem @${m.sender.split('@')[0]} ${plan.days}

> 🐉 GOHAN BEAST MODE`;
    
    // Enviar al owner (si está configurado)
    if (global.owner && global.owner[0]) {
        await conn.sendMessage(global.owner[0] + '@s.whatsapp.net', {
            text: ownerMsg,
            mentions: [m.sender]
        }).catch(() => {});
    }
    
    m.reply(`✅ *SOLICITUD ENVIADA*

Tu solicitud ha sido enviada al owner.

🔑 *Código de seguimiento:* ${codigoConfirmacion}

📞 *Contacta al owner:* wa.me/5492644138998

⏰ *Tiempo de respuesta:* 5-30 minutos

> 🐉 *¡Gracias por tu interés en GOHAN BEAST PREMIUM!* 🐉`);
};

handler.help = ['tienda'];
handler.tags = ['premium'];
handler.command = /^(tienda|shop|premiumshop|comprarprem)$/i;

export default handler;