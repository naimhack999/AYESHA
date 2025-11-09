const a = require("axios");
const b = require("fs");
const c = require("path");
const d = require("yt-search");

module.exports = {
  config: {
    name: "sing",
    aliases: ["sing", "music"],
    version: "0.0.2",
    author: "ArYAN + Modified by Alamin",
    countDown: 5,
    role: 0,
    shortDescription: "Search and download music from YouTube",
    longDescription: "Search and download music from YouTube and play it in chat 🎧",
    category: "MUSIC",
    guide: "/music <song name or YouTube URL>"
  },

  onStart: async function ({ api: e, event: f, args: g }) {
    if (!g.length)
      return e.sendMessage("❌ Provide a song name or YouTube URL.", f.threadID, f.messageID);

    const h = g.join(" ");
    e.setMessageReaction("⏳", f.messageID, () => {}, true);

    let searchingMsg;
    try {
      // ⏳ Step 1: Send searching message
      searchingMsg = await e.sendMessage(`⌛ Searching the song "${h}"...`, f.threadID);

      let j;
      if (h.startsWith("http")) {
        j = h;
      } else {
        const k = await d(h);
        if (!k || !k.videos.length) throw new Error("No results found.");
        j = k.videos[0].url;
      }

      // 🎧 Step 2: Fetch audio using API
      const l = `http://65.109.80.126:20409/aryan/youtube?url=${encodeURIComponent(j)}&type=audio`;
      const m = await a.get(l);
      const n = m.data;

      if (!n.status || !n.mp3) throw new Error("API failed to return download URL (mp3).");

      const fileName = `${n.title}.mp3`.replace(/[\\/:"*?<>|]/g, "");
      const filePath = c.join(__dirname, fileName);

      // ⬇ Step 3: Download the MP3 file
      const q = await a.get(n.mp3, {
        responseType: "arraybuffer",
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      b.writeFileSync(filePath, q.data);

      // ✅ Step 4: Remove searching message
      if (searchingMsg?.messageID) e.unsendMessage(searchingMsg.messageID);

      const messageBody = `🪶 Now playing "${n.title}" 🎵`;

      // ✅ Step 5: Send song in chat
      e.setMessageReaction("✅", f.messageID, () => {}, true);

      await e.sendMessage(
        { attachment: b.createReadStream(filePath), body: messageBody },
        f.threadID,
        () => {
          b.unlinkSync(filePath);
        },
        f.messageID
      );

    } catch (r) {
      console.error(r);
      if (searchingMsg?.messageID) e.unsendMessage(searchingMsg.messageID);
      e.setMessageReaction("❌", f.messageID, () => {}, true);
      e.sendMessage(`❌ Failed to download song: ${r.message}`, f.threadID, f.messageID);
    }
  }
};
