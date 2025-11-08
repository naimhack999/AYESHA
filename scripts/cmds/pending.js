const axios = require("axios");
const fs = require("fs");

module.exports = {
  config: {
    name: "pending",
    aliases: ["pen", "pend", "pe"],
    version: "2.0.1",
    author: "♡ Nazrul ♡ + Fixed by Alamin",
    countDown: 5,
    role: 1,
    shortDescription: "Handle pending requests",
    longDescription: "Approve or reject pending user or group requests",
    category: "utility",
    guide: {
      en: "{pn} [user/thread/all]\nReply with group number to approve\nType 'c' to cancel"
    }
  },

  onReply: async function ({ api, event, Reply }) {
    const { author, pending, messageID } = Reply;
    if (String(event.senderID) !== String(author)) return;

    const { body, threadID } = event;

    if (body.trim().toLowerCase() === "c") {
      try {
        await api.unsendMessage(messageID);
        return api.sendMessage("❌ Operation has been canceled!", threadID);
      } catch {
        return;
      }
    }

    const indexes = body.split(/\s+/).map(Number);
    if (isNaN(indexes[0])) {
      return api.sendMessage("⚠ Invalid input! Please try again.", threadID);
    }

    let count = 0;
    for (const idx of indexes) {
      if (idx <= 0 || idx > pending.length) continue;
      const group = pending[idx - 1];

      try {
        const threadInfo = await api.getThreadInfo(group.threadID);
        const groupName = threadInfo.threadName || "Unknown";
        const targetThread = group.threadID;
        const memberCount = threadInfo.participantIDs?.length || 0;
        const time = new Date(threadInfo.timestamp || Date.now()).toLocaleString();

        await api.sendMessage(
          `╔═≛⃝𝙰𝚈𝙴𝙰𝙷𝙰 𝚀𝚄𝙴𝙴𝙽👑═╗
┃
┃ 🏷️ 𝙽𝚊𝚖𝚎: ${groupName}
┃ 🆔 𝙶𝚛𝚘𝚞𝚙 𝙸𝙳: ${targetThread}
┃ 👥 𝙼𝚎𝚖𝚋𝚎𝚛𝚜: ${memberCount}
┃ 🔒 𝙰𝚙𝚙𝚛𝚘𝚟𝚊𝚕 𝙼𝚘𝚍𝚎: ${threadInfo.approvalMode ? "On" : "Off"}
┃ 😊 𝙴𝚖𝚘𝚓𝚒: ${threadInfo.emoji || "None"}
┃ ⏰ 𝙹𝚘𝚒𝚗𝚎𝚍: ${time}
┃
╠══〘 𝙾𝚆𝙽𝙴𝚁 𝙸𝙽𝙵𝙾 〙══╣
┃ 🧑‍💻 𝙽𝚊𝚖𝚎: 『ＡＹＥＳＨＡ』
┃ 🌐 𝙵𝙰𝙲𝙴𝙱𝙾𝙾𝙺: m.me/ayesha.queen.911
┃ 🗺️ 𝙲𝚘𝚞𝚗𝚝𝚛𝚢: Bangladesh
┃ ✅ 𝚂𝚝𝚊𝚝𝚞𝚜: Active
┃ 📞 𝚆𝚑𝚊𝚝𝚜𝙰𝚙𝚙: N/A
┃ ✉️ 𝙴𝚖𝚊𝚒𝚕: ayesharani.4.2.0.9@gmail.com
┃ 🧵 𝚃𝚎𝚕𝚎𝚐𝚛𝚊𝚖: N/A
╚═════════════════╝`,
          group.threadID
        );

        await api.changeNickname(
          `${global.GoatBot.config.nickNameBot || "≛⃝𝙰𝚈𝙴𝙰𝙷𝙰 𝚀𝚄𝙴𝙴𝙽👑"}`,
          group.threadID,
          api.getCurrentUserID()
        );
        count++;
      } catch (err) {
        console.error("❌ Failed to approve:", err.message);
      }
    }

    for (const idx of indexes.sort((a, b) => b - a)) {
      if (idx > 0 && idx <= pending.length) pending.splice(idx - 1, 1);
    }

    return api.sendMessage(`✅ | [ Successfully ] 🎉 Approved ${count} Groups ✨!`, threadID);
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID } = event;
    const adminBot = global.GoatBot.config.adminBot;

    if (!adminBot.includes(senderID)) {
      return api.sendMessage("⚠ You have no permission to use this command!", threadID);
    }

    const type = args[0]?.toLowerCase();
    if (!type) {
      return api.sendMessage("Usage: pending [user/thread/all]", threadID);
    }

    try {
      const spam = (await api.getThreadList(100, null, ["OTHER"])) || [];
      const pending = (await api.getThreadList(100, null, ["PENDING"])) || [];
      const list = [...spam, ...pending];
      let filteredList = [];

      if (type.startsWith("u")) filteredList = list.filter((t) => !t.isGroup);
      else if (type.startsWith("t")) filteredList = list.filter((t) => t.isGroup);
      else if (type === "all") filteredList = list;

      if (filteredList.length === 0)
        return api.sendMessage("⚠ No pending requests found!", threadID);

      let msg = "";
      let index = 1;

      for (const single of filteredList) {
        const name =
          single.name || (await usersData.getName(single.threadID)) || "Unknown";
        msg += `[ ${index} ] ${name}\n`;
        index++;
      }

      msg += `\n🦋 Reply with the correct group number to approve!\n✨ Reply with "c" to Cancel.\n`;

      return api.sendMessage(
        `✨ | [ Pending ${type.charAt(0).toUpperCase() + type.slice(1)} List ] ✨\n\n${msg}`,
        threadID,
        (error, info) => {
          if (error) return console.error(error);
          global.GoatBot.onReply.set(info.messageID, {
            commandName: module.exports.config.name,
            messageID: info.messageID,
            author: senderID,
            pending: filteredList
          });
        },
        messageID
      );
    } catch (error) {
      console.error("❌ Pending fetch error:", error);
      return api.sendMessage(
        `⚠ Failed to retrieve pending list. Please try again later.`,
        threadID
      );
    }
  }
};
