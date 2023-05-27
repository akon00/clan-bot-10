
const Discord = require("discord.js");
const http = require("http");
http.createServer((_, res) => res.end("online")).listen(8080);
const colors = require("colors");
const enmap = require("enmap");
const fetch = require('node-fetch');
const fs = require("fs");
//1.1 Validating script
if (!fs.existsSync("./botconfig/advertisement.json")) {
  const data = {
    "adenabled": true,
    "statusad": { "name": "PokemonPlanetCafe", "type": "PLAYING", "url": "https://twitch.tv/#" },
    "spacedot": "・",
    "textad": "> ***Nothing here"
  }
  fs.writeFileSync("./botconfig/advertisement.json", JSON.stringify(data), err => {
    if (err) {
      console.log(err)
      return;
    }
  })
}
if (!require("./botconfig/config.json").status.text2) {
  let data = require("./botconfig/config.json");
  data.status.text2 = "By: discord.gg/milrato"
  fs.writeFileSync("./botconfig/config.json", JSON.stringify(data), err => {
    if (err) {
      console.log(err)
      return;
    }
  })
}
const emojis = require("./botconfig/emojis.json")
const config = require("./botconfig/config.json")
const advertisement = require("./botconfig/advertisement.json")
const { delay } = require("./handlers/functions")


/**********************************************************
 * @param {2} CREATE_THE_DISCORD_BOT_CLIENT with some default settings
 *********************************************************/
const client = new Discord.Client({
  fetchAllMembers: false,
  restTimeOffset: 0,
  failIfNotExists: false,
  shards: "auto",
  allowedMentions: {
    parse: ["roles", "users"],
    repliedUser: false,
  },
  partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER', 'USER'],
  intents: [Discord.Intents.FLAGS.GUILDS,
  Discord.Intents.FLAGS.GUILD_MEMBERS,
  Discord.Intents.FLAGS.GUILD_BANS,
  Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
  Discord.Intents.FLAGS.GUILD_INTEGRATIONS,
  Discord.Intents.FLAGS.GUILD_WEBHOOKS,
  Discord.Intents.FLAGS.GUILD_INVITES,
  Discord.Intents.FLAGS.GUILD_VOICE_STATES,
  Discord.Intents.FLAGS.GUILD_PRESENCES,
  Discord.Intents.FLAGS.GUILD_MESSAGES,
  Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  //Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
  Discord.Intents.FLAGS.DIRECT_MESSAGES,
  Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    //Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING
  ],
  presence: {
    activity: {
      name: `${config.status.text}`.replace("{prefix}", config.prefix),
      type: config.status.type,
      url: config.status.url
    },
    status: "online"
  }
});

client.emoji = require('./emoji.json')
client.credits = `https://discord.gg/Azury`; 

/**********************************************************
 * @param {4} Create_the_client.memer property from Tomato's Api 
 *********************************************************/
const Meme = require("memer-api");
client.memer = new Meme("7Yj4j3k3K98"); //GET a TOKEN HERE: https://discord.gg/Mc2FudJkgP


require("./webport")();
/**********************************************************
 * @param {5} create_the_languages_objects to select via CODE
 *********************************************************/
client.la = {}
var langs = fs.readdirSync("./languages")
for (const lang of langs.filter(file => file.endsWith(".json"))) {
  client.la[`${lang.split(".json").join("")}`] = require(`./languages/${lang}`)
}
Object.freeze(client.la)
//function "handlemsg(txt, options? = {})" is in /handlers/functions 



/**********************************************************
 * @param {6} Raise_the_Max_Listeners to 0 (default 10)
 *********************************************************/
client.setMaxListeners(0);
require('events').defaultMaxListeners = 0;



/**********************************************************
 * @param {7} Define_the_Client_Advertisments from the Config File
 *********************************************************/
client.ad = {
  enabled: advertisement.adenabled,
  statusad: advertisement.statusad,
  spacedot: advertisement.spacedot,
  textad: advertisement.textad
}



/**********************************************************
 * @param {8} LOAD_the_BOT_Functions 
 *********************************************************/
//those are must haves, they load the dbs, events and commands and important other stuff
function requirehandlers() {
  ["extraevents", "loaddb", "clientvariables", "command", "events", "erelahandler", "slashCommands"].forEach(handler => {
    try { require(`./handlers/${handler}`)(client); } catch (e) { console.log(e.stack ? String(e.stack).grey : String(e).grey) }
  });
  ["twitterfeed", /*"twitterfeed2",*/ "livelog", "youtube", "tiktok"].forEach(handler => {
    try { require(`./social_log/${handler}`)(client); } catch (e) { console.log(e.stack ? String(e.stack).grey : String(e).grey) }
  });
  ["logger", "anti_nuke", "antidiscord", "antilinks", "anticaps", "antispam", "blacklist", "keyword", "antimention", "autobackup",

    "apply", "apply2", "apply3", "apply4", "apply5",
    "ticket", "ticketevent",
    "roster", "joinvc",

    "welcome", "leave", "ghost_ping_detector",

    "jointocreate", "reactionrole", "ranking",

    "membercount", "autoembed", "suggest", "validcode", "dailyfact", "autonsfw",
    "aichat", "mute", "automeme", "counter", "boost"].forEach(handler => {
      try { require(`./handlers/${handler}`)(client); } catch (e) { console.log(e.stack ? String(e.stack).grey : String(e).grey) }
    });
    require("fs").readdirSync("./handlers/applies").forEach(file=>{
    try{ require(`./handlers/applies/${file}`)(client); }catch (e){ console.log(e.stack ? String(e.stack).grey : String(e).grey) }
  });
  require("fs").readdirSync("./handlers/tickets").forEach(file=>{
    try{ require(`./handlers/tickets/${file}`)(client); }catch (e){ console.log(e.stack ? String(e.stack).grey : String(e).grey) }
  });
} requirehandlers();


/**********************************************************
 * @param {9} Login_to_the_Bot
 *********************************************************/
setTimeout(() => {
  client.login(process.env.token);
}, 500)

// stop and restart
const glob = require("glob")
client.on("interactionCreate", async (btn) => {
  if (!btn.isButton()) return;
  if (!config.ownerIDS.some(r => r.includes(btn.member.id)))
    return btn.reply({ content: "You can't use this!", ephemeral: true })
  if (btn.customId == "restart_client") {
    btn.reply({ content: "<a:yes:933239140718358558> **__Bot Has Been Succesfully Restarted.__**", ephemeral: true })

    glob(`${__dirname}/*.js`, async (err, file) => {
      client.destroy()
      if (err) return btn.reply(`${err}`)
      file.forEach(f => {
        delete require.cache[require.resolve(f)];
        const pull = require(f)
        console.log(pull.name)
        if (pull.name) {
          client.commands.set(pull.name, pull)
        }
        if (pull.aliases && Array.isArray(pull.aliases)) {
          client.aliases.set(pull.aliases, pull.name)
        }
      })
    })
  }
  if (btn.customId == "stop_client") {
    try {
      btn.reply({ content: "<a:yes:933239140718358558> **Succesfully Stopped the bot. It May Take 5-6 Seconds To ShutDown The Bot..**", ephemeral: true })
      setTimeout(() => {
        process.exit()
      }, 5000)
    } catch (e) {
      btn.reply({ content: `${e}` })
    }
  }
  if (btn.customId == "rename_client") {
    let filter = (m) => m.author.id === btn.user.id;
    const collector = btn.channel.createMessageCollector({ filter, max: 1 })
    btn.reply("Send name")
    /* collector.on("collect", async(msg) => {
      
    }) */ //not needed
    collector.on("end", (collected) => {
      const name = collected.first().content;
      if (!name) {
        return btn.channel.send("No name")
      }
      let beforename = client.user.username;
      client.user.setUsername(name)
        .then((user) => {
          btn.followUp(`Succesfully set name to ${client.user.username} from ${beforename}`)
        })
        .catch((e) => {
          btn.followUp(`${e}`)
        })
    })
  }
  if (btn.customId == "changeav_client") {
    let filter = (m) => m.author.id === btn.user.id;
    const collector = btn.channel.createMessageCollector({ filter, max: 1 })
    btn.reply("Send Image")
    collector.on("collect", async (msg) => {
      if (msg.attachments.size > 0) {
        msg.channel.send("Chaning ...")
        let url = msg.content;
        console.log("url: " + url)
        const response = await fetch(url);
        const buffer = await response.buffer();
        await fs.writeFile(`./image.jpg`, buffer, () =>
          console.log('finished downloading!'));
        client.user.setAvatar(`./image.jpg`)
          .then(user => {
            try {
              fs.unlinkSync()
              channel.send("Succesfully changed avatar")
            } catch{ }
          })
          } else {
        msg.channel.send("No valid image")
      }
    })
  }
})

// auto kill 
setInterval(() => {
  if (set.REPL_SETTINGS.AUTO_KILL && set.REPL_USER) {
    if (!client) {
      client.logger("Rate limit assumed, restarting")
      process.kill(1)
    }
  }
}, 5000)
