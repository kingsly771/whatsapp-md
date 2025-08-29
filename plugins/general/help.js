module.exports = {
  name: 'Help',
  description: 'Shows help information and command list',
  version: '2.0.0',
  code: `const pluginService = require('../../services/pluginService');
const config = require('../../config/config');

// Help data storage
const helpRequests = new Map();
const commandUsage = new Map();

async function help(message, client, sessionId, require, console, prefix) {
  const user = message.from;
  const currentTime = Date.now();
  
  // Rate limiting: 3 requests per minute per user
  if (!helpRequests.has(user)) {
    helpRequests.set(user, []);
  }
  
  const userRequests = helpRequests.get(user);
  const recentRequests = userRequests.filter(time => currentTime - time < 60000);
  
  if (recentRequests.length >= 3) {
    await client.sendMessage(user, 
      '⏰ Please wait a minute before requesting help again.\\n' +
      'You\\'ve made ' + recentRequests.length + ' help requests in the last minute.'
    );
    return;
  }
  
  userRequests.push(currentTime);
  helpRequests.set(user, userRequests);

  // Track command usage
  const command = message.body.trim();
  commandUsage.set(command, (commandUsage.get(command) || 0) + 1);

  if (message.body === prefix + 'help') {
    await showMainHelp(message, client, prefix);
  } 
  else if (message.body.startsWith(prefix + 'help ')) {
    const commandName = message.body.slice(prefix.length + 5).trim();
    await showCommandHelp(message, client, prefix, commandName);
  }
  else if (message.body === prefix + 'commands') {
    await showAllCommands(message, client, prefix);
  }
  else if (message.body === prefix + 'stats') {
    await showBotStats(message, client, prefix);
  }
  else if (message.body === prefix + 'tutorial') {
    await showTutorial(message, client, prefix);
  }
}

async function showMainHelp(message, client, prefix) {
  const enabledPlugins = pluginService.listPlugins().filter(p => p.enabled);
  const pluginsByCategory = {};
  
  enabledPlugins.forEach(plugin => {
    if (!pluginsByCategory[plugin.category]) {
      pluginsByCategory[plugin.category] = [];
    }
    pluginsByCategory[plugin.category].push(plugin);
  });

  let helpMessage = '🤖 *WhatsApp Bot Help* 🤖\\n\\n';
  helpMessage += '*Prefix:* ' + prefix + '\\n';
  helpMessage += '*Admin Prefix:* ' + config.bot.adminPrefix + '\\n\\n';
  
  helpMessage += '*📋 Available Categories:*\\n';
  for (const category in pluginsByCategory) {
    helpMessage += '• ' + category.charAt(0).toUpperCase() + category.slice(1) + ' (' + pluginsByCategory[category].length + ' commands)\\n';
  }
  
  helpMessage += '\\n*🔧 Basic Commands:*\\n';
  helpMessage += '• ' + prefix + 'help - Show this message\\n';
  helpMessage += '• ' + prefix + 'help <command> - Detailed help for a command\\n';
  helpMessage += '• ' + prefix + 'commands - List all available commands\\n';
  helpMessage += '• ' + prefix + 'stats - Show bot statistics\\n';
  helpMessage += '• ' + prefix + 'tutorial - Basic usage tutorial\\n';
  
  helpMessage += '\\n*🎯 Popular Commands:*\\n';
  // Show top 3 most used commands
  const popularCommands = Array.from(commandUsage.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cmd]) => '• ' + cmd + '\\n')
    .join('');
  
  helpMessage += popularCommands || '• ' + prefix + 'animeme\\n• ' + prefix + 'quote\\n• ' + prefix + 'recommend\\n';
  
  helpMessage += '\\n💡 *Tip:* Use ' + prefix + 'help <command> for detailed information about any command!';
  
  await client.sendMessage(message.from, helpMessage);
}

async function showCommandHelp(message, client, prefix, commandName) {
  const enabledPlugins = pluginService.listPlugins().filter(p => p.enabled);
  const command = commandName.toLowerCase();
  
  // Find plugin that handles this command
  const plugin = enabledPlugins.find(p => 
    p.code.includes(prefix + command) || 
    p.name.toLowerCase().includes(command)
  );
  
  if (!plugin) {
    await client.sendMessage(message.from, 
      '❌ Command "' + command + '" not found.\\n\\n' +
      'Use ' + prefix + 'commands to see all available commands.\\n' +
      'Or use ' + prefix + 'help for general assistance.'
    );
    return;
  }
  
  let helpMessage = '📖 *Command Help: ' + prefix + command + '*\\n\\n';
  helpMessage += '*Plugin:* ' + plugin.name + '\\n';
  helpMessage += '*Category:* ' + plugin.category + '\\n';
  helpMessage += '*Description:* ' + plugin.description + '\\n';
  helpMessage += '*Version:* ' + plugin.version + '\\n\\n';
  
  // Extract usage examples from plugin code
  const usageExamples = extractUsageExamples(plugin.code, prefix);
  if (usageExamples.length > 0) {
    helpMessage += '*Usage Examples:*\\n';
    usageExamples.forEach(example => {
      helpMessage += '• ' + example + '\\n';
    });
    helpMessage += '\\n';
  }
  
  // Add common usage patterns
  helpMessage += '*Common Usage:*\\n';
  helpMessage += '• ' + prefix + command + ' - Basic usage\\n';
  
  if (command.includes('recommend')) {
    helpMessage += '• ' + prefix + command + ' action - Get action recommendations\\n';
    helpMessage += '• ' + prefix + command + ' romance - Get romance recommendations\\n';
  }
  
  helpMessage += '\\n⚡ *Status:* ' + (plugin.enabled ? '✅ Enabled' : '❌ Disabled');
  
  await client.sendMessage(message.from, helpMessage);
}

async function showAllCommands(message, client, prefix) {
  const enabledPlugins = pluginService.listPlugins().filter(p => p.enabled);
  const pluginsByCategory = {};
  
  enabledPlugins.forEach(plugin => {
    if (!pluginsByCategory[plugin.category]) {
      pluginsByCategory[plugin.category] = [];
    }
    pluginsByCategory[plugin.category].push(plugin);
  });
  
  let commandsMessage = '📋 *All Available Commands* 📋\\n\\n';
  
  for (const category in pluginsByCategory) {
    commandsMessage += '*' + category.charAt(0).toUpperCase() + category.slice(1) + ':*\\n';
    pluginsByCategory[category].forEach(plugin => {
      const mainCommand = extractMainCommand(plugin.code, prefix);
      if (mainCommand) {
        commandsMessage += '• ' + mainCommand + ' - ' + plugin.description + '\\n';
      }
    });
    commandsMessage += '\\n';
  }
  
  commandsMessage += '🔧 *Utility Commands:*\\n';
  commandsMessage += '• ' + prefix + 'help - Show help\\n';
  commandsMessage += '• ' + prefix + 'commands - This command list\\n';
  commandsMessage += '• ' + prefix + 'stats - Bot statistics\\n';
  commandsMessage += '• ' + prefix + 'tutorial - Usage tutorial\\n';
  
  commandsMessage += '\\n📊 Total: ' + (enabledPlugins.length + 4) + ' commands available';
  
  // Split long messages if needed
  if (commandsMessage.length > 16000) {
    const parts = splitMessage(commandsMessage, 16000);
    for (const part of parts) {
      await client.sendMessage(message.from, part);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between messages
    }
  } else {
    await client.sendMessage(message.from, commandsMessage);
  }
}

async function showBotStats(message, client, prefix) {
  const enabledPlugins = pluginService.listPlugins().filter(p => p.enabled);
  const totalCommands = enabledPlugins.length;
  
  let statsMessage = '📊 *Bot Statistics* 📊\\n\\n';
  statsMessage += '*Total Commands:* ' + totalCommands + '\\n';
  
  // Category breakdown
  const categoryCount = {};
  enabledPlugins.forEach(plugin => {
    categoryCount[plugin.category] = (categoryCount[plugin.category] || 0) + 1;
  });
  
  statsMessage += '*By Category:*\\n';
  for (const category in categoryCount) {
    statsMessage += '• ' + category + ': ' + categoryCount[category] + '\\n';
  }
  
  // Command usage stats
  const totalUsage = Array.from(commandUsage.values()).reduce((sum, count) => sum + count, 0);
  statsMessage += '\\n*Command Usage:* ' + totalUsage + ' total requests\\n';
  
  // Top commands
  const topCommands = Array.from(commandUsage.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  if (topCommands.length > 0) {
    statsMessage += '*Top Commands:*\\n';
    topCommands.forEach(([cmd, count], index) => {
      statsMessage += (index + 1) + '. ' + cmd + ' (' + count + ')\\n';
    });
  }
  
  statsMessage += '\\n*Help Requests:* ' + helpRequests.size + ' users helped';
  
  await client.sendMessage(message.from, statsMessage);
}

async function showTutorial(message, client, prefix) {
  const tutorialMessage = '🎓 *Bot Tutorial* 🎓\\n\\n' +
    '*1. Getting Started:*\\n' +
    '   • Start with ' + prefix + 'help to see available commands\\n' +
    '   • Use ' + prefix + 'commands for a complete list\\n\\n' +
    '*2. Basic Usage:*\\n' +
    '   • Send ' + prefix + 'ping to test if bot is working\\n' +
    '   • Use ' + prefix + 'time to get current time\\n\\n' +
    '*3. Anime Commands:*\\n' +
    '   • ' + prefix + 'animeme - Get random anime meme\\n' +
    '   • ' + prefix + 'quote - Random anime quote\\n' +
    '   • ' + prefix + 'recommend <genre> - Anime recommendations\\n\\n' +
    '*4. Need Help?*\\n' +
    '   • ' + prefix + 'help <command> - Detailed command help\\n' +
    '   • Example: ' + prefix + 'help animeme\\n\\n' +
    '💡 *Tip:* All commands start with ' + prefix + ' and are case-insensitive!';
  
  await client.sendMessage(message.from, tutorialMessage);
}

// Helper functions
function extractUsageExamples(pluginCode, prefix) {
  const examples = [];
  const lines = pluginCode.split('\\n');
  
  for (const line of lines) {
    if (line.includes('message.body') && line.includes(prefix)) {
      const match = line.match(/message\.body\\s*[!=]+\\s*['"]([^'"]+)['"]/);
      if (match && match[1]) {
        examples.push(match[1]);
      }
    }
  }
  
  return examples.slice(0, 3); // Return max 3 examples
}

function extractMainCommand(pluginCode, prefix) {
  const lines = pluginCode.split('\\n');
  for (const line of lines) {
    if (line.includes('message.body') && line.includes(prefix)) {
      const match = line.match(/message\.body\\s*[!=]+\\s*['"](' + prefix + '[^'"]+)['"]/);
      if (match && match[1]) {
        return match[1];
      }
    }
  }
  return null;
}

function splitMessage(message, maxLength) {
  const parts = [];
  let currentPart = '';
  const lines = message.split('\\n');
  
  for (const line of lines) {
    if (currentPart.length + line.length + 1 > maxLength) {
      parts.push(currentPart);
      currentPart = line + '\\n';
    } else {
      currentPart += line + '\\n';
    }
  }
  
  if (currentPart) {
    parts.push(currentPart);
  }
  
  return parts;
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports.execute = help;
  module.exports.extractUsageExamples = extractUsageExamples;
  module.exports.extractMainCommand = extractMainCommand;
}`
};
