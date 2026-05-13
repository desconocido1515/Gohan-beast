import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const premiumFile = path.join(__dirname, 'premium.json');

if (!fs.existsSync(premiumFile)) {
    fs.writeFileSync(premiumFile, JSON.stringify({}, null, 2));
}

export function addPremium(userId, days, owner = 'system') {
    const premium = JSON.parse(fs.readFileSync(premiumFile));
    const now = Date.now();
    const expireDate = now + (days * 24 * 60 * 60 * 1000);
    
    if (premium[userId]) {
        premium[userId].expireDate = premium[userId].expireDate > now ? premium[userId].expireDate + (days * 24 * 60 * 60 * 1000) : expireDate;
        premium[userId].days += days;
        premium[userId].lastRenewal = new Date().toLocaleString();
    } else {
        premium[userId] = {
            active: true,
            startDate: now,
            expireDate: expireDate,
            days: days,
            grantedBy: owner,
            grantedAt: new Date().toLocaleString()
        };
    }
    
    fs.writeFileSync(premiumFile, JSON.stringify(premium, null, 2));
    return true;
}

export function removePremium(userId) {
    const premium = JSON.parse(fs.readFileSync(premiumFile));
    if (premium[userId]) {
        delete premium[userId];
        fs.writeFileSync(premiumFile, JSON.stringify(premium, null, 2));
        return true;
    }
    return false;
}

export function isPremium(userId) {
    const premium = JSON.parse(fs.readFileSync(premiumFile));
    const user = premium[userId];
    if (!user) return false;
    if (Date.now() > user.expireDate) {
        delete premium[userId];
        fs.writeFileSync(premiumFile, JSON.stringify(premium, null, 2));
        return false;
    }
    return true;
}

export function getPremiumInfo(userId) {
    const premium = JSON.parse(fs.readFileSync(premiumFile));
    const user = premium[userId];
    if (!user) return null;
    if (Date.now() > user.expireDate) {
        delete premium[userId];
        fs.writeFileSync(premiumFile, JSON.stringify(premium, null, 2));
        return null;
    }
    
    const remaining = user.expireDate - Date.now();
    const remainingDays = Math.ceil(remaining / (24 * 60 * 60 * 1000));
    const remainingHours = Math.floor(remaining / (60 * 60 * 1000));
    
    return {
        days: user.days,
        remainingDays: remainingDays,
        remainingHours: remainingHours,
        remainingMs: remaining,
        expiredIn: new Date(user.expireDate).toLocaleString(),
        startDate: new Date(user.startDate).toLocaleString(),
        grantedBy: user.grantedBy,
        grantedAt: user.grantedAt
    };
}

export function listPremiumUsers() {
    const premium = JSON.parse(fs.readFileSync(premiumFile));
    const active = [];
    
    for (const [userId, data] of Object.entries(premium)) {
        if (Date.now() < data.expireDate) {
            active.push({
                userId: userId,
                days: data.days,
                remainingDays: Math.ceil((data.expireDate - Date.now()) / (24 * 60 * 60 * 1000)),
                expireDate: new Date(data.expireDate).toLocaleString(),
                grantedBy: data.grantedBy
            });
        } else {
            delete premium[userId];
        }
    }
    
    fs.writeFileSync(premiumFile, JSON.stringify(premium, null, 2));
    return active;
}

export function cleanExpiredPremium() {
    const premium = JSON.parse(fs.readFileSync(premiumFile));
    let cleaned = 0;
    
    for (const [userId, data] of Object.entries(premium)) {
        if (Date.now() > data.expireDate) {
            delete premium[userId];
            cleaned++;
        }
    }
    
    if (cleaned > 0) {
        fs.writeFileSync(premiumFile, JSON.stringify(premium, null, 2));
    }
    
    return cleaned;
}

export function getPremiumStats() {
    const active = listPremiumUsers();
    return {
        activeUsers: active.length,
        totalDays: active.reduce((sum, u) => sum + u.days, 0)
    };
}

console.log('✅ Sistema premium cargado');