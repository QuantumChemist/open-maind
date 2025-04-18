import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';
import dotenv from 'dotenv';
import { Client, Message, GatewayIntentBits } from 'discord.js';
dotenv.config({ path: "./config/.env" });

const client: Client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once('ready', () => {
  console.log('Bot is online!');
});

client.on('messageCreate', async (message: Message) => {
  if (message.author.bot) return;
  if (message.mentions.users.has(client.user?.id || '')) {
    const prompt = message.content.replace(/<@!?\d+>/g, '').trim();
    try {
      const { text }: {text: string} = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        system: 'You are a friendly assistant!',
        prompt,
      });
      message.reply(text);
    } catch (error: any) {
      console.error('Error generating text:', error);
      message.reply('Sorry, I encountered an error while processing your request.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
