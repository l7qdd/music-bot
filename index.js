process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);
const { Client, GatewayIntentBits } = require("discord.js");
const { DisTube } = require("distube");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { YtDlpPlugin } = require("@distube/yt-dlp");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const distube = new DisTube(client, {
  plugins: [
    new SoundCloudPlugin(),
    new YtDlpPlugin(),
  ],
});

client.on("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!")) return;
  if (message.author.bot) return;

  const args = message.content.split(" ");
  const command = args.shift().toLowerCase();

  if (command === "!play") {
    if (!message.member.voice.channel) {
      return message.reply("❌ ادخل روم صوتي أول");
    }

    const query = args.join(" ");
    if (!query) return message.reply("❌ اكتب اسم الأغنية أو الرابط");

    distube.play(message.member.voice.channel, query, {
      textChannel: message.channel,
      member: message.member,
    });
  }

  if (command === "!skip") {
    distube.skip(message.guild);
    message.channel.send("⏭️ تم التخطي");
  }

  if (command === "!stop") {
    distube.stop(message.guild);
    message.channel.send("⛔ تم الإيقاف");
  }
});

distube
  .on("playSong", (queue, song) => {
    queue.textChannel.send(`🎶 الآن شغال: **${song.name}**`);
  })
  .on("addSong", (queue, song) => {
    queue.textChannel.send(`➕ انضاف: **${song.name}**`);
  })
  .on("error", (channel, e) => {
    console.error(e);
    channel.send("❌ صار خطأ");
  });

client.login(process.env.TOKEN);
