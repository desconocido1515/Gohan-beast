import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const premiumFile = path.join(__dirname, 'premium.json');

// Cargar datos premium
export function loadPremium() {
    if (!fs.existsSync(premiumFile)) {
        fs.writeFileSync(premiumFile, JSON.stringify({}, null, 2));
        return {};
    }
    try {
        const data = fs.readFileSync(premiumFile, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
}

// Guardar datos premium
export function savePremium(data) {
    fs.writeFileSync(premiumFile, JSON.stringify(data, null, 2));
}

// Agregar premium a un usuario
export function addPremium(userId, days, owner = 'system') {
    const premium = loadPremium();
    const now = Date.now();
    const expireDate = now + (days * 24 * 60 * 60 * 1000);
    
    // Si ya existe, agregar días al actual
    if (premium[userId]) {
        const oldExpire = premium[userId].expireDate;
        const newExpire = oldExpire > now ? oldExpire + (days * 24 * 60 * 60 * 1000) : expireDate;
        
        premium[userId] = {
            active: true,
            startDate: premium[userId].startDate,
            expireDate: newExpire,
            days: premium[userId].days + days,
            grantedBy: owner,
            grantedAt: new Date(now).toLocaleString(),
            lastRenewal: new Date(now).toLocaleString()
        };
    } else {
        premium[userId] = {
            active: true,
            startDate: now,
            expireDate: expireDate,
            days: days,
            grantedBy: owner,
            grantedAt: new Date(now).toLocaleString()
        };
    }
    
    savePremium(premium);
    return premium[userId];
}

// Remover premium de un usuario
export function removePremium(userId) {
    const premium = loadPremium();
    if (premium[userId]) {
        delete premium[userId];
        savePremium(premium);
        return true;
    }
    return false;
}

// Verificar si un usuario tiene premium activo
export function isPremium(userId) {
    const premium = loadPremium();
    const user = premium[userId];
    
    if (!user) return false;
    
    // Verificar expiración
    if (Date.now() > user.expireDate) {
        user.active = false;
        savePremium(premium);
        return false;
    }
    
    return user.active;
}

// Obtener info de premium de un usuario
export function getPremiumInfo(userId) {
    const premium = loadPremium();
    const user = premium[userId];
    
    if (!user) return null;
    
    const now = Date.now();
    if (now > user.expireDate) {
        user.active = false;
        savePremium(premium);
        return null;
    }
    
    const remaining = user.expireDate - now;
    const remainingDays = Math.ceil(remaining / (24 * 60 * 60 * 1000));
    const remainingHours = Math.floor(remaining / (60 * 60 * 1000));
    
    return {
        ...user,
        remainingDays: remainingDays,
        remainingHours: remainingHours,
        remainingMs: remaining,
        expiredIn: new Date(user.expireDate).toLocaleString()
    };
}

// Listar todos los usuarios premium activos
export function listPremiumUsers() {
    const premium = loadPremium();
    const activeUsers = [];
    const expiredUsers = [];
    
    for (const [userId, data] of Object.entries(premium)) {
        const now = Date.now();
        if (now < data.expireDate) {
            const remaining = data.expireDate - now;
            const remainingDays = Math.ceil(remaining / (24 * 60 * 60 * 1000));
            activeUsers.push({
                userId: userId,
                days: data.days,
                remainingDays: remainingDays,
                startDate: new Date(data.startDate).toLocaleString(),
                expireDate: new Date(data.expireDate).toLocaleString(),
                grantedBy: data.grantedBy
            });
        } else {
            expiredUsers.push({
                userId: userId,
                expiredDate: new Date(data.expireDate).toLocaleString()
            });
        }
    }
    
    // Limpiar expirados automáticamente
    if (expiredUsers.length > 0) {
        for (const expired of expiredUsers) {
            delete premium[expired.userId];
        }
        savePremium(premium);
    }
    
    return activeUsers;
}

// Limpiar premium expirados manualmente
export function cleanExpiredPremium() {
    const premium = loadPremium();
    let cleaned = 0;
    const expiredUsers = [];
    
    for (const [userId, data] of Object.entries(premium)) {
        if (Date.now() > data.expireDate) {
            expiredUsers.push(userId);
            cleaned++;
        }
    }
    
    if (cleaned > 0) {
        for (const userId of expiredUsers) {
            delete premium[userId];
        }
        savePremium(premium);
    }
    
    return cleaned;
}

// Obtener estadísticas de premium
export function getPremiumStats() {
    const premium = loadPremium();
    let active = 0;
    let expired = 0;
    let totalDays = 0;
    
    for (const [_, data] of Object.entries(premium)) {
        if (Date.now() < data.expireDate) {
            active++;
            totalDays += data.days;
        } else {
            expired++;
        }
    }
    
    return {
        activeUsers: active,
        expiredUsers: expired,
        totalUsers: active + expired,
        totalPremiumDays: totalDays
    };
}