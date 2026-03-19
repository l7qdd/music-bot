process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);

const ffmpeg = require("ffmpeg-static");
if (ffmpeg) process.env.FFMPEG_PATH = ffmpeg;

const { Client, GatewayIntentBits } = require("discord.js");
const { DisTube } = require("distube");
const { YtDlpPlugin } = require("@distube/yt-dlp");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const distube = new DisTube(client, {
  plugins: [new YtDlpPlugin()]
});

client.on("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!")) return;
  if (message.author.bot) return;

  const args = message.content.split(" ");
  const command = args.shift().toLowerCase();

  // 🎵 تشغيل
  if (command === "!play") {
    if (!message.member.voice.channel) {
      return message.reply("❌ ادخل روم صوتي");
    }

    const query = args.join(" ");

    distube.play(message.member.voice.channel, query, {
      member: message.member,
      textChannel: message.channel,
    });
  }

  // ⏹️ إيقاف
  if (command === "!stop") {
    distube.stop(message);
    message.channel.send("🛑 تم إيقاف الموسيقى");
  }

  // ⏭️ تخطي
  if (command === "!skip") {
    distube.skip(message);
    message.channel.send("⏭️ تم التخطي");
  }
});

// 🎶 لما يبدأ تشغيل
distube.on("playSong", (queue, song) => {
  queue.textChannel.send(`🎶 شغال الآن: ${song.name}`);
});

// ❌ أخطاء
distube.on("error", (channel, error) => {
  console.error(error);
  channel.send("❌ صار خطأ");
});

client.login(process.env.TOKEN);
