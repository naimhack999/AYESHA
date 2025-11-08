module.exports = {
  config: {
    name: "mention",
    aliases: ["tagall", "tag"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 1,
    description: "Mention all members one by one or all at once",
    category: "group",
    guide: {
      en: "{pn} - Tag members one by one"
        + "\n{pn} all - Tag all members at once"
        + "\n{pn} <message> - Tag one by one with custom message"
        + "\n{pn} all <message> - Tag all at once with custom message"
    }
  },

  onStart: async function({ api, event, args, message, usersData }) {
    const { participantIDs, threadID } = event;
    
    const isAll = args[0]?.toLowerCase() === "all";
    const customMsg = isAll ? args.slice(1).join(" ") : args.join(" ");
    const defaultMsg = "All member active hon pls";
    const finalMsg = customMsg || defaultMsg;

    const threadInfo = await api.getThreadInfo(threadID);
    const userNicknames = {};
    
    threadInfo.userInfo.forEach(user => {
      userNicknames[user.id] = user.name;
    });

    if (isAll) {
      let mentions = [];
      let body = "┏━━━━━━━━━━━━━┓\n";
      
      let count = 1;
      for (let id of participantIDs) {
        if (id !== event.senderID && id !== api.getCurrentUserID()) {
          const nickname = userNicknames[id] || await usersData.getName(id);
          body += `┃ ${count}. @${nickname}\n`;
          mentions.push({ tag: `@${nickname}`, id });
          count++;
        }
      }
      
      body += "┗━━━━━━━━━━━━━┛\n\n";
      body += "╭─━━━━━━━━━━━━━━━━━━─╮\n";
      body += ` 🔔 ${finalMsg} 🔔\n`;
      body += "╰─━━━━━━━━━━━━━━━━━━─╯\n\n";
      body += `✨ Total Members: ${count - 1} ✨`;

      return message.reply({ body, mentions });
    } else {
      let count = 1;
      for (let id of participantIDs) {
        if (id !== event.senderID && id !== api.getCurrentUserID()) {
          const nickname = userNicknames[id] || await usersData.getName(id);
          const styledMsg = `‎┏━━━━━━━━━━━━━┓\n`
            + `┃ 👤 @${nickname}\n`
            + `┗━━━━━━━━━━━━━┛\n\n`
            + `╭─━━━━━━━━━━━━━━━━━━─╮\n`
            + ` 🔔 ${finalMsg} 🔔\n`
            + `╰─━━━━━━━━━━━━━━━━━━─╯\n\n`
            + `✨ Member #${count} ✨`;
          
          await message.reply({
            body: styledMsg,
            mentions: [{ tag: `@${nickname}`, id }]
          });
          await new Promise(resolve => setTimeout(resolve, 1500));
          count++;
        }
      }
    }
  }
};
