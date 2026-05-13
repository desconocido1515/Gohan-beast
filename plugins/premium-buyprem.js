let handler = async (m, { conn }) => {
  let link = await conn.groupInviteCode(m.chat)
  m.reply(`🐉 *GOHAN BEAST - PODER PREMIUM* 🐉

⚡ *ACTIVA EL PODER DIVINO*

Con el sistema premium tendrás beneficios ilimitados:
✨ Descargas sin límites
🔥 Pinterest premium
🗡️ Funciones exclusivas
💎 Protección divina
🎮 Comandos de juegos
📁 Descargas de hasta 4K

━━━━━━━━━━━━━━━━━━━━

💲 *PLANES PREMIUM (PayPal)*

┃ ➩ *1 USD* → 17 días de poder
┃ ➩ *2 USD* → 23 días de poder
┃ ➩ *3 USD* → 40 días de poder
┃ ➩ *5 USD* → 125 días de poder
┃ ➩ *10 USD* → 300 días de poder
┃ ➩ *15 USD* → 500 días de poder

━━━━━━━━━━━━━━━━━━━━

💎 *FREE FIRE - DIAMANTES*

┃ ➩ *70 Diamantes* → 10 días
┃ ➩ *100 Diamantes* → 20 días
┃ ➩ *140 Diamantes* → 25 días
┃ ➩ *200 Diamantes* → 30 días
┃ ➩ *355 Diamantes* → 70 días
┃ ➩ *500 Diamantes* → 150 días
┃ ➩ *720 Diamantes* → 250 días
┃ ➩ *1000 Diamantes* → 400 días

━━━━━━━━━━━━━━━━━━━━

🎮 *MÉTODO DE PAGO FREE FIRE*
1. Compra diamantes en tu cuenta
2. Envía captura al owner
3. Recibe tu premium al instante

━━━━━━━━━━━━━━━━━━━━

📌 *MÉTODOS DE PAGO*

💳 PayPal: https://www.paypal.me/master679835
💵 Transferencia bancaria (Consultar)
💰 Binance (USDT/BTC)

━━━━━━━━━━━━━━━━━━━━

👤 *CONTACTO OWNER*
wa.me/5492644138998

━━━━━━━━━━━━━━━━━━━━

🎁 *BONUS*
✨ Premium por 1 año: $50 USD
✨ Premium vitalicio: $100 USD
✨ Premium grupo completo: 30% descuento

━━━━━━━━━━━━━━━━━━━━

🐉 *Que el poder te acompañe, guerrero*
⚡ Gohan Beast - Poder Máximo Activado`)
}

handler.help = ['buyprem']
handler.tags = ['premium']
handler.command = ['comprarpremium', 'buyprem', 'premium', 'donar']

export default handler