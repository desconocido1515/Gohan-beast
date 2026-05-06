import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { registerUser, loginUser, verifyToken, logoutUser, getOnlineUsers, updateUserSocket, getBotStats } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.WEB_PORT || 3001;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Store de conexiones activas
const connectedSockets = new Map();

// ============ RUTAS API ============

// Registro
app.post('/api/register', async (req, res) => {
  const { email, username, password } = req.body;
  const result = await registerUser(email, username, password);
  res.json(result);
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUser(email, password);
  if (result.success) {
    res.cookie('token', result.token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
  }
  res.json(result);
});

// Logout
app.post('/api/logout', (req, res) => {
  const token = req.cookies.token;
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      logoutUser(decoded.id);
    }
  }
  res.clearCookie('token');
  res.json({ success: true });
});

// Verificar sesión
app.get('/api/verify', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ success: false });
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.json({ success: false });
  }
  res.json({ success: true, user: decoded });
});

// Estadísticas del bot
app.get('/api/stats', (req, res) => {
  const stats = getBotStats();
  res.json(stats);
});

// Usuarios conectados
app.get('/api/online-users', (req, res) => {
  const onlineUsers = getOnlineUsers();
  res.json(onlineUsers);
});

// ============ SOCKET.IO - TIEMPO REAL ============

io.on('connection', (socket) => {
  console.log(`🌀 Nuevo cliente conectado: ${socket.id}`);
  
  // Autenticar usuario por token
  socket.on('auth', (token) => {
    const decoded = verifyToken(token);
    if (decoded) {
      updateUserSocket(decoded.id, socket.id);
      connectedSockets.set(socket.id, decoded.id);
      socket.emit('auth_success', { user: decoded });
      
      // Broadcast de usuarios online actualizado
      io.emit('users_online', getOnlineUsers());
      io.emit('bot_stats', getBotStats());
    } else {
      socket.emit('auth_error', { message: 'Token inválido' });
    }
  });
  
  // Enviar comando al bot
  socket.on('send_command', (data) => {
    const { command, args } = data;
    socket.emit('command_response', { success: true, message: `Comando "${command}" enviado al bot` });
  });
  
  // Desconexión
  socket.on('disconnect', () => {
    const userId = connectedSockets.get(socket.id);
    if (userId) {
      updateUserSocket(userId, null);
      connectedSockets.delete(socket.id);
      io.emit('users_online', getOnlineUsers());
      io.emit('bot_stats', getBotStats());
    }
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });
});

// ============ SERVIR PÁGINAS ============

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════╗
║   🐉 GOHAN BEAST - WEB PANEL 🗡️    ║
╠══════════════════════════════╣
║   🌐 Puerto: ${PORT}                ║
║   🔗 URL: http://localhost:${PORT}  ║
╚══════════════════════════════╝
  `);
});

export { io, server };