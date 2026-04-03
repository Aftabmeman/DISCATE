import { genkit } from 'genkit';
import { groq } from 'genkitx-groq';

export const ai = genkit({
  // Initialize with an empty plugins array or none, then use .use()
  // to ensure compatibility with community plugins.
});

ai.use(
  groq({
    apiKey: process.env.GROQ_API_KEY,
  })
);
