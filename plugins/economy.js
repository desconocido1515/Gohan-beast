import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const usersFile = path.resolve(__dirname, '../database/users.json')

export function readUsers() {
  try {
    if (!fs.existsSync(usersFile)) {
      fs.writeFileSync(usersFile, JSON.stringify({}))
    }
    return JSON.parse(fs.readFileSync(usersFile))
  } catch {
    return {}
  }
}

export function saveUsers(data) {
  fs.writeFileSync(usersFile, JSON.stringify(data, null, 2))
}

export function getUser(userId) {
  const users = readUsers()
  if (!users[userId]) {
    users[userId] = {
      name: null,
      age: null,
      registered: false,
      coins: 0,
      bank: 0,
      exp: 0,
      lastDaily: 0,
      lastWork: 0,
      lastMine: 0,
      lastRun: 0,
      lastSlut: 0,
      lastRob: 0,
      lastHunt: 0,
      lastFish: 0,
      lastGamble: 0
    }
    saveUsers(users)
  }
  return users[userId]
}

export function updateUser(userId, data) {
  const users = readUsers()
  users[userId] = { ...users[userId], ...data }
  saveUsers(users)
}

export function getCooldown(userId, command) {
  const user = getUser(userId)
  const now = Date.now()
  const last = user[`last${command.charAt(0).toUpperCase() + command.slice(1)}`] || 0
  const cooldown = global.cooldown[command] || 60000
  const remaining = (last + cooldown) - now
  return remaining > 0 ? remaining : 0
}

export function formatTime(ms) {
  if (ms <= 0) return 'Listo'
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}