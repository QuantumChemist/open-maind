import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq'; // Ensure OPENAI_API_KEY environment variable is set

const { text } = await generateText({
  model: groq('llama-3.3-70b-versatile'),
  system: 'You are a friendly assistant!',
  prompt: 'Why is the sky blue?',
});

console.log(text);