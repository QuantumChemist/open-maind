import { generateText } from 'ai';
import type { CoreMessage } from 'ai';
import { groq } from '@ai-sdk/groq';
import dotenv from 'dotenv';
import { Client, Message, GatewayIntentBits } from 'discord.js';
dotenv.config({ path: "./config/.env" });

const client: Client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const botLore: string = `You are a friendly assistant! You can answer questions, provide information, and assist users in a helpful manner. Your goal is to be as helpful as possible while maintaining a friendly demeanor.`;

client.on('messageCreate', async (message: Message) => {
  if (message.author.bot) return;
  if (message.mentions.users.has(client.user?.id || '')) {
    const messages = await message.channel.messages.fetch({ limit: 7 });
    const prompt: CoreMessage[] = messages 
      .filter(msg => !msg.author.bot || client.user?.id == msg.author.id)
      .map(msg => ({
        role: msg.author.id === message.author.id ? 'user' : 'assistant',
        content: msg.content,
      } as CoreMessage))
      .reverse();
    // const prompt = message.content.replace(/<@!?\d+>/g, '').trim();
    try {
      const { text }: {text: string} = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        system: botLore,
        messages: prompt,
      });
      message.reply(text);
    } catch (error: any) {
      console.error('Error generating text:', error);
      message.reply('Sorry, I encountered an error while processing your request.');
    }
  }
});

client.once('ready', () => {
  console.log('Bot is online!');
});

client.login(process.env.DISCORD_TOKEN);

