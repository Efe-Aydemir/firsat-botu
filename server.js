const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// --- AYARLAR ---
const token = "8328565394:AAEABWYRkV7lxj2rs8wmL6cE7U_mObgP1E4";
const chatId = "-1003540235173"; // Başında -100 olacak
const refLink = "https://www.binance.com/activity/referral-entry/CPA?ref=CPA_00SMEWJXVV";

// Bot ve Sunucu Ayarları
const bot = new TelegramBot(token, { polling: false });
const app = express();

app.get('/', (req, res) => { res.send('Bot Aktif!'); });
app.listen(process.env.PORT || 3000, () => { console.log('Sunucu başlatıldı.'); });

// --- MANTIK ---
const CHECK_INTERVAL = 15 * 60 * 1000; // 15 Dakika
let sentCoins = new Set();

async function checkMarket() {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
            params: { vs_currency: 'usd', order: 'market_cap_desc', per_page: 100, page: 1, sparkline: false, price_change_percentage: '24h' }
        });

        response.data.forEach(coin => {
            if (coin.price_change_percentage_24h >= 5 && !sentCoins.has(coin.id)) {
                const msg = `🚀 <b>FIRSAT ALARMI</b>\n\nCoin: ${coin.name}\nFiyat: $${coin.current_price}\nDeğişim: %${coin.price_change_percentage_24h.toFixed(2)}\n\n📉 <a href="${refLink}">Hemen Al</a>`;
                bot.sendMessage(chatId, msg, { parse_mode: 'HTML', disable_web_page_preview: true });

                sentCoins.add(coin.id);
                setTimeout(() => sentCoins.delete(coin.id), 3600000);
            }
        });
        console.log("Tarama yapıldı.");
    } catch (e) { console.log("Hata:", e.message); }
}

checkMarket();
setInterval(checkMarket, CHECK_INTERVAL);