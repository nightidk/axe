import { __decorate, __metadata } from "tslib";
import { ButtonInteraction, MessageEmbed, } from "discord.js";
import { ButtonComponent, Discord } from "discordx";
import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { Pagination, PaginationType, } from "@discordx/pagination";
const configRead = readFileSync("./config.json", 'utf8');
const config = JSON.parse(configRead);
const DB_LOG = config.DB;
const mongoClient = new MongoClient(DB_LOG);
let Buttons = class Buttons {
    async profile_achievements(interaction) {
        await interaction.deferReply({ "ephemeral": true });
        const author = interaction.message.embeds[0]?.footer?.text.split("|")[1]?.replaceAll(" ", "");
        if (interaction.user.id != author) {
            const e = new MessageEmbed();
            e.setColor(0x2f3136);
            e.setFooter({ text: `${interaction.user.username}`, iconURL: interaction.user.avatarURL({ dynamic: true }) || "" });
            e.setTimestamp(new Date());
            e.setDescription("Данная реакция вам не пренадлежит.");
            return interaction.editReply({ embeds: [e] });
        }
        try {
            await mongoClient.connect();
            const db = mongoClient.db("axe");
            const users = db.collection("users");
            const user = await users.findOne({ id: interaction.user.id });
            const user_ach = user?.achievements;
            const member = await interaction.guild?.members.fetch(interaction.user.id);
            const achievements_text_1 = `<@&914401241369554945>:

1. **${user_ach.find(function (v) { return v == "voice.first_join"; }) !== undefined ? config.achievements['voice']['first_join']['name'] : '???'}**
2. **${user_ach.find(function (v) { return v == "voice.mod1h"; }) !== undefined ? config.achievements['voice']['mod1h']['name'] : '???'}**
3. **${user_ach.find(function (v) { return v == "voice.mute1h"; }) !== undefined ? config.achievements['voice']['mute1h']['name'] : '???'}**
4.**${user_ach.find(function (v) { return v == "voice.cpc"; }) !== undefined ? config.achievements['voice']['cpc']['name'] : '???'}**
5. **${user_ach.find(function (v) { return v == "voice.afk1d"; }) !== undefined ? config.achievements['voice']['afk1d']['name'] : '???'}**
6. **${user_ach.find(function (v) { return v == "voice.afk7d"; }) !== undefined ? config.achievements['voice']['afk7d']['name'] : '???'}**
7. **${user_ach.find(function (v) { return v == "voice.dj"; }) !== undefined ? config.achievements['voice']['dj']['name'] : '???'}**
8. **${user_ach.find(function (v) { return v == "chat.suggest"; }) !== undefined ? config.achievements['chat']['suggest']['name'] : '???'}**
9. **${user_ach.find(function (v) { return v == "chat.fullsymbolmsg"; }) !== undefined ? config.achievements['chat']['fullsymbolmsg']['name'] : '???'}**
10. **${user_ach.find(function (v) { return v == "chat.1k"; }) !== undefined ? config.achievements['chat']['1k']['name'] : '???'}**
`;
            const achievements_text_2 = `11. **${user_ach.find(function (v) { return v == "chat.5k"; }) !== undefined ? config.achievements['chat']['5k']['name'] : '???'}**
12. **${user_ach.find(function (v) { return v == "chat.20k"; }) !== undefined ? config.achievements['chat']['20k']['name'] : '???'}**
13. **${user_ach.find(function (v) { return v == "chat.allchatsmsg"; }) !== undefined ? config.achievements['chat']['allchatsmsg']['name'] : '???'}**
14.**${user_ach.find(function (v) { return v == "chat.basement"; }) !== undefined ? config.achievements['chat']['basement']['name'] : '???'}**
15. **${user_ach.find(function (v) { return v == "chat.review"; }) !== undefined ? config.achievements['chat']['review']['name'] : '???'}**
16. **${user_ach.find(function (v) { return v == "other.event_game"; }) !== undefined ? config.achievements['other']['event_game']['name'] : '???'}**
17. **${user_ach.find(function (v) { return v == "other.event_movie"; }) !== undefined ? config.achievements['other']['event_movie']['name'] : '???'}**
18. **${user_ach.find(function (v) { return v == "other.gender_role"; }) !== undefined ? config.achievements['other']['gender_role']['name'] : '???'}**
19. **${user_ach.find(function (v) { return v == "other.first_reaction_news"; }) !== undefined ? config.achievements['other']['first_reaction_news']['name'] : '???'}**

20. **${(member?.roles.cache.filter((r) => r.id == "914401241369554945"))?.keys.length == 1 ? 'Все достижения пройдены, получена роль <@&914401241369554945>' : '???'}**
`;
            const e1 = new MessageEmbed();
            e1.setColor(0x2f3136);
            e1.setFooter({ text: `${member?.nickname || member?.user.username} | ${member?.user.id}`, iconURL: member?.avatarURL({ dynamic: true }) || member?.user.avatarURL({ dynamic: true }) || "" });
            e1.setTimestamp(new Date());
            e1.setDescription(achievements_text_1);
            e1.setAuthor({ name: "Достижения (1/2)" });
            const e2 = new MessageEmbed();
            e2.setColor(0x2f3136);
            e2.setFooter({ text: `${member?.nickname || member?.user.username} | ${member?.user.id}`, iconURL: member?.avatarURL({ dynamic: true }) || member?.user.avatarURL({ dynamic: true }) || "" });
            e2.setTimestamp(new Date());
            e2.setDescription(achievements_text_2);
            e2.setAuthor({ name: "Достижения (2/2)" });
            const pages = [e1, e2];
            const pagination = new Pagination(interaction, pages, { type: PaginationType.Button, exit: { emoji: "794506211738648586", style: 4 /* DANGER */ }, next: { emoji: "826567984901390366", label: "", style: 2 /* SECONDARY */ }, previous: { emoji: "826568061854416946", label: "", style: 2 /* SECONDARY */ } });
            await pagination.send();
        }
        catch (e) {
            console.log(e);
        }
        finally {
            mongoClient.close();
        }
    }
};
__decorate([
    ButtonComponent("profile-achievements"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ButtonInteraction]),
    __metadata("design:returntype", Promise)
], Buttons.prototype, "profile_achievements", null);
Buttons = __decorate([
    Discord()
], Buttons);
export { Buttons };
