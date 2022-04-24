import { __decorate, __metadata, __param } from "tslib";
import { MessageEmbed, MessageActionRow, MessageButton } from "discord.js";
import { SimpleCommandMessage } from "discordx";
import { Discord, SimpleCommand, SimpleCommandOption, SimpleCommandOptionType, } from "discordx";
import { readFileSync } from "fs";
import { MongoClient } from "mongodb";
const configRead = readFileSync("./config.json", 'utf8');
const config = JSON.parse(configRead);
const mongoClient = new MongoClient(config.DB);
function divmod(value, del) {
    var last_value = value;
    var new_value = 0;
    while (last_value >= del) {
        last_value /= del;
        new_value += 1;
    }
    return [new_value, last_value];
}
function fixZeroNumber(value) {
    return `${value}`.length == 1 ? "0" + value : "" + value;
}
function seconds_to_hh_mm_ss(seconds) {
    /* Convert seconds to d hh:mm:ss */
    if (seconds === null) {
        return "Не найдено.";
    }
    var time_m_s = divmod(seconds, 60);
    var time_h_m = divmod(time_m_s[0] || 0, 60);
    var time_d_h = divmod(time_h_m[0] || 0, 24);
    const d = time_d_h[0]?.toFixed(0) || 0;
    const h = time_d_h[1]?.toFixed(0) || 0;
    const m = time_h_m[1]?.toFixed(0) || 0;
    const s = time_m_s[1]?.toFixed(0) || 0;
    if (seconds >= 86400) {
        return `${d}дн. ${fixZeroNumber(h)}:${fixZeroNumber(m)}:${fixZeroNumber(s)}`;
    }
    else {
        return `${fixZeroNumber(h)}:${fixZeroNumber(m)}:${fixZeroNumber(s)}`;
    }
}
;
function strftime(time, options) {
    const milliseconds = time.getMilliseconds();
    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();
    const day = time.getDate();
    const month = time.getMonth();
    const year = time.getFullYear();
    const monthsnames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    if (options?.format) {
        var formatString = options.format;
        formatString = formatString.replaceAll("%ms", `${milliseconds}`);
        formatString = formatString.replaceAll("%S", `${fixZeroNumber(seconds)}`);
        formatString = formatString.replaceAll("%M", `${fixZeroNumber(minutes)}`);
        formatString = formatString.replaceAll("%H", `${fixZeroNumber(hours)}`);
        formatString = formatString.replaceAll("%d", `${fixZeroNumber(day)}`);
        formatString = formatString.replaceAll("%m", `${fixZeroNumber(month)}`);
        formatString = formatString.replaceAll("%mn", `${monthsnames[month - 1]}`);
        formatString = formatString.replaceAll("%Y", `${year}`);
        formatString = formatString.replaceAll("%y", `${year.toString().substring(3, 4)}`);
        return formatString;
    }
    else {
        return `${hours}:${minutes}:${seconds} ${monthsnames[month - 1]} ${day}, ${year}`;
    }
}
let Love = class Love {
    async minfo(command) {
        // if..
        try {
            await mongoClient.connect();
            const db = mongoClient.db("axe");
            const users = db.collection("users");
            //const rooms = db.collection("love_rooms");
            const user = await users.findOne({ id: command.message.author.id });
            if (user?.partner == "") {
                const e = new MessageEmbed();
                e.setColor(0x2f3136);
                e.setDescription("Ты не состоишь в браке.");
                e.setTimestamp(new Date());
                e.setFooter({ text: `${command.message.member?.nickname || command.message.author.username}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
                return command.message.channel.send({ embeds: [e] });
            }
            else {
                const e = new MessageEmbed();
                e.setColor(0x2f3136);
                e.setTitle("Брак: информация");
                const partnerFetch = await command.message.guild?.members.fetch(user?.partner);
                var partner;
                if (partnerFetch == undefined)
                    partner = "«Не найдено»";
                else
                    partner = `${partnerFetch.user.username}#${partnerFetch.user.discriminator}`;
                const marry_time = new Date().getTime() - user?.marry_time;
                e.addFields([
                    { name: "```Партнёр```", value: `\`\`\`diff\n- ${partner}\n\`\`\``, inline: true },
                    { name: "```Дата свадьбы```", value: `\`\`\`fix\n${strftime(new Date(user?.marry_time + 10800))}\n\`\`\``, inline: true },
                    { name: "```Длительность```", value: `\`\`\`glsl\n${seconds_to_hh_mm_ss(marry_time)}\n\`\`\``, inline: true }
                ]);
                //if (user?.love_room == "") {
                //    const room = await rooms.findOne({ id: user?.love_room });
                //    var love_room = command.message.guild?.channels.fetch(room?.id);
                //    e.addFields([
                //        { name: "```Любовная комната```", value: `\`\`\`glsl\n${love_room}\n\`\`\``, inline: true },
                //        { name: "", value: ``, inline: true }
                //    ])
                //}
                e.setTimestamp(new Date());
                e.setFooter({ text: `${command.message.member?.nickname || command.message.author.username}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
                return command.message.channel.send({ embeds: [e] });
            }
        }
        catch (e) {
            console.log(e);
        }
        finally {
            await mongoClient.close();
        }
    }
    async marry(muser, command) {
        // if..
        try {
            await mongoClient.connect();
            const db = mongoClient.db("axe");
            const users = db.collection("users");
            const user = await users.findOne({ id: command.message.author.id });
            if (user?.partner != "") {
                const e = new MessageEmbed();
                e.setColor(0x2f3136);
                e.setTimestamp(new Date());
                e.setFooter({ text: `${command.message.member?.nickname || command.message.author.username}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
                e.setDescription("В данный момент ты уже состоишь в браке.");
                command.message.channel.send({ embeds: [e] });
            }
            else {
                if (!muser) {
                    const e = new MessageEmbed();
                    e.setColor(0x2f3136);
                    e.setTimestamp(new Date());
                    e.setFooter({ text: `${command.message.member?.nickname || command.message.author.username}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
                    e.setDescription("Укажи пользователя, которому хочешь отправить запрос на брак.");
                    command.message.channel.send({ embeds: [e] });
                }
                else if (muser.id == command.message.author.id) {
                    const e = new MessageEmbed();
                    e.setColor(0x2f3136);
                    e.setTimestamp(new Date());
                    e.setFooter({ text: `${command.message.member?.nickname || command.message.author.username}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
                    e.setDescription("Попробуй указать не себя ;3");
                    command.message.channel.send({ embeds: [e] });
                }
                else if (muser.user.bot) {
                    const e = new MessageEmbed();
                    e.setColor(0x2f3136);
                    e.setTimestamp(new Date());
                    e.setFooter({ text: `${command.message.member?.nickname || command.message.author.username}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
                    e.setDescription("Боты не дадут тебе любви.. Так что, прошу, попробуй с человеком!");
                    command.message.channel.send({ embeds: [e] });
                }
                else {
                    const muserdb = await users.findOne({ id: muser.id });
                    if (muserdb?.partner) {
                        const e = new MessageEmbed();
                        e.setColor(0x2f3136);
                        e.setTimestamp(new Date());
                        e.setFooter({ text: `${command.message.member?.nickname || command.message.author.username}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
                        e.setDescription("Данный пользователь уже состоит в браке.");
                        command.message.channel.send({ embeds: [e] });
                    }
                    else {
                        if (user?.level < 10 || muserdb?.level < 10) {
                            const e = new MessageEmbed();
                            e.setColor(0x2f3136);
                            e.setTimestamp(new Date());
                            e.setFooter({ text: `${command.message.member?.nickname || command.message.author.username}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
                            e.setDescription("Недостаточный уровень.\nНеобходимо, что оба пользователя имели минимум 10 уровень.");
                            e.setTitle('Брак');
                        }
                        else {
                            const e = new MessageEmbed();
                            e.setColor(0x2f3136);
                            e.setTimestamp(new Date());
                            e.setFooter({ text: `${command.message.member?.nickname || command.message.author.username}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
                            e.setDescription(`${muser}, тебе ${command.message.member} предложил(а) стать парой. Что ответишь?`);
                            e.setTitle('Брак');
                            const row = new MessageActionRow();
                            row.addComponents([
                                new MessageButton()
                                    .setCustomId("marry-yes")
                                    .setEmoji("✅")
                                    .setStyle("SUCCESS"),
                                new MessageButton()
                                    .setCustomId("marry-no")
                                    .setEmoji("❌")
                                    .setStyle("DANGER")
                            ]);
                            let botMsg = await command.message.channel.send({ embeds: [e], components: [row] });
                            const collector = command.message.channel.createMessageComponentCollector({ filter: (i) => ((i.customId === "marry-yes") || (i.customId === "marry-no")) && i.user.id === muser.id && i.message.id == botMsg.id, time: 60000 });
                            collector.on("collect", async (i) => {
                                if (i.customId === 'marry-yes') {
                                    await i.deferUpdate({ fetchReply: true });
                                    const usercheck = await users.findOne({ id: command.message.author.id });
                                    const musercheck = await users.findOne({ id: muser.id });
                                    if (usercheck?.partner != "" || musercheck?.partner != "") {
                                        const e = new MessageEmbed();
                                        e.setColor(0x2f3136);
                                        e.setTimestamp(new Date());
                                        e.setFooter({ text: `${command.message.member?.nickname || command.message.author.username}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
                                        e.setDescription(`Произошла ошибка, кто-то из двух пользователей уже состоит в браке.`);
                                        e.setTitle("Брак");
                                        i.editReply({ embeds: [e], components: [] });
                                    }
                                    else {
                                        const photo = [
                                            "https://cdn.discordapp.com/attachments/677839189991096350/746411914224992377/1Fhe.gif",
                                            "https://cdn.discordapp.com/attachments/677839189991096350/746411918436335731/1fd892054b61087f06c3fd111e233124.gif",
                                            "https://cdn.discordapp.com/attachments/677839189991096350/746411917794344990/270deadfc183b447aa36c38d92e00e19.gif",
                                            "https://cdn.discordapp.com/attachments/677839189991096350/746411920508321832/NVDz.gif",
                                            "https://cdn.discordapp.com/attachments/677839189991096350/746411920470441994/1405163520_lovestage-episode1-omake-6.gif"
                                        ];
                                        const e = new MessageEmbed();
                                        e.setColor(0x2f3136);
                                        e.setTimestamp(new Date());
                                        e.setFooter({ text: `${command.message.member?.nickname || command.message.author.username}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
                                        e.setDescription(`$${command.message.member} и ${muser} стали парой! Поздравляю!`);
                                        i.editReply({ embeds: [e], components: [], });
                                        await users.updateOne({ id: command.message.author.id }, { $set: { partner: muser.id, marry_time: new Date().getTime() } });
                                        await users.updateOne({ id: muser.id }, { $set: { partner: command.message.author.id, marry_time: new Date().getTime() } });
                                        try {
                                            await command.message.member?.roles.add("928368525045825567");
                                            await muser.roles.add("928368525045825567");
                                        }
                                        catch (e) { }
                                    }
                                }
                                else {
                                    await i.deferUpdate({ fetchReply: true });
                                    const e = new MessageEmbed();
                                    e.setColor(0x2f3136);
                                    e.setTimestamp(new Date());
                                    e.setFooter({ text: `${command.message.member?.nickname || command.message.author.username}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
                                    e.setDescription(`${muser} отказался(ась).`);
                                    e.setTitle('Брак');
                                    i.editReply({ embeds: [e], components: [] });
                                }
                            });
                            collector.on("end", async (i) => {
                                try {
                                    const msg = await command.message.channel.messages.fetch(botMsg.id);
                                    if (msg.components?.length != 0) {
                                        const e = new MessageEmbed();
                                        e.setColor(0x2f3136);
                                        e.setTimestamp(new Date());
                                        e.setFooter({ text: `${command.message.member?.nickname || command.message.author.username}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
                                        e.setDescription(`${muser} проигнорировал(-а) данное предложение.`);
                                        e.setTitle('Брак');
                                        msg.edit({ embeds: [e], components: [] });
                                    }
                                }
                                catch (e) { }
                                ;
                            });
                        }
                    }
                }
            }
        }
        catch (e) {
        }
        finally {
            mongoClient.close();
        }
    }
    async divorce(command) {
        // if..
        try {
            await mongoClient.connect();
            const db = mongoClient.db("axe");
            const users = db.collection("users");
            const user = await users.findOne({ id: command.message.author.id });
            if (user?.partner == "") {
                const e = new MessageEmbed();
                e.setColor(0x2f3136);
                e.setTimestamp(new Date());
                e.setFooter({ text: `${command.message.member?.nickname || command.message.author.username}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
                e.setDescription("В данный момент ты не состоишь в браке.");
                command.message.channel.send({ embeds: [e] });
            }
            else {
                const muser = await command.message.guild?.members.fetch(user?.partner);
                const e = new MessageEmbed();
                e.setColor(0x2f3136);
                e.setTimestamp(new Date());
                e.setFooter({ text: `${command.message.member?.nickname || command.message.author.username}`, iconURL: command.message.member?.avatarURL({ dynamic: true }) || command.message.author.avatarURL({ dynamic: true }) || "" });
                e.setDescription(`${muser} и ${command.message.member} развелись.`);
                command.message.channel.send({ embeds: [e] });
                try {
                    await muser?.roles.remove("928368525045825567");
                }
                catch (e) { }
                try {
                    await command.message.member?.roles.remove("928368525045825567");
                }
                catch (e) { }
                await users.updateOne({ id: command.message.author.id }, { $set: { partner: "", marry_time: 0 } });
                await users.updateOne({ id: muser?.id }, { $set: { partner: "", marry_time: 0 } });
            }
        }
        catch (e) { }
        finally {
            mongoClient.close();
        }
    }
};
__decorate([
    SimpleCommand("minfo", { directMessage: false }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SimpleCommandMessage]),
    __metadata("design:returntype", Promise)
], Love.prototype, "minfo", null);
__decorate([
    SimpleCommand("marry", { directMessage: false }),
    __param(0, SimpleCommandOption("muser", { type: SimpleCommandOptionType.User })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, SimpleCommandMessage]),
    __metadata("design:returntype", Promise)
], Love.prototype, "marry", null);
__decorate([
    SimpleCommand("divorce", { directMessage: false }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SimpleCommandMessage]),
    __metadata("design:returntype", Promise)
], Love.prototype, "divorce", null);
Love = __decorate([
    Discord()
], Love);
export { Love };
