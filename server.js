const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// --- AYARLAR ---
// Tırnakların içine bilgilerini gir (Eşittir işaretinden sonra)
const token = "8328565394:AAEABWYRkV7lxj2rs8wmL6cE7U_mObgP1E4";
const chatId = "-1003540235173"; // Başında -100 olacak!
const refLink = "https://www.binance.com/activity/referral-entry/CPA?ref=CPA_00SMEWJXVV"; 

// Bot ve Sunucu Ayarları
const bot = new TelegramBot(token, { polling: false });
const app = express();

app.get('/', (req, res) => { res.send('Bot Aktif (Binance Modu)!'); });
app.listen(process.env.PORT || 3000, () => { console.log('Sunucu başlatıldı.'); });

// --- MANTIK (BINANCE API) ---
const CHECK_INTERVAL = 15 * 60 * 1000; // 15 Dakika
const MIN_CHANGE = 5; // %5 Yükseliş
let sentCoins = new Set(); 

async function checkMarket() {
  try {
    // Binance'den son 24 saatlik tüm verileri çekiyoruz (Key istemez)
    const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
    
    // Sadece USDT paritelerini filtrele (BTCUSDT, ETHUSDT gibi)
    const pairs = response.data.filter(coin => coin.symbol.endsWith('USDT'));

    pairs.forEach(coin => {
      const change = parseFloat(coin.priceChangePercent);
      const price = parseFloat(coin.lastPrice);
      
      // Filtre: Değişim %5'ten büyükse VE daha önce atılmadıysa
      if (change >= MIN_CHANGE && !sentCoins.has(coin.symbol)) {
        
        // Sembol ismini güzelleştir (ETHUSDT -> ETH)
        const name = coin.symbol.replace('USDT', '');

        const msg = `🚀 <b>FIRSAT ALARMI</b>\n\nCoin: ${name}\nFiyat: $${price}\nDeğişim: %${change.toFixed(2)}\n\n📉 <a href="${refLink}">Hemen Al</a>`;
        
        bot.sendMessage(chatId, msg, { parse_mode: 'HTML', disable_web_page_preview: true });
        
        sentCoins.add(coin.symbol);
        setTimeout(() => sentCoins.delete(coin.symbol), 3600000); // 1 saat sonra unut
      }
    });
    console.log("Binance taraması yapıldı. Sorun yok.");
  } catch (e) { console.log("Hata:", e.message); }
}

checkMarket();
setInterval(checkMarket, CHECK_INTERVAL);
