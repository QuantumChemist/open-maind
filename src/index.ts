import { generateText } from 'ai';
import type { CoreMessage } from 'ai';
import { groq } from '@ai-sdk/groq';
import { Client, Message, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import { Interpreter } from './interpreter';
import { tools } from './tools';
import { WeightsApi } from './weights-api';

config({ path: './config/.env' });

const client: Client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const interpreter = new Interpreter();
const weightsApi = new WeightsApi(process.env?.WEIGHTS_API_KEY || '');

const botLore: string = `You are the friendly Discord chatbot assistant openmAInd with an open-minded mindset!
Your Discord tag is "<@1361438123317395516>". There is no need to mention your tag or reflect about it in your responses.
You can answer questions, provide information, and assist users in a helpful manner.
Your goal is to be as helpful as possible while maintaining a friendly demeanor.`;

client.on('messageCreate', async (message: Message) => {
  if (message.author.bot) return;

  if (message.mentions.users.has(client.user?.id || '')) {
    const messages = await message.channel.messages.fetch({ limit: 7 });
    const prompt: CoreMessage[] = messages
      .filter((msg) => !msg.author.bot || client.user?.id === msg.author.id)
      .map(
        (msg) =>
          ({
            role: msg.author.id === message.author.id ? 'user' : 'assistant',
            content: msg.content,
          }) as CoreMessage
      )
      .reverse();

    try {
      const { text }: { text: string } = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        system: botLore,
        messages: prompt,
      });

      for (const [toolName, toolFunction] of Object.entries(tools)) {
        if (message.content.toLowerCase().includes(toolName.toLowerCase())) {
          let toolResult;

          if (toolName === 'plot') {
            const match = message.content.match(/plot\s*\((.*?)\)/is);
            if (!match) {
              await message.reply(
                '❌ Please provide data like: `plot({ xData: [1,2,3], yData: [4,5,6], title: "My Plot" })`'
              );
              return;
            }

            try {
              const data = eval(`(${match[1]})`);
              toolResult = await toolFunction(data);
            } catch (err) {
              console.error(err);
              await message.reply(
                '⚠️ Could not parse your plot data. Make sure it’s valid JavaScript object syntax.'
              );
              return;
            }
          } else {
            toolResult = await toolFunction(message.content);
          }

          await message.reply({ content: toolResult, allowedMentions: { parse: [] } });
          return;
        }
      }

      await interpreter.parse(text);
      await message.reply({ content: text, allowedMentions: { parse: [] } });
    } catch (error: any) {
      console.error('Error generating text:', error);
      await message.reply('Sorry, I encountered an error while processing your request.');
    }
  }
});

client.once('ready', () => {
  console.log(`${client.user?.username} is online!`);
});

client.login(process.env.DISCORD_TOKEN);
