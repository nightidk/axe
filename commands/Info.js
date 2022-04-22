import { __decorate, __metadata } from "tslib";
import { MessageEmbed } from "discord.js";
import { SimpleCommandMessage } from "discordx";
import { Discord, SimpleCommand, } from "discordx";
import * as os from "os";
import { readFileSync } from "fs";
const configRead = readFileSync("./config.json", 'utf8');
const config = JSON.parse(configRead);
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
let InfoCommands = class InfoCommands {
    async info(command) {
        const owner = await command.message.guild?.members.fetch("252378040024301570");
        const memory = process.memoryUsage();
        const usage = (memory.heapTotal / os.totalmem()) * 100;
        var e = new MessageEmbed();
        e.setColor(0x2f3136);
        e.setAuthor({ "name": "Информация" });
        e.setTimestamp(new Date());
        e.setFooter({ "text": command.message.author.username, "iconURL": `${command.message.author.avatarURL()}` });
        e.addFields({ "name": "```Языки```", "value": "```TypeScript, JavaScript```", "inline": false }, { "name": "```Автор```", "value": `\`\`\`${owner?.user.username}#${owner?.user.discriminator}\`\`\``, "inline": true }, { "name": "```Префикс```", "value": `\`\`\`${config.PREFIX}\`\`\``, "inline": true }, { "name": "```Загрузка памяти```", "value": `\`\`\`${Math.round(memory.rss / 1024 / 1024 * 100) / 100}Mb/${Math.round(os.totalmem() / 1024 / 1024 * 100) / 100}Mb\nПроцент: ${usage.toFixed(2)}%\`\`\``, "inline": true }, { "name": "```Система```", "value": `\`\`\`${os.platform()}\`\`\``, "inline": true }, { "name": "```Пинг```", "value": `\`\`\`${parseInt((Date.now() / 1000).toFixed(0)) - parseInt((command.message.createdTimestamp / 1000).toFixed(0))}\`\`\``, "inline": true }, { "name": "```Время работы```", "value": `\`\`\`${seconds_to_hh_mm_ss(parseInt(process.uptime().toFixed(0)))}\`\`\``, "inline": true });
        command.message.channel.send({ "embeds": [e] });
    }
};
__decorate([
    SimpleCommand("info"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SimpleCommandMessage]),
    __metadata("design:returntype", Promise)
], InfoCommands.prototype, "info", null);
InfoCommands = __decorate([
    Discord()
], InfoCommands);
export { InfoCommands };
