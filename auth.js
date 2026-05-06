import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const usersFile = path.join(__dirname, 'database', 'users.json');
const SECRET_KEY = 'gohan-beast-secret-key-2026';

// Asegurar que la carpeta database existe
if (!fs.existsSync(path.join(__dirname, 'database'))) {
  fs.mkdirSync(path.join(__dirname, 'database'), { recursive: true });
}

// Inicializar archivo de usuarios
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
}

// Leer usuarios
const readUsers = () => {
  try {
    const data = fs.readFileSync(usersFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// Guardar usuarios
const saveUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

// Registrar usuario
export const registerUser = async (email, username, password) => {
  const users = readUsers();
  
  // Verificar si ya existe
  if (users.find(u => u.email === email)) {
    return { success: false, error: 'El correo ya está registrado' };
  }
  
  if (users.find(u => u.username === username)) {
    return { success: false, error: 'El nombre de usuario ya existe' };
  }
  
  // Encriptar contraseña
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const newUser = {
    id: Date.now().toString(),
    email,
    username,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    isOnline: false,
    socketId: null
  };
  
  users.push(newUser);
  saveUsers(users);
  
  return { success: true, user: { id: newUser.id, email, username } };
};

// Login usuario
export const loginUser = async (email, password) => {
  const users = readUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return { success: false, error: 'Correo no registrado' };
  }
  
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return { success: false, error: 'Contraseña incorrecta' };
  }
  
  // Actualizar último login y estado online
  user.lastLogin = new Date().toISOString();
  user.isOnline = true;
  saveUsers(users);
  
  // Generar token JWT
  const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, SECRET_KEY, { expiresIn: '24h' });
  
  return { 
    success: true, 
    token,
    user: { id: user.id, email: user.email, username: user.username }
  };
};

// Verificar token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch {
    return null;
  }
};

// Logout usuario
export const logoutUser = (userId) => {
  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].isOnline = false;
    users[userIndex].socketId = null;
    saveUsers(users);
  }
  return { success: true };
};

// Obtener usuarios conectados (en tiempo real)
export const getOnlineUsers = () => {
  const users = readUsers();
  return users.filter(u => u.isOnline).map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    lastLogin: u.lastLogin
  }));
};

// Actualizar socket ID de un usuario
export const updateUserSocket = (userId, socketId) => {
  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].socketId = socketId;
    users[userIndex].isOnline = !!socketId;
    saveUsers(users);
  }
};

// Obtener estadísticas del bot
export const getBotStats = () => {
  const users = readUsers();
  return {
    totalUsers: users.length,
    onlineUsers: users.filter(u => u.isOnline).length,
    registeredToday: users.filter(u => {
      const today = new Date().toDateString();
      return new Date(u.createdAt).toDateString() === today;
    }).length
  };
};

export default { registerUser, loginUser, verifyToken, logoutUser, getOnlineUsers, updateUserSocket, getBotStats };