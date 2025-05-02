"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ai_1 = require("ai");
const groq_1 = require("@ai-sdk/groq");
const discord_js_1 = require("discord.js");
const dotenv_1 = require("dotenv");
const interpreter_1 = require("./interpreter");
const tools_1 = require("./tools");
const weights_api_1 = require("./weights-api");
(0, dotenv_1.config)({ path: './config/.env' });
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
    ],
});
const interpreter = new interpreter_1.Interpreter();
const weightsApi = new weights_api_1.WeightsApi(process.env?.WEIGHTS_API_KEY || '');
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
            .filter((msg) => !msg.author.bot || client.user?.id === msg.author.id)
            .map((msg) => ({
            role: msg.author.id === message.author.id ? 'user' : 'assistant',
            content: msg.content,
        }))
            .reverse();
        try {
            const { text } = await (0, ai_1.generateText)({
                model: (0, groq_1.groq)('llama-3.3-70b-versatile'),
                system: botLore,
                messages: prompt,
            });
            for (const [toolName, toolFunction] of Object.entries(tools_1.tools)) {
                if (message.content.toLowerCase().includes(toolName.toLowerCase())) {
                    let toolResult;
                    if (toolName === 'plot') {
                        const match = message.content.match(/plot\s*\((.*?)\)/is);
                        if (!match) {
                            await message.reply('❌ Please provide data like: `plot({ xData: [1,2,3], yData: [4,5,6], title: "My Plot" })`');
                            return;
                        }
                        try {
                            const data = eval(`(${match[1]})`);
                            toolResult = await toolFunction(data);
                        }
                        catch (err) {
                            console.error(err);
                            await message.reply('⚠️ Could not parse your plot data. Make sure it’s valid JavaScript object syntax.');
                            return;
                        }
                    }
                    else {
                        toolResult = await toolFunction(message.content);
                    }
                    await message.reply({ content: toolResult, allowedMentions: { parse: [] } });
                    return;
                }
            }
            await interpreter.parse(text);
            await message.reply({ content: text, allowedMentions: { parse: [] } });
        }
        catch (error) {
            console.error('Error generating text:', error);
            await message.reply('Sorry, I encountered an error while processing your request.');
        }
    }
});
client.once('ready', () => {
    console.log(`${client.user?.username} is online!`);
});
client.login(process.env.DISCORD_TOKEN);
