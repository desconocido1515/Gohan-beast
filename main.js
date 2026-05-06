// 🐉⚡ GOHAN BEAST MODE - MAIN BOT ⚡🐉
import fs from 'fs'
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import * as ws from 'ws';
import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, mkdirSync, rmSync } from 'fs';
import yargs from 'yargs';
import chalk from 'chalk';
import syntaxerror from 'syntax-error';
import { tmpdir } from 'os';
import { format } from 'util';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import lodash from 'lodash';
import readline from 'readline';
import NodeCache from 'node-cache';
import qrcode from 'qrcode-terminal';
import { spawn } from 'child_process';
import { setInterval } from 'timers';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
process.env.TMPDIR = path.join(process.cwd(), 'tmp');

if (!fs.existsSync(process.env.TMPDIR)) {
  fs.mkdirSync(process.env.TMPDIR, { recursive: true });
}

import './config.js';
import { createRequire } from 'module';

const { proto } = (await import('@whiskeysockets/baileys')).default;
const {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
} = await import('@whiskeysockets/baileys');

const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

protoType();
serialize();

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};
global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
};
global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};

global.API = (name, path = '/', query = {}, apikeyqueryname) =>
  (name in global.APIs ? global.APIs[name] : name) +
  path +
  (query || apikeyqueryname
    ? '?' +
      new URLSearchParams(
        Object.entries({
          ...query,
          ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}),
        })
      )
    : '');

global.timestamp = { start: new Date() };

const __dirname = global.__dirname(import.meta.url);

console.log(chalk.bold.cyan('\n' + '═'.repeat(60)));
console.log(chalk.bold.yellow('   🐉⚡ GOHAN BESTIA - PODER MÁXIMO ACTIVADO ⚡🐉'));
console.log(chalk.bold.cyan('═'.repeat(60)));
console.log(chalk.bold.cyan('═'.repeat(60) + '\n'));

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp(
  '^[' +
    (opts['prefix'] || '‎z/#$%.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') +
    ']'
);

global.db = new Low(new JSONFile(`storage/databases/database.json`));

global.isDatabaseModified = false;
global.markDatabaseModified = () => {
  global.isDatabaseModified = true;
};

global.DATABASE = global.db;
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ)
    return new Promise((resolve) =>
      setInterval(async function () {
        if (!global.db.READ) {
          clearInterval(this);
          resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
        }
      }, 1 * 1000)
    );
  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read().catch(console.error);
  global.db.READ = null;
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {}),
  };
  global.db.chain = lodash.chain(global.db.data);

  const originalSet = global.db.chain.set.bind(global.db.chain);
  global.db.chain.set = (...args) => {
    const result = originalSet(...args);
    global.markDatabaseModified();
    return result;
  };
};

global.authFile = `sessions`;
const { state, saveCreds } = await useMultiFileAuthState(global.authFile);

const { version } = await fetchLatestBaileysVersion();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

const logger = pino({
  timestamp: () => `,"time":"${new Date().toJSON()}"`,
}).child({ class: 'client' });
logger.level = 'fatal';

const connectionOptions = {
  version: version,
  logger,
  printQRInTerminal: false,
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, logger),
  },
  browser: Browsers.ubuntu('Chrome'),
  markOnlineOnclientect: false,
  generateHighQualityLinkPreview: true,
  syncFullHistory: true,
  retryRequestDelayMs: 10,
  transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 10 },
  maxMsgRetryCount: 15,
  appStateMacVerification: {
    patch: false,
    snapshot: false,
  },
  getMessage: async (key) => {
    const jid = jidNormalizedUser(key.remoteJid);
    return '';
  },
};

global.conn = makeWASocket(connectionOptions);
global.conns = global.conns || [];

let handler;
try {
  const handlerModule = await import('./handler.js');
  handler = handlerModule.handler;
} catch (e) {
  console.error(chalk.red('[ERROR] No se pudo cargar el handler principal:'), e);
  process.exit(1);
}

async function reconnectSubBot(botPath) {
  try {
    const { state: subBotState, saveCreds: saveSubBotCreds } = await useMultiFileAuthState(botPath);

    if (!subBotState.creds.registered) {
      return;
    }

    const subBotConn = makeWASocket({
      version: version,
      logger,
      printQRInTerminal: false,
      auth: {
        creds: subBotState.creds,
        keys: makeCacheableSignalKeyStore(subBotState.keys, logger),
      },
      browser: Browsers.ubuntu('Chrome'),
      markOnlineOnclientect: false,
      generateHighQualityLinkPreview: true,
      syncFullHistory: true,
      retryRequestDelayMs: 10,
      transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 10 },
      maxMsgRetryCount: 15,
      appStateMacVerification: {
        patch: false,
        snapshot: false,
      },
      getMessage: async (key) => '',
    });

    subBotConn.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'open') {
        const yaExiste = global.conns.some(c => c.user?.jid === subBotConn.user?.jid);
        if (!yaExiste) {
          global.conns.push(subBotConn);
        }
      } else if (connection === 'close') {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        if (reason === DisconnectReason.loggedOut || reason === 401) {
          global.conns = global.conns.filter(conn => conn.user?.jid !== subBotConn.user?.jid);
          try {
            rmSync(botPath, { recursive: true, force: true });
          } catch (e) {}
        }
      }
    });

    subBotConn.ev.on('creds.update', saveSubBotCreds);
    subBotConn.handler = handler.bind(subBotConn);
    subBotConn.ev.on('messages.upsert', subBotConn.handler);

    if (!global.subBots) {
      global.subBots = {};
    }
    global.subBots[path.basename(botPath)] = subBotConn;

  } catch (e) {}
}

async function startSubBots() {
  const rutaJadiBot = join(__dirname, './JadiBots');

  if (!existsSync(rutaJadiBot)) {
    mkdirSync(rutaJadiBot, { recursive: true });
  }

  const readRutaJadiBot = readdirSync(rutaJadiBot);
  if (readRutaJadiBot.length > 0) {
    const credsFile = 'creds.json';

    for (const subBotDir of readRutaJadiBot) {
      const botPath = join(rutaJadiBot, subBotDir);
      if (statSync(botPath).isDirectory()) {
        const readBotPath = readdirSync(botPath);
        if (readBotPath.includes(credsFile)) {
          await reconnectSubBot(botPath);
        }
      }
    }
  }
}

await startSubBots();

async function handleLogin() {
  if (conn.authState.creds.registered) {
    return;
  }

  let loginMethod = await question(
    `\n` +
    `╔════════════════════════════════════╗\n` +
    `║     🐉 GOHAN BESTIA MODE 🐉       ║\n` +
    `╠════════════════════════════════════╣\n` +
    `║ ¿Cómo deseas activar el poder?     ║\n` +
    `║                                    ║\n` +
    `║ 📱 Escribe "code" para código      ║\n` +
    `║    de emparejamiento               ║\n` +
    `║                                    ║\n` +
    `║ 🔳 Presiona Enter para QR          ║\n` +
    `╚════════════════════════════════════╝\n` +
    `\n` +
    `> `
  );

  loginMethod = loginMethod.toLowerCase().trim();

  if (loginMethod === 'code') {
    let phoneNumber = await question('📱 Ingresa el número de WhatsApp:\n> ');
    phoneNumber = phoneNumber.replace(/\D/g, '');

    if (phoneNumber.startsWith('52') && phoneNumber.length === 12) {
      phoneNumber = `521${phoneNumber.slice(2)}`;
    } else if (phoneNumber.startsWith('52') && phoneNumber.length === 10) {
      phoneNumber = `521${phoneNumber}`;
    } else if (phoneNumber.startsWith('0')) {
      phoneNumber = phoneNumber.replace(/^0/, '');
    }

    if (typeof conn.requestPairingCode === 'function') {
      try {
        if (conn.ws.readyState === ws.OPEN) {
          let code = await conn.requestPairingCode(phoneNumber);
          code = code?.match(/.{1,4}/g)?.join('-') || code;
          console.log(chalk.bold.green('\n════════════════════════════════════'));
          console.log(chalk.bold.yellow(`   🔐 CÓDIGO DE EMPAREJAMIENTO:`));
          console.log(chalk.bold.cyan(`      ${code}`));
          console.log(chalk.bold.green('════════════════════════════════════\n'));
        }
      } catch (e) {}
    }
  } else {
    conn.ev.on('connection.update', ({ qr }) => {
      if (qr) {
        qrcode.generate(qr, { small: true });
      }
    });
  }
}

await handleLogin();

conn.isInit = false;
conn.well = false;

if (!opts['test']) {
  if (global.db) {
    setInterval(async () => {
      if (global.db.data && global.isDatabaseModified) {
        await global.db.write();
        global.isDatabaseModified = false;
      }
      if (opts['autocleartmp']) {
        const tmp = [tmpdir(), 'tmp', 'serbot'];
        tmp.forEach((filename) => {
          spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete']);
        });
      }
    }, 30 * 1000);
  }
}

function clearTmp() {
  const tmp = [join(__dirname, './tmp')];
  const filename = [];
  tmp.forEach((dirname) => readdirSync(dirname).forEach((file) => filename.push(join(dirname, file))));
  return filename.map((file) => {
    const stats = statSync(file);
    if (stats.isFile() && Date.now() - stats.mtimeMs >= 1000 * 60 * 1) return unlinkSync(file);
    return false;
  });
}

setInterval(() => {
  if (global.stopped === 'close' || !conn || !conn.user) return;
  clearTmp();
}, 180000);

if (typeof global.gc === 'function') {
  setInterval(() => {
    global.gc();
  }, 180000);
}

async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin } = update;
  global.stopped = connection;

  if (isNewLogin) {
    conn.isInit = true;
  }

  const code =
    lastDisconnect?.error?.output?.statusCode ||
    lastDisconnect?.error?.output?.payload?.statusCode;

  if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
    await global.reloadHandler(true).catch(console.error);
    global.timestamp.connect = new Date();
  }

  if (global.db.data == null) await loadDatabase();

  if (connection === 'open') {
    console.log(chalk.bold.green('\n════════════════════════════════════'));
    console.log(chalk.bold.yellow('   🐉 GOHAN BESTIA HA DESPERTADO 🐉'));
    console.log(chalk.bold.green('════════════════════════════════════\n'));
  }

  const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

  if (reason === 405) {
    if (existsSync('./sessions/creds.json')) unlinkSync('./sessions/creds.json');
    process.send('reset');
  }

  if (connection === 'close') {
    switch (reason) {
      case DisconnectReason.badSession:
        break;
      case DisconnectReason.connectionClosed:
      case DisconnectReason.connectionLost:
      case DisconnectReason.timedOut:
        await global.reloadHandler(true).catch(console.error);
        break;
      case DisconnectReason.connectionReplaced:
        break;
      case DisconnectReason.loggedOut:
        break;
      case DisconnectReason.restartRequired:
        await global.reloadHandler(true).catch(console.error);
        break;
      default:
        await global.reloadHandler(true).catch(console.error);
        break;
    }
  }
}

process.on('uncaughtException', (err) => {});

let isInit = true;

global.reloadHandler = async function (restartConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
    if (Handler && Handler.handler) handler = Handler.handler;
  } catch (e) {}

  if (restartConn) {
    try {
      if (global.conn.ws) global.conn.ws.close();
    } catch {}
    global.conn.ev.removeAllListeners();
    global.conn = makeWASocket(connectionOptions);
    isInit = true;
  }

  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler);
    conn.ev.off('connection.update', conn.connectionUpdate);
    conn.ev.off('creds.update', conn.credsUpdate);
  }

  conn.handler = handler.bind(global.conn);
  conn.connectionUpdate = connectionUpdate.bind(global.conn);
  conn.credsUpdate = saveCreds.bind(global.conn, true);

  conn.ev.on('messages.upsert', conn.handler);
  conn.ev.on('connection.update', conn.connectionUpdate);
  conn.ev.on('creds.update', conn.credsUpdate);

  isInit = false;
  return true;
};

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'));
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};

async function filesInit() {
  let loaded = 0;
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const file = global.__filename(join(pluginFolder, filename));
      const module = await import(file);
      global.plugins[filename] = module.default || module;
      loaded++;
    } catch (e) {
      conn.logger.error(`Error al cargar el plugin '${filename}': ${e}`);
      delete global.plugins[filename];
    }
  }
}

await filesInit();

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    const dir = global.__filename(join(pluginFolder, filename), true);
    if (filename in global.plugins) {
      if (existsSync(dir)) conn.logger.info(`🔄 Plugin actualizado - '${filename}'`);
      else {
        conn.logger.warn(`🗑️ Plugin eliminado - '${filename}'`);
        return delete global.plugins[filename];
      }
    } else conn.logger.info(`✨ Nuevo plugin - '${filename}'`);

    const err = syntaxerror(readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
    });
    if (err) conn.logger.error(`❌ Error de sintaxis en '${filename}':\n${format(err)}`);
    else {
      try {
        const module = await import(`${global.__filename(dir)}?update=${Date.now()}`);
        global.plugins[filename] = module.default || module;
      } catch (e) {
        conn.logger.error(`❌ Error al cargar plugin '${filename}':\n${format(e)}`);
      } finally {
        global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
      }
    }
  }
};
Object.freeze(global.reload);

watch(pluginFolder, global.reload);
await global.reloadHandler();

// ========== INICIAR WEB PANEL (GOHAN BEAST) ==========
import('./web-server.js').then(() => {
  console.log('🐉 Web panel de Gohan Beast iniciado correctamente');
  console.log('🌐 Panel web: http://localhost:3001');
}).catch(err => {
  console.error('❌ Error al iniciar web panel:', err.message);
});

console.log(chalk.bold.magenta('\n' + '⭐'.repeat(30)));
console.log(chalk.bold.yellow('   🐉 GOHAN BESTIA - LISTO PARA PELEAR 🐉'));
console.log(chalk.bold.magenta('⭐'.repeat(30) + '\n'));