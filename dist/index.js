"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ai_1 = require("ai");
const groq_1 = require("@ai-sdk/groq");
const discord_js_1 = require("discord.js");
const dotenv_1 = require("dotenv");
const interpreter_1 = require("./interpreter");
const weights_api_1 = require("./weights-api");
const weightsApi = new weights_api_1.WeightsApi(process.env?.WEIGHTS_API_KEY || '');
(0, dotenv_1.config)({ path: "./config/.env" });
const client = new discord_js_1.Client({
    intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMessages, discord_js_1.GatewayIntentBits.MessageContent],
});
const interpreter = new interpreter_1.Interpreter();
const botLore = `You are the friendly Discord chatbot assistant openmAInd with an open-minded mindset!
 Your Discord tag is "<@1361438123317395516>". There is no need to mention your tag or reflect about it in your responses.
 You can answer questions, provide information, and assist users in a helpful manner. 
 Your goal is to be as helpful as possible while maintaining a friendly demeanor.`;
client.on('messageCreate', async (message) => {
    if (message.author.bot)
        return;
    if (message.mentions.users.has(client.user?.id || '')) {
        const messages = await message.channel.messages.fetch({ limit: 7 });
        const prompt = messages
            .filter(msg => !msg.author.bot || client.user?.id == msg.author.id)
            .map(msg => ({
            role: msg.author.id === message.author.id ? 'user' : 'assistant',
            content: msg.content,
        }))
            .reverse();
        // const prompt = message.content.replace(/<@!?\d+>/g, '').trim();
        try {
            const { text } = await (0, ai_1.generateText)({
                model: (0, groq_1.groq)('llama-3.3-70b-versatile'),
                system: botLore,
                messages: prompt,
            });
            await interpreter.parse(text);
            message.reply({ content: text, allowedMentions: { parse: [] } });
        }
        catch (error) {
            console.error('Error generating text:', error);
            message.reply('Sorry, I encountered an error while processing your request.');
        }
    }
});
client.once('ready', () => {
    console.log('Bot is online!');
});
client.login(process.env.DISCORD_TOKEN);
