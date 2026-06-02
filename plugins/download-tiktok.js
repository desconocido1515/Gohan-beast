import fetch from 'node-fetch'
import { generateWAMessageFromContent, generateWAMessageContent, proto } from '@whiskeysockets/baileys'

var handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(
      `🐉 *GOHAN BEAST - TIKTOK DIVINO* 🐉\n\n⚡ No olvides el enlace guerrero...\n\n📌 Ejemplo: ${usedPrefix + command} https://vm.tiktok.com/ZMkcmTCa6/`
    )
  }

  if (!args[0].match(/(https?:\/\/)?(www\.)?(vm\.|vt\.)?tiktok\.com\//)) {
    return m.reply(
      `🐉 *GOHAN BEAST* 🐉\n\n⚠️ Ese enlace no es de TikTok. ¡El poder del dragón no puede procesarlo!`
    )
  }

  try {
    await conn.reply(
      m.chat,
      '🐉 *GOHAN BEAST* 🐉\n\n⚡ Invocando el poder divino... Preparando la descarga dimensional...',
      m
    )

    const tiktokData = await tiktokdl(args[0])

    if (!tiktokData || !tiktokData.data) {
      return m.reply(
        '🐉 *GOHAN BEAST* 🐉\n\n❌ El poder divino no pudo extraer el contenido. El enlace está corrupto.'
      )
    }

    const videoURL = tiktokData.data.play
    const gohanInfo = `📜 *Título:* ${tiktokData.data.title || 'Sin título'}\n👤 *Autor:* ${tiktokData.data.author?.unique_id || 'Desconocido'}\n🎵 *Música:* ${tiktokData.data.music_info?.title || 'Sin música'}\n❤️ *Likes:* ${tiktokData.data.digg_count || 0}\n💬 *Comentarios:* ${tiktokData.data.comment_count || 0}`

    const businessHeader = {
      key: { remoteJid: m.chat, participant: '0@s.whatsapp.net', fromMe: false, id: 'GohanHeader' },
      message: {
        locationMessage: {
          name: '𝙂𝙊𝙃𝘼𝙉 𝘽𝙀𝘼𝙎𝙏 🐉',
          jpegThumbnail: Buffer.from(await (await fetch('https://files.catbox.moe/dsgmid.jpg')).arrayBuffer()),
          vcard:
            'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            'N:;Gohan Beast;;;\n' +
            'FN:Gohan Beast\n' +
            'ORG:Gohan Beast\n' +
            'TITLE:\n' +
            'item1.TEL;waid=5492644138998:+54 9264-4138998\n' +
            'item1.X-ABLabel:Gohan Beast\n' +
            'X-WA-BIZ-DESCRIPTION:Archivo invocado desde el poder del dragón\n' +
            'X-WA-BIZ-NAME:Gohan Beast\n' +
            'END:VCARD'
        }
      },
      participant: '0@s.whatsapp.net'
    }

    const media = await generateWAMessageContent({
      video: { url: videoURL },
      caption: '🐉 *GOHAN BEAST - PODER DIVINO* 🐉\n\n' + gohanInfo
    }, { upload: conn.waUploadToServer, jid: m.chat })

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: { text: '🐉 *GOHAN BEAST - PODER DIVINO* 🐉\n\n' + gohanInfo },
            footer: { text: '⚡ Gohan Beast - Poder Máximo Activado' },
            header: {
              hasMediaAttachment: true,
              videoMessage: media.videoMessage
            },
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
              messageParamsJson: '',
              buttons: [
                {
                  name: 'cta_copy',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'Copiar enlace',
                    copy_code: args[0]
                  })
                },
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'Abrir TikTok',
                    url: args[0],
                    merchant_url: args[0]
                  })
                }
              ]
            }),
            contextInfo: {
              mentionedJid: [m.sender],
              isForwarded: false
            }
          })
        }
      }
    }, {
      quoted: businessHeader,
      userJid: conn.user?.jid || conn.user?.id,
      upload: conn.waUploadToServer
    })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    await m.react('🐉')
  } catch (error1) {
    conn.reply(
      m.chat,
      `🐉 *GOHAN BEAST* 🐉\n\n❌ Error detectado: ${error1}\nEl poder divino no pudo completar la misión.`,
      m
    )
  }
}

handler.help = ['tiktok']
handler.tags = ['descargas']
handler.command = ['tt', 'tiktok', 'gohantt']

export default handler

async function tiktokdl(url) {
  const tikwm = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`
  const response = await (await fetch(tikwm)).json()
  return response
}