import { GuildMember, MessageEmbed } from "discord.js";
import { Discord, SimpleCommand, SimpleCommandMessage, SimpleCommandOption, SimpleCommandOptionType } from "discordx";
import { readFileSync } from "fs";
import { MongoClient } from "mongodb";

const configRead = readFileSync("./config.json", 'utf8');
const config = JSON.parse(configRead);
const mongoClient = new MongoClient(config.DB);

function divmod(value: number, del: number) {
    
    var quotient = Math.floor(value/del);
    var remainder = value % del;

    
    return [quotient, remainder];
}
  
function fixZeroNumber(value: number | string) {
    return `${value}`.length == 1 ? "0" + value : "" + value; 
}
  
function seconds_to_hh_mm_ss(seconds: number | null) {
      /* Convert seconds to d hh:mm:ss */
      if (seconds === null) {
        return "Не найдено.";
      }
      var time_m_s = divmod(seconds, 60)
      var time_h_m = divmod(time_m_s[0] || 0, 60)
      var time_d_h = divmod(time_h_m[0] || 0, 24)
  
      const d = time_d_h[0]?.toFixed(0) || 0;
      const h = time_d_h[1]?.toFixed(0) || 0;
      const m = time_h_m[1]?.toFixed(0) || 0;
      const s = time_m_s[1]?.toFixed(0) || 0;
  
      if (seconds >= 86400) {
          return `${d}дн. ${fixZeroNumber(h)}:${fixZeroNumber(m)}:${fixZeroNumber(s)}`;
      } else {
          return `${fixZeroNumber(h)}:${fixZeroNumber(m)}:${fixZeroNumber(s)}`;
      }
}

function declension(forms: string[], val: number) {
    const cases = [ 2, 0, 1, 1, 1, 2 ];
    if (val % 100 > 4 && val % 100 < 20) {
        return forms[2];
    } else {
        if (val % 10 < 5) {
            return forms[cases[val % 10] || 0];
        } else {
            return forms[cases[5] || 2];
        }
    }
}

function get_time(seconds: number | null) {
    /* Convert seconds to d hh:mm:ss */
    if (seconds === null) {
      return "Не найдено.";
    }
    var time_m_s = divmod(seconds, 60)
    var time_h_m = divmod((time_m_s[0] || 0), 60)
    var time_d_h = divmod((time_h_m[0] || 0), 24)

    const d = time_d_h[0] || 0;
    const h = time_d_h[1] || 0;
    const m = time_h_m[1] || 0;
    const s = time_m_s[1] || 0;

    const ndays = [ 'день', 'дня', 'дней' ];
    const nhours = [ 'час', 'часа', 'часов' ];
    const nminutes = [ 'минуту', 'минуты', 'минут' ];
    const nseconds = [ 'секунду', 'секунды', 'секунд' ];

    if (d != 0) {
        return `${d} ${declension(ndays, d)} ${h != 0 ? `${h} ${declension(nhours, h)}` : ''} ${m != 0 ? `${m} ${declension(nminutes, m)}` : ''} ${s != 0 ? `${s} ${declension(nseconds, s)}` : ''}`;
    } else if (h != 0) {
        return `${h} ${declension(nhours, h)} ${m != 0 ? `${m} ${declension(nminutes, m)}` : ''} ${s != 0 ? `${s} ${declension(nseconds, s)}` : ''}`;
    } else if (m != 0) {
        return `${m} ${declension(nminutes, m)} ${s != 0 ? `${s} ${declension(nseconds, s)}` : ''}`;
    } else {
        return `${s} ${declension(nseconds, s)}`;
    }
}

@Discord()
export class Moderation {
    @SimpleCommand("addtimemute", { directMessage: true, aliases: ['atm'], argSplitter: ' ' })
    async addtimemute(
        @SimpleCommandOption('member', { type: SimpleCommandOptionType.User })
        member: GuildMember | undefined,
        @SimpleCommandOption('time_input', { type: SimpleCommandOptionType.String })
        time_input: string | '',
        command: SimpleCommandMessage
    ) {
        // if..
        if (!member) {
            const e = new MessageEmbed();
            e.setColor(0x2f3136);
            e.setTimestamp(new Date());
            e.setFooter({ text: `${command.message.member?.nickname || command.message.author.username}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
            e.setDescription("Правильное использование команды:\n**```py\n-atm @member {время}\n```**");
            return await command.message.channel.send({ embeds: [e] });
        }

        if (member.id == command.message.author.id) {
            const e = new MessageEmbed();
            e.setColor(0x2f3136);
            e.setTimestamp(new Date());
            e.setFooter({ text: `${command.message.member?.nickname || command.message.author.username}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
            e.setDescription("Ты не можешь замьютить себя.");
            return await command.message.channel.send({ embeds: [e] });
        }

        if (command.message.guild?.ownerId == member.id) {
            const e = new MessageEmbed();
            e.setColor(0x2f3136);
            e.setTimestamp(new Date());
            e.setFooter({ text: `${command.message.member?.nickname || command.message.author.username}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
            e.setDescription("Ты не можешь замьютить овнера сервера.");
            return await command.message.channel.send({ embeds: [e] });
        }
        if ((command.message.member?.roles.highest.position || 0) <= member.roles.highest.position && command.message.guild?.ownerId != command.message.author.id) {
            const e = new MessageEmbed();
            e.setColor(0x2f3136);
            e.setTimestamp(new Date());
            e.setFooter({ text: `${command.message.member?.nickname || command.message.author.username}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
            e.setDescription("Данный пользователь находится на одной роли с тобой или выше.");
            return await command.message.channel.send({ embeds: [e] });
        }

        try {
            await mongoClient.connect();
            const db = mongoClient.db("axe");
            const mutes = db.collection("mutes");

            /*if (await mutes.count({ id: member.id }) == 0) {
                const e = new MessageEmbed();
                e.setColor(0x2f3136);
                e.setTimestamp(new Date());
                e.setFooter({ text: `${command.message.member?.nickname || command.message.author.username}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
                e.setDescription("Пользователь не имеет мута.");
                return await command.message.channel.send({ embeds: [e] });
            }

            const mute = mutes.findOne({ id: member.id });*/

            const convert_time = JSON.parse(`{
                "s": 1,
                "с": 1,
                "m": 60,
                "м": 60,
                "h": 3600,
                "ч": 3600,
                "d": 86400,
                "д": 86400
            }`);

            let timemute = 0;

            const regMute = new RegExp('[0-9]+[DdДдHhЧчMmМмSsСс]', 'g')
            const regNumber = new RegExp('[0-9]+', 'g')
            let foundtime = [...time_input.matchAll(regMute)];    
            for (let match of foundtime) {
                const matchValue = match[0];
                const textValue = (((matchValue || 's')[(matchValue?.length || 1) - 1 ]) || 's').toLowerCase();
                timemute += parseInt((matchValue?.match(regNumber) || ['1'])[0] || '1') * convert_time[textValue];
            }

            if (timemute <= 0) {
                const e = new MessageEmbed();
                e.setColor(0x2f3136);
                e.setTimestamp(new Date());
                e.setFooter({ text: `${command.message.member?.nickname || command.message.author.username}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
                e.setDescription("Укажите время мута.");
                return await command.message.channel.send({ embeds: [e] });
            }
            const e = new MessageEmbed();
            e.setColor(0x2f3136);
            e.setTimestamp(new Date());
            e.setFooter({ text: `${command.message.member?.nickname || command.message.author.username}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
            e.setDescription(`У пользователя ${member} продлён **мут** на **${get_time(timemute)}**`);
            await command.message.channel.send({ embeds: [e] });
        } catch (e) {} finally {
            await mongoClient.close();
        }
    }
}
