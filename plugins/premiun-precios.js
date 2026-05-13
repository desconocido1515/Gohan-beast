let handler = async (m, { conn, usedPrefix, command }) => {
    let caption = `💰 *TABLA DE PRECIOS PREMIUM*

╔═════════════════════════════╗
║         🐉 *GOHAN BEAST* 🐉       ║
╠═════════════════════════════╣
║                                   ║
║  💳 *PAYPAL*                      ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━║
║  ▸ $2 USD  → 15 días premium      ║
║  ▸ $5 USD  → 50 días premium      ║
║  ▸ $10 USD → 120 días premium     ║
║  ▸ $20 USD → 300 días premium     ║
║                                   ║
║  🔫 *DIAMANTES FREE FIRE*         ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━║
║  ▸ 100 diamantes → 15 días        ║
║  ▸ 300 diamantes → 40 días        ║
║  ▸ 500 diamantes → 70 días        ║
║  ▸ 1000 diamantes → 150 días      ║
║                                   ║
╚═════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━

📌 *CÓMO COMPRAR:*

1️⃣ Usa ${usedPrefix}tienda
2️⃣ Elige tu plan
3️⃣ Sigue las instrucciones
4️⃣ Contacta al owner

━━━━━━━━━━━━━━━━━━━━━━━━━

📞 *CONTACTO:*
👑 wa.me/5492644138998

> 🐉 *¡Desata tu poder interior con GOHAN BEAST PREMIUM!* 🐉`;

    await conn.sendMessage(m.chat, { text: caption });
};

handler.help = ['precios'];
handler.tags = ['info'];
handler.command = /^(precios|planes|prices)$/i;

export default handler;