const TelegramBot = require('node-telegram-bot-api');

// Bot token (sizniki)
const TOKEN = '8220586196:AAH-geuGkxYAyJAsT0ybxtMPdklYQUCUZYY';

// Bot yaratish
const bot = new TelegramBot(TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});

// Xatoliklar
bot.on('polling_error', (err) => {
  console.error(`❌ Polling xatosi: ${err.code} - ${err.message}`);
});

// Obuna kerak bo'lgan kanallar (username)
const SUBSCRIBE_CHANNELS = [

 
];

// Admin ID
const ADMIN_ID = 5746963772;

// ==================== ⚙️ YORDAMCHI FUNKSIYALAR ====================

// Obuna tekshirish
async function checkSubscription(userId) {
  for (let channel of SUBSCRIBE_CHANNELS) {
    try {
      const member = await bot.getChatMember(`@${channel}`, userId);
      if (!['member', 'administrator', 'creator'].includes(member.status)) {
        return false;
      }
    } catch (e) {
      console.warn(`⚠️ Kanal @${channel} topilmadi yoki bot admin emas`);
      return false;
    }
  }
  return true;
}

// Tugmalar yaratish
function buildSubscribeButtons(userName) {
  const buttons = [];

  // Asosiy kanallar
  SUBSCRIBE_CHANNELS.forEach(ch => {
    buttons.push([{
      text: `🔗 Obuna bo'lish`,
      url: `https://t.me/${ch}`
    }]);
  });

  // Qo'shimcha kanallar (toza URL, bo'shliqsiz)
  const extraChannels = [
    
  ];

  extraChannels.forEach(url => {
    buttons.push([{
      text: `🔗 Obuna bo'lish`,
      url
    }]);
  });

  // Tekshirish tugmasi
  buttons.push([{
    text: '☑️ Tekshirish',
    callback_data: 'verify_sub'
  }]);

  return {
    caption: `<i>Salom, ${userName}!</i>\n\n🎯 UC ishlash uchun quyidagi kanallarga obuna bo'ling. Keyin “Tekshirish” tugmasini bosing 👇`,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: buttons }
  };
}

// Rasm jo'natish (xavfsiz)
async function sendSafePhoto(chatId, photoUrl, options) {
  try {
    return await bot.sendPhoto(chatId, photoUrl.trim(), options); // .trim() — bo'shliqni olib tashlaydi
  } catch (e) {
    console.error(`🖼️ Rasm yuborishda xato: ${e.message}`);
    try {
      return await bot.sendMessage(chatId, options.caption || 'Xabar yuborishda xatolik.', {
        parse_mode: options.parse_mode,
        reply_markup: options.reply_markup
      });
    } catch (inner) {
      console.error(`💬 Oddiy xabar yuborishda xato: ${inner.message}`);
      return null;
    }
  }
}

// ==================== 📥 /start va asosiy xabarlar ====================

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'Foydalanuvchi';
  const text = msg.text || '';
  const userId = msg.from.id;

  // Test komanda
  if (text === 'swerzy_savdo') {
    await bot.sendMessage(chatId, "📤 @swerzy_savdo\nKanalga o'tgan odamlar: 11673 ta\nObuna bo'lganlar: 10579 ta\nKanal: 18-oktyabr qo'shilgan!");
    return;
  }

  // Admin komandalari
  if (userId === ADMIN_ID) {
    if (text === '/stats') {
      await bot.sendMessage(ADMIN_ID, "📊 Statistika hozircha mavjud emas (ma'lumotlar bazasi ulanmagan).");
      return;
    }
    if (text === '/send') {
      await bot.sendMessage(ADMIN_ID, "📤 Hozircha mass xabar yuborish imkoniyati yo'q.");
      return;
    }
  }

  // Start bosilganda
  if (text.startsWith('/start')) {
    const isSubscribed = await checkSubscription(userId);

    if (isSubscribed) {
      await sendSafePhoto(chatId, 'https://t.me/idealmakerbot/52', {
        caption: `<b>👋 Salom, ${userName}!</b>\n\n✅ Siz barcha kanallarga obuna bo'ldingiz.\n\n🎮 UC ishlash uchun pastdagi tugmani bosing 👇`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[{
            text: 'Boshlash!',
           url: 'https://telegram-uc-webapp.netlify.app'
          }]]
        }
      });
    } else {
      await sendSafePhoto(chatId, 'https://t.me/idealmakerbot/52', buildSubscribeButtons(userName));
    }
  }
});

// ==================== 🔘 Callback Query Handler ====================

bot.on('callback_query', async (query) => {
  const chatId = query.from.id;
  const userName = query.from.first_name || 'Foydalanuvchi';
  const userId = query.from.id;

  if (query.data === 'verify_sub') {
    await bot.answerCallbackQuery(query.id, { text: 'Obuna tekshirilmoqda...' });

    const isSubscribed = await checkSubscription(userId);

    if (isSubscribed) {
      await sendSafePhoto(chatId, 'https://t.me/idealmakerbot/52', {
        caption: `<b>🎉 Tabriklaymiz!</b>\n\n✅ Siz barcha kanallarga obuna bo'ldingiz.\n\n🎮 UC ishlash uchun pastdagi tugmani bosing 👇`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{
              text: 'Boshlash!',
             url: 'https://telegram-uc-webapp.netlify.app'
            }],
            [{
              text: 'Yangiliklar',
              url: 'https://t.me/javohiruc0002_bot'
            }]
          ]
        }
      });
    } else {
      await sendSafePhoto(chatId, 'https://t.me/idealmakerbot/52', buildSubscribeButtons(userName));
    }
  }
});

console.log('🤖 Bot ishga tushdi!');