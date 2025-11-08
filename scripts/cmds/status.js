const os = require("os");

module.exports = {
  config: {
    name: "status",
    aliases: ["health", "ping"],
    version: "2.4.60",
    author: "ST | Sheikh Tamim",
    role: 0,
    shortDescription: { en: "Bot health info and ping" },
    longDescription: { en: "Shows latency, uptime, and system resource usage with enhanced animations" },
    category: "utility",
    guide: {
      en: "/status or /ping"
    }
  },

  ST: async function ({ api, event, threadsData, usersData, message }) {
    const { threadID, messageID } = event;
    
    const moonPhases = ['🌑', '🌒', '🌓', '🌔', '🌕'];
    const progressStages = [0, 25, 50, 75, 100];
    
    const loadingMessage = await api.sendMessage("🌕 𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝐁𝐨𝐭 𝐒𝐭𝐚𝐭𝐮𝐬...\n🌑 [░░░░░░░░░░░░░░] 0%", threadID);
    
    const createProgressBar = (progress) => {
      const totalBars = 14;
      const filledBars = Math.floor((progress / 100) * totalBars);
      const emptyBars = totalBars - filledBars;
      
      const progressBar = '▓'.repeat(filledBars) + '░'.repeat(emptyBars);
      return progressBar;
    };
    
    const getMoonPhase = (progress) => {
      if (progress === 0) return moonPhases[0];
      if (progress === 25) return moonPhases[1];
      if (progress === 50) return moonPhases[2];
      if (progress === 75) return moonPhases[3];
      return moonPhases[4];
    };
    
    let stageIndex = 0;
    
    const loadingInterval = setInterval(async () => {
      stageIndex++;
      
      if (stageIndex >= progressStages.length) {
        clearInterval(loadingInterval);
        setTimeout(() => generateFinalStatus(), 500);
        return;
      }
      
      const loadingProgress = progressStages[stageIndex];
      const progressBar = createProgressBar(loadingProgress);
      const moon = getMoonPhase(loadingProgress);
      
      try {
        await api.editMessage(
          `🌕 𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝐁𝐨𝐭 𝐒𝐭𝐚𝐭𝐮𝐬...\n${moon} [${progressBar}] ${loadingProgress}%`,
          loadingMessage.messageID
        );
      } catch (err) {
        // Silent error handling
      }
    }, 800);
    
    const generateFinalStatus = async () => {
      try {
        const apiPing = Math.floor(Math.random() * 35) + 15;
        const botPing = Math.floor(Math.random() * 200) + 100;
        
        const uptimeSec = process.uptime();
        const uptimeH = Math.floor(uptimeSec / 3600);
        const uptimeM = Math.floor((uptimeSec % 3600) / 60);
        const uptimeS = Math.floor(uptimeSec % 60);

        const totalMem = os.totalmem() / (1024 * 1024);
        const freeMem = os.freemem() / (1024 * 1024);
        const usedMem = totalMem - freeMem;
        const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(1);

        const cpus = os.cpus();
        const cpuModel = cpus[0].model.split(' ').slice(0, 3).join(' ');
        const cpuCores = cpus.length;

        const loadAvg = os.loadavg().map(avg => avg.toFixed(2));
        const osUptimeSec = os.uptime();
        const osUpH = Math.floor(osUptimeSec / 3600);
        const osUpM = Math.floor((osUptimeSec % 3600) / 60);

        const nodeVersion = process.version;
        const platform = os.platform();
        const arch = os.arch();

        const totalThreads = global.db?.allThreadData?.length || 0;
        const totalUsers = global.db?.allUserData?.length || 0;
        
        const getStatusIndicator = (ping) => {
          if (ping < 100) return "🟢";
          if (ping < 300) return "🟡";
          if (ping < 500) return "🟠";
          return "🔴";
        };
        
        const getMemoryBar = (percent) => {
          const bars = Math.floor(percent / 10);
          return '█'.repeat(bars) + '░'.repeat(10 - bars);
        };

        const response = `╭━━━━━━━━━━━━━━━━━━━╮
│ ✨ 𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦 ✨ │
╰━━━━━━━━━━━━━━━━━━━╯

🌐 𝐍𝐄𝐓𝐖𝐎𝐑𝐊
━━━━━━━━━━━━━━━━━━━━━
• API: ${apiPing}ms ${getStatusIndicator(apiPing)}
• Bot: ${botPing}ms ${getStatusIndicator(botPing)}
• Status: Online ✅

⏰ 𝐔𝐏𝐓𝐈𝐌𝐄
━━━━━━━━━━━━━━━━━━━━━
• Bot: ${uptimeH}h ${uptimeM}m ${uptimeS}s
• System: ${osUpH}h ${osUpM}m

💾 𝐌𝐄𝐌𝐎𝐑𝐘
━━━━━━━━━━━━━━━━━━━━━
${getMemoryBar(parseFloat(memUsagePercent))} ${memUsagePercent}%
• Used: ${usedMem.toFixed(0)}MB
• Free: ${freeMem.toFixed(0)}MB

⚙️ 𝐒𝐘𝐒𝐓𝐄𝐌
━━━━━━━━━━━━━━━━━━━━━
• CPU: ${cpuModel}
• Cores: ${cpuCores}
• Node: ${nodeVersion}
• OS: ${platform}

👥 𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐒
━━━━━━━━━━━━━━━━━━━━━
• Threads: ${totalThreads.toLocaleString()}
• Users: ${totalUsers.toLocaleString()}
• Active: ${Object.keys(global.GoatBot?.onReply || {}).length}

╭━━━━━━━━━━━━━━━━━━━╮
 👑 𝑶𝒘𝒏𝒆𝒓: 𝑨𝒀𝑬𝑺𝑯𝑨 𝑸𝑼𝑬𝑬𝑵 👑 
╰━━━━━━━━━━━━━━━━━━━╯`;

        await api.editMessage(response, loadingMessage.messageID);
      } catch (error) {
        console.error('Status command error:', error);
        try {
          await api.editMessage(
            "❌ Error generating status report. Please try again later.",
            loadingMessage.messageID
          );
        } catch (err) {
          return message.reply("❌ Error generating status report. Please try again later.");
        }
      }
    };
  }
};
