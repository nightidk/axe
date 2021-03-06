import { CommandInteraction, Message, GuildMember, MessageEmbed, MessageButton, MessageActionRow } from "discord.js";
import { Bot, ContextMenu, SimpleCommandMessage } from "discordx";
import {
  Discord,
  SimpleCommand,
  SimpleCommandOption,
  SimpleCommandOptionType,
  Slash,
} from "discordx";

import { MongoClient } from "mongodb";
import { readFileSync } from "fs";


const configRead = readFileSync("./config.json", 'utf8');
const config = JSON.parse(configRead);
const DB_LOG = config.DB;
const mongoClient = new MongoClient(DB_LOG);

function fixZeroNumber(value: number | string) {
  return `${value}`.length == 1 ? "0" + value : "" + value; 
}

interface strftimeOptions {
  format?: string
};

function strftime(time: Date, options?: strftimeOptions ) {
  const milliseconds = time.getMilliseconds();
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();
  const day = time.getDate();
  const month = time.getMonth();
  const year = time.getFullYear();
  const monthsnames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]

  if (options?.format) {
    var formatString = options.format;
    formatString = formatString.replaceAll("%ms", `${milliseconds}`);
    formatString = formatString.replaceAll("%S", `${fixZeroNumber(seconds)}`);
    formatString = formatString.replaceAll("%M", `${fixZeroNumber(minutes)}`);
    formatString = formatString.replaceAll("%H", `${fixZeroNumber(hours)}`);
    formatString = formatString.replaceAll("%d", `${fixZeroNumber(day)}`);
    formatString = formatString.replaceAll("%m", `${fixZeroNumber(month)}`);
    formatString = formatString.replaceAll("%mn", `${monthsnames[month-1]}`);
    formatString = formatString.replaceAll("%Y", `${year}`);
    formatString = formatString.replaceAll("%y", `${year.toString().substring(3, 4)}`);
    return formatString;
  } else {
    return `${hours}:${minutes}:${seconds} ${monthsnames[month-1]} ${day}, ${year}`
  }
}

function lvl_line(exp: number, nexp: number) {
    var procents = parseInt((exp / nexp * 100).toFixed(0)) || 0;
    var bar = 0
    var empty_bar = [
        '<:sle:798078336344784896>', 
        '<:le:798078351691612160>', 
        '<:ele:798078363973320724>'
    ]
    var to_return;
    var selected = [
        '<a:rb1:799051798090219530>', 
        '<a:rb2:799051797309554748>', 
        '<a:rb3:799051797494366228>', 
        '<a:rb4:799051798375694367>', 
        '<a:rb5:799051797368012802>', 
        '<a:rb6:799051797108621333>', 
        '<a:rb7:799051798576627733>', 
        '<a:rb8:799051798529703986>', 
        '<a:rb9:799051797460156417>', 
        '<a:rb10:799051797608136747>'
    ]

    if (procents < 10) bar = 0
    else if (procents < 90) bar = parseInt(procents.toString()[0] || "0")
    else {
        if (procents < 95) bar = 9
        else if (procents <= 99) bar = 10
        else bar = 10
    }
    if (bar == 0) {
        to_return = `${empty_bar[0]}`;
        for (var x = 0; x < 8; x++) to_return += `${empty_bar[1]}`
        to_return += `${empty_bar[2]}`
    } else if (bar == 1) {
        to_return = `${selected[0]}`
        for (var x = 0; x < 8; x++) to_return += `${empty_bar[1]}`
        to_return += `${empty_bar[2]}`
    } else if (bar == 2) {
        to_return = `${selected[0]}`
        to_return += `${selected[1]}`
        for (var x = 0; x < 7; x++) to_return += `${empty_bar[1]}`
        to_return += `${empty_bar[2]}`
    } else if (bar == 3) {
        to_return = `${selected[0]}`
        for (var x = 0; x < 2; x++) to_return += `${selected[x + 1]}`
        for (var x = 0; x < 6; x++) to_return += `${empty_bar[1]}`
        to_return += `${empty_bar[2]}`
    } else if (bar == 4) {
        to_return = `${selected[0]}`
        for (var x = 0; x < 3; x++) to_return += `${selected[x + 1]}`
        for (var x = 0; x < 5; x++) to_return += `${empty_bar[1]}`
        to_return += `${empty_bar[2]}`
    } else if (bar == 5) {
        to_return = `${selected[0]}`
        for (var x = 0; x < 4; x++) to_return += `${selected[x + 1]}`
        for (var x = 0; x < 4; x++) to_return += `${empty_bar[1]}`
        to_return += `${empty_bar[2]}`
    } else if (bar == 6) {
        to_return = `${selected[0]}`
        for (var x = 0; x < 5; x++) to_return += `${selected[x + 1]}`
        for (var x = 0; x < 3; x++) to_return += `${empty_bar[1]}`
        to_return += `${empty_bar[2]}`
    } else if (bar == 7) {
        to_return = `${selected[0]}`
        for (var x = 0; x < 6; x++) to_return += `${selected[x + 1]}`
        for (var x = 0; x < 2; x++) to_return += `${empty_bar[1]}`
        to_return += `${empty_bar[2]}`
    } else if (bar == 8) {
        to_return = `${selected[0]}`
        for (var x = 0; x < 7; x++)
            to_return += `${selected[x + 1]}`
        to_return += `${empty_bar[1]}`
        to_return += `${empty_bar[2]}`
    } else if (bar == 9) {
        to_return = `${selected[0]}`
        for (var x = 0; x < 8; x++) to_return += `${selected[x + 1]}`
        to_return += `${empty_bar[2]}`
    } else {
        to_return = `${selected[0]}`
        for (var x = 0; x < 8; x++) to_return += `${selected[x + 1]}`
        to_return += `${selected[selected.length - 1]}`
    }
    return to_return

}

function rank(level: number) {
  const roles = Object.keys(config.ROLES_LVL).reverse();
  for (var i = 0; i < roles.length; i++) {
      if (level >= parseInt(roles[i] || "0")) {
          return config.ROLES_LVL[roles[i] || 0]['name']
      }
  }       
}

function divmod(value: number, del: number) {
    
  var quotient = Math.floor(value/del);
  var remainder = value % del;

  
  return [quotient, remainder];
}

function seconds_to_hh_mm_ss(seconds: number | null) {
    /* Convert seconds to d hh:mm:ss */
    if (seconds === null) {
      return "???? ??????????????.";
    }
    var time_m_s = divmod(seconds, 60)
    var time_h_m = divmod((time_m_s[0] || 0), 60)
    var time_d_h = divmod((time_h_m[0] || 0), 24)

    const d = time_d_h[0] || 0;
    const h = time_d_h[1] || 0;
    const m = time_h_m[1] || 0;
    const s = time_m_s[1] || 0;

    if (seconds >= 86400) {
        return `${d}????. ${fixZeroNumber(h)}:${fixZeroNumber(m)}:${fixZeroNumber(s)}`;
    } else {
        return `${fixZeroNumber(h)}:${fixZeroNumber(m)}:${fixZeroNumber(s)}`;
    }
}

@Discord()
export class UserCommands {

  @SimpleCommand("profile", { aliases: ['p', 'prof', '??????????????', '??', '????????'], directMessage: false })
  async profile(
    @SimpleCommandOption("user", { type: SimpleCommandOptionType.User })
    user: GuildMember | undefined,
    command: SimpleCommandMessage
  ) {
    try {
      //if (command.message.channel.id != "850403900967747644" && command.message.channel.id != "799372558813102091" && command.message.channel.id != "928315285323268136") return;
      if (!user) user = await command.message.guild?.members.fetch(command.message.author.id);
      await mongoClient.connect();
      const db = mongoClient.db("axe");
      const collection = db.collection("users");
      if (await collection.count({ id: `${user?.id}` }) == 0) {
        var user_info = config.db_user_example;
        user_info.id = user_info.id.replace("{user}", `${user?.id}`);
        collection.insertOne(user_info);
      }
      var embed = new MessageEmbed();
      embed.setColor(0x2f3136);
      embed.setFooter({ text: `${command.message.member?.nickname || command.message.author.username} | ${command.message.author.id}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
      embed.setTimestamp(new Date());
      embed.setThumbnail(user?.avatarURL({ dynamic: true, format: "png" }) || user?.user.avatarURL({ dynamic: true, format: "png" }) || "");
      embed.setAuthor({ "name": `?????????????? ??? ${user?.user.username}` })
      const result = await collection.findOne({ id: `${user?.id}` }) || null;
      const level = result?.level;
      if (level < 25) {
        try {
          user?.roles.add("911619617259130880");
        } catch (e) {
          console.log(e);
        }
      } 
      var partner = result?.partner;
      if (partner == "") {
        partner = "??????????????????????";
      } else {
        const puser = command.message.guild?.members.cache.get(result?.partner); 
        if (partner) partner = `${puser?.user.username}#${puser?.user.discriminator}`;
        else partner = "?????? ???? ??????????????.";
      } 
      var marry_time = result?.marry_time;
      if (marry_time != 0) marry_time = new Date().getTime() - result?.marry_time;
      //const level_emoji = //bot.emojis.cache.get("911964609420865556");
      embed.addFields([
        { name: `<:level:911964609420865556> ??????????????`, value: `${lvl_line(result?.exp, result?.nexp)} \`${parseInt(((result?.exp || 1) / (result?.nexp || 1) * 100).toFixed(0))}%\` \`(${result?.exp}/${result?.nexp})\`\n\`[${result?.level}] ${rank(result?.level)}\``, inline: false },
        { name: '????????', value: `\`\`\`diff\n- ${partner}\n\`\`\``, inline: true },
        { name: '???????????????????????? ??????????', value: `\`\`\`glsl\n${seconds_to_hh_mm_ss(marry_time)}\n\`\`\``, inline: true }
      ]);
      const helloBtn = new MessageButton()
        .setLabel("????????????????????")
        .setStyle("SUCCESS")
        .setCustomId("profile-achievements");

      const row = new MessageActionRow().addComponents(helloBtn);
      if (user?.user.id == command.message.author.id) command.message.reply({ embeds: [embed], components: [row] });
      else command.message.reply({ embeds: [embed] });
    } catch (err) {
      console.log(err);
    } finally {
      await mongoClient.close();
    }
  }

  @SimpleCommand("avatar", { aliases: ['av'], directMessage: false })
  async avatar(
    @SimpleCommandOption("user", { type: SimpleCommandOptionType.User })
    user: GuildMember | undefined,
    command: SimpleCommandMessage
  ) {

    if (!user) {
      user = command.message.member || undefined;
    }

    const embed = new MessageEmbed();
    embed.setColor(0x2f3136);
    embed.setTitle(`???????????? ${user?.user.username}#${user?.user.discriminator}`);
    embed.setImage(user?.avatarURL({ size: 2048, dynamic: true, format: "png" }) || user?.user.avatarURL({ size: 2048, dynamic: true, format: "png" }) || "");
    embed.setTimestamp(new Date());
    embed.setFooter({ text: command.message.member?.nickname || command.message.author.username, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
    await command.message.channel.send({ embeds: [embed] });

  }

  @SimpleCommand("userinfo", { aliases: ['ui'], directMessage: false })
  async userinfo(
    @SimpleCommandOption("user", { type: SimpleCommandOptionType.User })
    user: GuildMember | undefined,
    command: SimpleCommandMessage
  ) {

    if (!user) {
      user = command.message.member || undefined;
    }

    const embed = new MessageEmbed();
    embed.setColor(0x2f3136);
    embed.setTitle(`???????????????????? ?? ???????????????????????? ${user?.user.username}#${user?.user.discriminator}`);
    embed.setThumbnail(user?.avatarURL({ dynamic: true, format: "png" }) || user?.user.avatarURL({ dynamic: true, format: "png" }) || "");
    embed.setTimestamp(new Date());
    embed.setFooter({ text: command.message.member?.nickname || command.message.author.username, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
    embed.addFields([
      { name: 'ID', value: `${user?.id}`, inline: true },
      { name: '??????', value: `${user?.user.username}`, inline: true },
      { name: '?????? ???? ??????????????', value: `${user?.nickname || user?.user.username}`, inline: true },
      { name: '??????????????????????????', value: `${user?.user.discriminator}`, inline: true },
      { name: '?????????????????????????? ?? ??????????????', value: `${strftime(user?.joinedAt || new Date(), { format: "%d.%m.%Y %H:%M:%S" })}`, inline: true },
      { name: '?????????????????????????? ?? Discord', value: `${strftime(user?.user.createdAt || new Date(), { format: "%d.%m.%Y %H:%M:%S" })}`, inline: true },
      { name: `???????? (${(user?.roles?.cache.map((r) => r).length || 0) - 1})`, value: `${user?.roles?.cache.filter((r) => r.id != command.message.guild?.id).map((r) => '<@&' + r.id + '>').join(' ')}`, inline: true }
    ])

    await command.message.channel.send({ embeds: [embed] });

  }

}
