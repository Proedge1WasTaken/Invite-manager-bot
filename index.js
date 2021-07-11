const Discord = require("discord.js");
const Enmap = require('enmap');
const moment = require("moment");
var express = require('express');
var app     = express();
const path = require('path')
const client = new Discord.Client();
const config = require("./config.json"); 

client.settings = new Enmap({
  name: "settings",
  fetchAll: false,
  autoFetch: true,
  cloneLevel: 'deep',
  autoEnsure: {
    prefix: "/",
    modLogChannel: "log",
    modRole: "Moderator",
    adminRole: "Pálcika",
    welcomeChannel: "general",
    welcomeMessage: "Say hello to {{user}}, everyone!"
  }
});
const activities_list = [`Supreme helper of ✘KanekiSan✞#7537`, `Supreme helper of ✘KanekiSan✞#7537`, `Supreme helper of ✘KanekiSan✞#7537`, `Supreme helper of ✘KanekiSan✞#7537`];

client.on("ready", () => {
	
setInterval(() => {
        const index = Math.floor(Math.random() * (activities_list.length - 1) + 1);
        client.user.setActivity(activities_list[index]);
		console.log("Aktivitás megváltoztatva "+activities_list[index]+" ra/re");
    }, 40000);
	
console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
// ez kell herokura
/*
app.set('port', (process.env.PORT || 5000));

app.get('/', function(request, response) {
    var result = 'App is running'
    response.send(result);
}).listen(app.get('port'), function() {
    console.log('App is running, server is listening on port ', app.get('port'));
});*/

});

const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))


client.on("guildDelete", guild => {
  client.settings.delete(guild.id);
});

client.on("guildMemberAdd", member => {
  client.settings.ensure(member.guild.id, client.settings);
  let welcomeMessage = client.settings.get(member.guild.id, "welcomeMessage");
  welcomeMessage = welcomeMessage.replace("{{userping}}", "<@"+member.user.id+">");
  welcomeMessage = welcomeMessage.replace("{{user}}", member.user.name);
  welcomeMessage = welcomeMessage.replace("{{server}}", member.guild.name);
  welcomeMessage = welcomeMessage.replace("{{discriminator}}", member.user.discriminator);
  welcomeMessage = welcomeMessage.replace("{{id}}", member.user.id);
  welcomeMessage = welcomeMessage.replace("{{presence}}", member.presence.status);
  welcomeMessage = welcomeMessage.replace("{{tagok}}", client.guilds.cache.get(member.guild.id).memberCount);
  
  member.guild.channels.cache
    .find(channel => channel.name === client.settings.get(member.guild.id, "welcomeChannel"))
    .send(welcomeMessage)
    .catch(console.error);
});

client.on("message", async (message) => {
  if(!message.guild || message.author.bot) return;
  const guildConf = client.settings.get(message.guild.id);
  if(message.content.indexOf(guildConf.prefix) !== 0) return;
  const args = message.content.split(/\s+/g);
  const command = args.shift().slice(guildConf.prefix.length).toLowerCase();
  
  if(command === "setconf") {
    // Command is admin only, let's grab the admin value: 
    const adminRole = message.guild.roles.cache.find(role => role.name === guildConf.adminRole);
    if(!adminRole) {
		console.log(message.author.tag + "Megpróbálta admin rang nélkül futtatni a setconf parancsot");
		return message.reply("Nem találtam admin rangot :< kérlek csinálj egy `Admin` rangot, hogy használni tudj `csak addig kell amig megvaltoztatod az adminRole változót`");
	}
	if (!message.member.hasPermission('KICK_MEMBERS')){
		return message.reply("Nem vagy admin :<!");
	}
	  if(!args.length){
		  console.log(message.author.tag + "Nem adott meg argumentumokat a setconf parancsban");
		  return message.reply("Argumentumot is adj meg kérlek");
		  
	  } 
    const [prop, ...value] = args;
    if(!client.settings.has(message.guild.id, prop)) {
	  console.log(message.author.tag+" Rossz változót adott meg vagy bugos a bot");
      return message.reply("Biztos, hogy jó változót adtál meg?.");
    }
    client.settings.set(message.guild.id, value.join(" "), prop);
    message.channel.send(`${prop} meg lett változtatva:\n\`${value.join(" ")}\``);
  }
 if(command === "showconf") {
	 
	 const adminRole = message.guild.roles.cache.find(role => role.name === guildConf.adminRole);
    if(!adminRole) {
		console.log(message.author.tag + "Megpróbálta admin rang nélkül futtatni a showconf parancsot");
		return message.reply("Nem találtam admin rangot :< kérlek csinálj egy `Admin` rangot, hogy használni tudj `csak addig kell amig megvaltoztatod az adminRole változót`");
	}
	if (!message.member.hasPermission('KICK_MEMBERS')){
		return message.reply("Nem vagy admin :<!");
	}
	 
	 console.log(message.author.tag+" használta a showconf parancsot");
    let configProps = Object.keys(guildConf).map(prop => {
      return `${prop}  :  ${guildConf[prop]}`;
    });
    message.channel.send(`Jelenleg ezek a konfigurációk vannak:
    \`\`\`${configProps.join("\n")}\`\`\``);
  }
  
 if(command === "placeholders"){
	 console.log(message.author.tag+" használta a placeholders parancsot");
 message.channel.send("`{{user}}` - felhasználó neve \n `{{userping}}` - felhasználó megemlitése \n `{{server}}` - szerver neve \n `{{discriminator}}` - felhasználó # utáni számai pl: ✘KanekiSan✞#**7537** \n `{{id}}` - felhasználó idje \n `{[presence}}` - felhasználó státusza \n `{{tagok}}` - jelenlegi tagok száma");
 }
 
 if(command === "help"){
	 	 console.log(message.author.tag+" használta a help parancsot");
 message.channel.send("`/setconf` - beállitások változtatása *pl* `/setconf welcomeChannel welcome` \n `/showconf` - beállitások és változók megtekintése \n `/placeholders` - placeholderek megtekintése");
 }
});
client.login(config.token);